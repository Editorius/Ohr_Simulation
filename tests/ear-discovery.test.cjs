const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {entries}=require('../ear-discovery.js');
test('Every ear selection has an aligned local PNG and a complete explanation',()=>{
 assert.equal(entries.length,12);assert.equal(new Set(entries.map(e=>e.id)).size,12);
 assert.deepEqual(entries.filter(e=>e.region).map(e=>e.id),['outer','middle','inner']);
 for(const e of entries){
  const png=fs.readFileSync(path.join(__dirname,'../assets/ear',e.id+'.png'));
  assert.equal(png.readUInt32BE(16),e.size[0],e.id);assert.equal(png.readUInt32BE(20),e.size[1],e.id);
  const [l,t,r,b]=e.box;assert.ok(l>=0&&t>=0&&r<e.size[0]&&b<e.size[1]);
  const scale=480/(r-l);assert.ok(25+(b-t)*scale<440,'Complete ear remains in viewport');
  assert.ok(e.short&&e.detail&&e.key);assert.ok(e.region||e.hit);
 }
});
test('New default mode keeps all existing simulation controls and separate dialog entry',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 assert.match(html,/<body data-app-mode="discover">/);
 for(const id of ['study-discover','study-tour','study-lab','ear-detail','ear-detail-close','ear-more','ear-simulation','frequency','mode-active'])assert.equal(html.split('id="'+id+'"').length-1,1,id);
 const css=fs.readFileSync(path.join(__dirname,'../style.css'),'utf8');assert.match(css,/ear-grayscale\{filter:grayscale\(1\)\}/);
});

test('Parent selection exposes exactly the requested three structures and resets cleanly',()=>{
 const {parents,isAvailable}=require('../ear-discovery.js');
 const groups={outer:['pinna','canal','drum'],middle:['ossicles','oval','tube'],inner:['cochlea','nerve','balance']};
 for(const [region,expected] of Object.entries(groups)){
  assert.deepEqual(Object.keys(parents).filter(id=>isAvailable(id,region)),expected);
  for(const other of Object.keys(groups))assert.ok(isAvailable(other,region),'Parent switches always remain available');
 }
 for(const id of Object.keys(parents))assert.ok(isAvailable(id,null),'Overview clears all restrictions');
});
test('Pinna explanation has two illustrated views without chapter references or hyperlinks',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 const part=html.slice(html.indexOf('<section id="ear-localization"'),html.indexOf('</dialog>',html.indexOf('<section id="ear-localization"')));
 assert.doesNotMatch(part,/<a\b|vorigen Kapitel|vorherigen Kapitel|s\. weiter unten/i);
 for(const direction of ['horizontal','vertical']){
  assert.ok(part.includes('id="ear-local-'+direction+'"'));
  assert.ok(fs.existsSync(path.join(__dirname,'../assets/ear/localization-'+direction+'.png')));
 }
 assert.match(part,/Laufzeitunterschied/);assert.match(part,/Schallpegel/);assert.match(part,/Frequenzspektrum/);
});
