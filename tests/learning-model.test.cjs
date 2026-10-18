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
  for(const kind of ['mass','stiffness']){
   const frequencies=M.bounds(mm,1,1,kind).map(v=>M.parameters(mm,kind==='mass'?v:1,kind==='stiffness'?v:1).f0).sort((a,b)=>a-b);
   close(frequencies[0],50);close(frequencies[1],20000);
  }
 }
 for(const value of [1e-7,1,1e7]){const axis=M.amplitudeAxis(value);assert.ok(axis.maximum>value);assert.ok(value/axis.factor>=1&&value/axis.factor<10);}
});
