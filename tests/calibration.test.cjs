const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const I=require('../input-calibration'),M=require('../cochlea-model'),V=require('../response-view');
test('Published HUMAN data, exact nodes, peak/RMS conversion and no extrapolation',()=>{
 assert.deepEqual(I.data.specimens,['TB18','TB19','TB20']);assert.equal(I.data.frequencyHz.length,48);
 for(let i=0;i<48;i++)assert.ok(Math.abs(I.transfer(I.data.frequencyHz[i]).velocityMPerSPa/I.data.velocityMPerSPa[i]-1)<1e-12);
 const r=I.fromSpl(1000,60),q=I.fromSpl(1000,40);
 assert.equal(r.pressureRmsPa,.02);assert.ok(Math.abs(r.stapesPeakM/q.stapesPeakM-10)<1e-12);
 assert.ok(Math.abs(r.stapesPeakM*Math.PI*2000/(r.pressurePeakPa*I.transfer(1000).velocityMPerSPa)-1)<1e-12);
 assert.ok(r.stapesPeakM>=r.minStapesPeakM&&r.stapesPeakM<=r.maxStapesPeakM);
 assert.throws(()=>I.fromSpl(20000,40));assert.throws(()=>I.fromSpl(1000,81));assert.throws(()=>I.fromSpl(NaN,40));
});
test('14 physical-source responses agree with Python; active reference is stable',()=>{
 const cases=JSON.parse(fs.readFileSync('research/absolute-amplitudes-2026-10-06/calibrated-fixtures.json'));
 for(const c of cases){const r=M.solveForView(c);let error=0,scale=0;
 for(let i=0;i<600;i++){error=Math.max(error,Math.hypot(r.real[i]-c.real[i],r.imag[i]-c.imag[i]));scale=Math.max(scale,Math.hypot(c.real[i],c.imag[i]));}
 assert.ok(error/scale<1e-8);assert.equal(r.sourceAreaMm2,2.86);assert.equal(r.unstable,false);assert.ok(r.maxRealPole<0);assert.ok(r.residual<1e-12);
 }
});
test('30–100 percent is visually monotone on one scale, passive and source stay fixed',()=>{
 for(const frequency of [50,1000,20000]){
 const pair={passive:M.solveForView({frequency}),active:M.solveForView({frequency,activity:.8})};
 const passiveOnly=V.prepareComparison(pair,1,false,100);
 let previous=0,axis,passive;
 for(let percent=30;percent<=100;percent++){
 const r=V.prepareComparison(pair,1,true,percent),height=r.result.peakAmplitude/r.referencePeak;
 assert.equal(r.referencePeak,passiveOnly.referencePeak);
 assert.deepEqual(r.passive,passiveOnly.passive);
 assert.ok(height>previous);previous=height;
 if(axis){assert.equal(r.referencePeak,axis);assert.deepEqual(r.passive,passive);}axis=r.referencePeak;passive=r.passive;
 assert.equal(r.result.stapesDisplacement,1e-9);assert.equal(r.result.peakX,pair.active.peakX);assert.ok(height<=1);
 }
 }
});
test('Global linear scale preserves physical values and is independent of drive, frequency and mode',()=>{
 const axis=V.amplitudeScale;
 assert.equal(axis.min,1e-12);assert.equal(axis.max,16e-6);
 assert.equal(axis.fraction(axis.min),0);assert.equal(axis.fraction(axis.max),1);
 assert.ok(Math.abs(axis.fraction((axis.min+axis.max)/2)-.5)<1e-15);
 assert.ok(axis.fraction(0)<0);assert.ok(axis.fraction(20e-6)>1);
 for(const frequency of [50,1000,20000]){
  const pair={passive:M.solveForView({frequency}),active:M.solveForView({frequency,activity:.8})};
  for(const drive of [.001,1,100])for(const active of [false,true])for(const percent of [30,100]){
   const r=V.prepareComparison(pair,drive,active,percent);
   assert.equal(r.referencePeak,16e-6);
   const expected=(active?pair.active:pair.passive).peakAmplitude*drive*1e-9*(active?percent/100:1);
   assert.ok(Math.abs(r.result.peakAmplitude/expected-1)<1e-12);
  }
 }
});

test('Detail maximum contains both responses and scales only with physical drive',()=>{
 const pair={passive:{peakAmplitude:10},active:{peakAmplitude:80}};
 const a=V.detailMaximum(pair,10),b=V.detailMaximum(pair,1);
 assert.ok(a>80e-8);assert.ok(Math.abs(a/b-10)<1e-12);
 assert.equal(a,V.detailMaximum({passive:pair.active,active:pair.passive},10));
 assert.ok(V.detailMaximum(pair,0)>0);
});
