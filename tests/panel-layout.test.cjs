const {test}=require('node:test'),assert=require('node:assert/strict');
const {sanitize,move}=require('../panel-layout.js');
test('Layout storage sanitizes duplicates, unknown IDs and missing views',()=>{
 assert.deepEqual(sanitize({order:['anatomy','anatomy','unknown'],hidden:['wave','unknown']}),{order:['anatomy','wave','amplitude'],hidden:['wave']});
 assert.deepEqual(sanitize(null),{order:['wave','amplitude','anatomy'],hidden:[]});
});
test('Reordering preserves visibility, supports first/last and rejects invalid moves',()=>{
 const state={order:['wave','amplitude','anatomy'],hidden:['amplitude']};
 assert.deepEqual(move(state,'anatomy','wave'),{order:['anatomy','wave','amplitude'],hidden:['amplitude']});
 assert.deepEqual(move(state,'wave',null),{order:['amplitude','anatomy','wave'],hidden:['amplitude']});
 assert.deepEqual(move(state,'bad',null),state);
 assert.deepEqual(state.order,['wave','amplitude','anatomy']);
});
