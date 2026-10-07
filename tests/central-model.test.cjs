const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const E=require('../cochlea-model'),A=require('../numerics'),V=require('../response-view');
test('18 central B complex responses agree with independent Python solvers',()=>{
 const cases=JSON.parse(fs.readFileSync('research/school-b-restored/fixtures.json','utf8'));
 for(const c of cases){const r=E.solveForView({frequency:c.frequency,activity:c.activity,sourceAreaMm2:4*Math.PI});let err=0,scale=0;
 for(let i=0;i<r.cells;i++){err=Math.max(err,Math.hypot(r.real[i]-c.real[i],r.imag[i]-c.imag[i]));scale=Math.max(scale,Math.hypot(c.real[i],c.imag[i]));}
 assert.ok(err/scale<1e-8,`${c.frequency} ${c.activity}: ${err/scale}`);assert.ok(r.residual<1e-12);assert.ok(r.phase.every(Number.isFinite));assert.equal(r.visibleLength,.0335);assert.equal(r.cells,600);assert.ok(r.warning.length);assert.equal(V.scaleResponse(r,0).peakAmplitude,0);
 assert.equal(r.computationalCells,600);assert.equal(r.unstable,c.activity===1.12);
 }
 assert.throws(()=>E.solveForView({frequency:1000,activity:.5}));
});
test('Real generated worker and fallback execute the central B solver',async()=>{
 for(const fallback of [false,true]){let source='',answer,error;const context={CochleaNumerics:A,CochleaModel:E,performance,setTimeout,atob,Blob:class{constructor(parts){source=parts.join('')}},URL:{createObjectURL:()=>'',revokeObjectURL(){}}};
 context.Worker=class{constructor(){if(fallback)throw Error('no worker')}postMessage(data){const w={performance,atob};w.self=w;w.postMessage=data=>this.onmessage({data});vm.runInNewContext(source,w);w.onmessage({data});}terminate(){}};
 vm.runInNewContext(fs.readFileSync('solver-client.js','utf8'),context);new context.SolverClient(v=>answer=v,e=>error=e).request({frequency:1000,activity:1.12});await new Promise(r=>setTimeout(r,50));assert.equal(error,undefined);assert.equal(answer.active.activity,1.12);assert.equal(answer.passive.activity,0);assert.ok(answer.active.peakAmplitude>answer.passive.peakAmplitude*20);
 }
});

test('Absolute displacement scales with the imposed 20–100 nm stapes amplitude',()=>{
 const r=E.solveForView({frequency:1000,activity:.56});
 const low=V.scaleResponse(r,20e-9),high=V.scaleResponse(r,100e-9);
 assert.ok(Math.abs(high.peakAmplitude/low.peakAmplitude-5)<1e-12);
 assert.ok(Math.abs(high.peakAmplitude*1e9/r.peakAmplitude-100)<1e-10);
});

test('Active display modulation preserves location, phase and passive physical response',()=>{
 const pair={passive:E.solveForView({frequency:1000,activity:0}),active:E.solveForView({frequency:1000,activity:1.12})};
 const original=JSON.stringify(pair),full=V.prepareComparison(pair,100,true,100),low=V.prepareComparison(pair,100,true,30);
 assert.equal(low.result.peakX,full.result.peakX);assert.deepEqual(low.result.phase,full.result.phase);assert.deepEqual(low.passive,full.passive);
 assert.ok(Math.abs(low.result.peakAmplitude/full.result.peakAmplitude-.3)<1e-12);
 for(let i=0;i<low.result.cells;i++){assert.ok(Math.abs(low.result.real[i]-full.result.real[i]*.3)<1e-12);assert.ok(Math.abs(low.result.imag[i]-full.result.imag[i]*.3)<1e-12);}
 assert.equal(low.referencePeak,full.referencePeak);assert.equal(low.passive.peakAmplitude/low.referencePeak,full.passive.peakAmplitude/full.referencePeak);
 assert.deepEqual(V.prepareComparison(pair,100,false,30).result,V.prepareComparison(pair,100,false,100).result);assert.equal(JSON.stringify(pair),original);
});
