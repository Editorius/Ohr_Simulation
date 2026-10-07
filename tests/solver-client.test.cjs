const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
function setup(blocked=false){
  let worker;class Worker{constructor(){if(blocked)throw Error('blocked');worker=this;this.jobs=[];}postMessage(j){this.jobs.push(j);}terminate(){}}
  const received=[],errors=[],context={Worker,Blob:class{},URL:{createObjectURL:()=>'',revokeObjectURL(){}},CochleaNumerics:{workerSource:''},CochleaModel:{workerSource:'',solveForView:o=>o},performance,setTimeout};
  vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../solver-client.js'),'utf8'),context);
  return {client:new context.SolverClient(v=>received.push(v),e=>errors.push(e)),worker,received,errors};
}
test('Only newest queued request is delivered; intermediate requests are replaced',()=>{
  const {client,worker,received}=setup();client.request({frequency:50});client.request({frequency:1000});client.request({frequency:20000});
  worker.onmessage({data:{id:1,pair:{frequency:50}}});assert.equal(received.length,0);assert.equal(worker.jobs.length,2);assert.equal(worker.jobs[1].options.frequency,20000);
  worker.onmessage({data:{id:3,pair:{frequency:20000}}});assert.equal(received[0].frequency,20000);
});
test('Invalid input invalidates a pending result and clears queued work',()=>{const {client,worker,received}=setup();client.request({});client.request({});client.invalidate();worker.onmessage({data:{id:1,pair:{}}});assert.equal(received.length,0);assert.equal(worker.jobs.length,1);});
test('Worker failure replays the newest request through fallback',async()=>{const {client,worker,received}=setup();client.request({frequency:50});client.request({frequency:4000,activity:.7});worker.onerror();await new Promise(r=>setTimeout(r,20));assert.equal(received.length,1);assert.equal(received[0].active.frequency,4000);});
test('Blocked worker still solves and reports results',async()=>{const {client,received}=setup(true);client.request({frequency:1000,activity:.7});await new Promise(r=>setTimeout(r,20));assert.equal(received[0].passive.activity,0);assert.equal(received[0].active.activity,.7);});
