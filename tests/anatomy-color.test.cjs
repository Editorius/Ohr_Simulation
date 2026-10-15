const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const crypto = require('node:crypto');
const d = JSON.parse(fs.readFileSync('anatomy/location-data.json', 'utf8'));
test('SV and vestibular recoloring preserves the complete original surface', () => {
 assert.deepEqual(d.meshes.sv.vertices, d.meshes.eq.vertices);
 const faces=[...d.meshes.sv.faces,...d.meshes.eq.faces].map(f=>f.join(',')).sort();
 assert.equal(faces.length,20008);
 assert.equal(new Set(faces).size,20008);
 assert.equal(crypto.createHash('sha256').update(JSON.stringify(faces)).digest('hex'),'6f752c5e3285a8e24a0584cb510fa7c0a8adb71ae23510377dc490fd63cec48d');
 assert.equal(d.colorPartition.uncoveredContourPoints,0);
 assert.equal(d.colorPartition.checkedContours,152);
});
test('Vestibular color has no enclosed disconnected islands', () => {
 const faces=d.meshes.eq.faces, edges=new Map(),adj=faces.map(()=>[]);
 faces.forEach((f,i)=>f.forEach((a,k)=>{
  const b=f[(k+1)%3],key=[a,b].sort((x,y)=>x-y).join(',');
  if(edges.has(key)){const j=edges.get(key);adj[i].push(j);adj[j].push(i);}else edges.set(key,i);
 }));
 const seen=new Set([0]),queue=[0];
 while(queue.length)for(const j of adj[queue.pop()])if(!seen.has(j)){seen.add(j);queue.push(j);}
 assert.equal(seen.size,faces.length);
});
