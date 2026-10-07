const test=require('node:test'),assert=require('node:assert/strict');
const F=require('../fluid-view'),G=require('../fluid-geometry'),M=require('../cochlea-model'),V=require('../response-view');
const close=(a,b,scale=1)=>assert.ok(Math.abs(a-b)<1e-11*Math.max(Math.abs(a),Math.abs(b),scale));
test('Analytic volume balance: rigid channel, phase reversal and exact apical cancellation',()=>{
 const g={x:[0,1,2],sweptArea:[2,2],svArea:[2,2,2],stArea:[4,4,4]};
 const r={frequency:1/(2*Math.PI),sourceAreaMm2:1e6,stapesDisplacement:2,real:[0,0],imag:[0,0]};
 const rigid=F.reconstruct(r,g);
 close(F.sample(rigid,'sv',1,Math.PI/2),-1);
 close(F.sample(rigid,'st',1,Math.PI/2),.5);
 const cancelling=F.reconstruct({...r,real:[-.5,-.5]},g);
 close(cancelling.flowImag[2],0);close(cancelling.flowImag[1],1);
 const phased=F.reconstruct({...r,imag:[1,0]},g);
 close(F.sample(phased,'sv',1,0),-1);
 close(F.sample(phased,'sv',1,Math.PI),1);
});
test('Actual model conserves cell volumes and opposite scala fluxes across frequencies',()=>{
 assert.equal(G.x.length,601);assert.ok(G.sweptArea.every(a=>a>0));assert.ok(G.svArea.every(a=>a>0));assert.ok(G.stArea.every(a=>a>0));
 for(const frequency of [50,100,1000,5000,20000])for(const activity of [0,.8]){
  const r=V.scaleResponse(M.solveForView({frequency,activity}),1e-8),f=F.reconstruct(r),w=2*Math.PI*frequency;
  close(f.flowImag[0],w*2.86e-6*1e-8,1e-25);
  const fluxScale=Math.max(...f.flowReal.map(Math.abs),...f.flowImag.map(Math.abs));
  for(let i=0;i<600;i++){
   close(f.flowReal[i+1]-f.flowReal[i],-w*G.sweptArea[i]*r.imag[i],fluxScale);
   close(f.flowImag[i+1]-f.flowImag[i],w*G.sweptArea[i]*r.real[i],fluxScale);
   close(f.sv.real[i]*G.svArea[i]+f.st.real[i]*G.stArea[i],0,fluxScale);
   close(f.sv.imag[i]*G.svArea[i]+f.st.imag[i]*G.stArea[i],0,fluxScale);
  }
  assert.ok(Number.isFinite(f.maxSpeed)&&f.maxSpeed>0);
  for(const x of [.001,.015,.032])close(F.sample(f,'sv',x,.7),-F.sample(f,'sv',x,.7+Math.PI),1e-12);
 }
});
