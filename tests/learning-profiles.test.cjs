const {test}=require('node:test'),assert=require('node:assert/strict');
const p=require('../learning-profiles.js');
test('One-mm stiffness matches the dimensional exponential interval average',()=>{
 assert.equal(p.referenceLengthMm,1);
 for(let i=0;i<p.xMm.length;i++){
  const a=i?p.xMm[i-1]/33.5:0,b=p.xMm[i]/33.5,c=-3.6*Math.log(10);
  const expected=2000*(Math.exp(c*b)-Math.exp(c*a))/(c*(b-a))/33.5;
  assert.ok(Math.abs(p.stiffnessNPerMPer1mm[i]/expected-1)<1e-10);
 }
});
test('Dimensional mass profiles preserve the original relative distribution',()=>{
 assert.equal(p.massKgPer1mm.length,600);
 assert.ok(p.massKgPer1mm.every(v=>Number.isFinite(v)&&v>0));
 for(let i=0;i<600;i++)assert.ok(Math.abs(p.massKgPer1mm[i]/p.massKgPer1mm[0]-p.massRelative[i])<1e-10);
});
