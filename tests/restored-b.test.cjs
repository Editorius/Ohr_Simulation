const test=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
test('Mechanical arrays match the original B baseline hashes',()=>{
 const now=require('../cochlea-data'),baseline=require('./mechanical-baseline.json');
 for(const [key,hash] of Object.entries(baseline))assert.equal(crypto.createHash('sha256').update(now[key]).digest('hex'),hash,key);
 assert.equal(now.n,600);assert.equal(now.visible,600);assert.equal(now.computationalLength,.0335);
});
