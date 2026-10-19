const {test}=require('node:test'),assert=require('node:assert/strict');
const {parameters,response}=require('../learning-model.js');
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)));
test('Teaching oscillator: mass/stiffness scaling, static response and phase at eigenfrequency',()=>{
 const p=parameters(11.26);
 close(parameters(11.26,4).f0,p.f0/2);close(parameters(11.26,1,4).f0,p.f0*2);
 close(response(0,parameters(11.26,1,4)).amplitude,.25);
 close(response(p.f0,p).phase,Math.PI/2);
 close(response(p.f0,p).amplitude,1/(2*p.zeta));
 assert.ok(parameters(0).f0>parameters(20).f0&&parameters(20).f0>parameters(33.5).f0);
});
test('Computed maximum agrees with independent frequency sweep; strong damping has no nonzero peak',()=>{
 for(const zeta of [.05,.18,.5,.8]){
  const p=parameters(16,2,3,zeta);let best={f:0,a:0};
  for(let i=0;i<=10000;i++){const f=i*p.f0/5000,a=response(f,p).amplitude;if(a>best.a)best={f,a};}
  assert.ok(Math.abs(best.f-p.resonanceHz)<=p.f0/5000);
 }
});
test('Steady harmonic solution satisfies force balance independently of closed-form amplitude',()=>{
 const p=parameters(14,1.5,2,.25),omega0=2*Math.PI*p.baseHz;
 const mass=p.mass,stiffness=p.stiffness*omega0**2,damping=2*p.zeta*Math.sqrt(mass*stiffness),force=omega0**2;
 for(const f of [50,1000,20000]){
  const a=response(f,p),w=2*Math.PI*f;
  for(const phase of [0,.7,1.8,3]){
   const q=phase-a.phase,y=a.amplitude*Math.cos(q),v=-w*a.amplitude*Math.sin(q),acc=-w*w*y;
   close(mass*acc+damping*v+stiffness*y,force*Math.cos(phase));
  }
 }
});
test('Invalid inputs rejected and supported extremes remain finite',()=>{
 for(const mm of [-1,34,NaN])assert.throws(()=>parameters(mm));
 for(const mm of [0,33.5])for(const mass of [.25,4])for(const stiffness of [.25,4])for(const zeta of [.05,.8])for(const f of [50,20000]){
  const r=response(f,parameters(mm,mass,stiffness,zeta));assert.ok(Number.isFinite(r.amplitude)&&Number.isFinite(r.phase));
 }
});

test('Dimensional values and dynamic bounds agree with the physical frequency law',()=>{
 const M=require('../learning-model.js'),d=require('../learning-profiles.js');
 for(const i of [0,200,599]){
  const mm=d.xMm[i],p=M.parameters(mm);
  assert.ok(Math.abs(p.massKg/d.massKgPer1mm[i]-1)<1e-10);
  close(p.stiffnessNm,d.stiffnessNPerMPer1mm[i]);
  close(p.f0,Math.sqrt(d.stiffnessNPerMPer1mm[i]/d.massKgPer1mm[i])/(2*Math.PI));

 }
 for(const value of [1e-7,1,1e7]){const axis=M.amplitudeAxis(value);assert.ok(axis.maximum>value);assert.ok(value/axis.factor>=1&&value/axis.factor<10);}
});

test('Qualitative fixed-damping curves retain unit peaks and the expected frequency shifts',()=>{
 const base=parameters(11.26,1,1,.08),heavy=parameters(11.26,4,1,.08),stiff=parameters(11.26,1,4,.08);
 close(heavy.resonanceHz,base.resonanceHz/2);close(stiff.resonanceHz,base.resonanceHz*2);
 for(const p of [base,heavy,stiff]){
  const peak=response(p.resonanceHz,p).amplitude;
  close(response(p.resonanceHz,p).amplitude/peak,1);
  assert.ok(response(p.resonanceHz*.9,p).amplitude<peak);
  assert.ok(response(p.resonanceHz*1.1,p).amplitude<peak);
 }
});

test('Fixed rails prevent runaway values and constrain the actual resonance peak',()=>{
 const M=require('../learning-model.js');
 for(const mm of [0,11.26,25,33.5]){
  let state=M.constrain(mm,1,1);
  for(let i=0;i<200;i++)for(const kind of ['mass','stiffness']){
   const other=kind==='mass'?'stiffness':'mass',previous=state[other];
   state=M.constrain(mm,kind==='mass'?(i%2?1e-30:1e30):state.mass,kind==='stiffness'?(i%2?1e-30:1e30):state.stiffness,kind);
   close(state[other],previous);
   const p=M.parameters(mm,state.mass,state.stiffness,M.teachingZeta);
   assert.ok(p.resonanceHz>=50-1e-7&&p.resonanceHz<=20000+1e-7);
   for(const k of ['mass','stiffness']){const r=M.rails(mm,k);assert.ok(state[k]>=r[0]*(1-1e-12)&&state[k]<=r[1]*(1+1e-12));}
  }
  const b=M.local(mm),mass=M.massRange[1]/b.massKg;
  close(M.parameters(mm,mass,M.bounds(mm,mass,1,'stiffness')[0],M.teachingZeta).resonanceHz,50);
  const light=M.massRange[0]/b.massKg;
  close(M.parameters(mm,light,M.bounds(mm,light,1,'stiffness')[1],M.teachingZeta).resonanceHz,20000);
 }
});
