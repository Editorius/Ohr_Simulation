const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
test('Published text is valid UTF-8 without mojibake',()=>{
  for(const file of ['index.html','app.js','MODEL.md','CHANGELOG.md','tests/central-ui.test.cjs']) {
    const text=new TextDecoder('utf-8',{fatal:true}).decode(fs.readFileSync(path.join(root,file)));
    assert.doesNotMatch(text,/[\u00c2\u00c3]|\u00e2[\u0080-\u00bf\u2000-\u2122]|\ufffd/,file);
  }
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.ok(html.includes('Innenohr \u00b7 Wanderwelle'));
  assert.ok(html.includes('Cochle\u00e4re Verst\u00e4rkung'));
});
test('All local scripts and styles use the release version and exist',()=>{
  const {version}=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const refs=[...html.matchAll(/(?:src|href)="([^"\s]+\.(?:js|css)(?:\?[^"\s]*)?)"/g)].map(m=>m[1]);
  assert.equal(refs.length,11);
  for(const ref of refs) {
    const [file,query]=ref.split('?');
    assert.equal(query,`v=${version}`,ref);
    assert.ok(fs.existsSync(path.join(root,file)),file);
  }
});
