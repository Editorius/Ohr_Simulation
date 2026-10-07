// Controller/DOM contract test, not a browser layout or audio-device test.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
test('Central B controls, phase, zero drive, boundaries and reset remain coherent',()=>{
 const html=fs.readFileSync(require.resolve('../index.html'),'utf8'), elements=new Map(),queue=[];
 for(const match of html.matchAll(/\bid="([^"]+)"/g)) {
  const handlers={},attrs={},classes=new Set();
  elements.set(match[1],{value:'',checked:false,hidden:false,disabled:false,textContent:'',innerHTML:'',style:{},attrs,handlers,
   classList:{add:c=>classes.add(c),remove:c=>classes.delete(c),toggle:(c,v)=>v?classes.add(c):classes.delete(c)},
   setAttribute:(k,v)=>{attrs[k]=String(v);},removeAttribute:k=>{delete attrs[k];},addEventListener:(k,v)=>{handlers[k]=v;}});
 }
 const el=id=>{assert.ok(elements.has(id),id);return elements.get(id);};
 for(const [id,value] of Object.entries({frequency:1000,drive:800,'active-amplitude':100,speed:.5,volume:10}))el(id).value=String(value);
 for(const id of ['envelope'])el(id).checked=true;
 const steps=[50,-50].map(step=>({dataset:{frequencyStep:String(step)},handlers:{},addEventListener(k,fn){this.handlers[k]=fn;}}));
 const ctx={console,performance,atob,document:{hidden:false,getElementById:el,querySelectorAll:selector=>selector==='[data-frequency-step]'?steps:[],addEventListener(){}},window:{addEventListener(){}},setTimeout:fn=>queue.push(fn),requestAnimationFrame:()=>{},URL:{},Blob:class{}};
 vm.createContext(ctx);
 for(const file of ['numerics.js','cochlea-data.js','cochlea-model.js','solver-client.js','audio.js','response-view.js','fluid-geometry.js','fluid-view.js','app.js'])vm.runInContext(fs.readFileSync(require.resolve('../'+file),'utf8'),ctx);
 function flush(){while(queue.length)queue.shift()();}
 function change(id,value,event='change'){el(id).value=String(value);el(id).handlers[event]();flush();}
 function finite(){assert.match(el('amplitude-note').textContent,/Feste lineare Skala: 1 pm bis 16 µm/);assert.equal(elements.has('passive-detail'),false);for(const e of elements.values())assert.doesNotMatch(e.innerHTML+JSON.stringify(e.attrs),/NaN|Infinity/);}
 flush();finite();assert.match(el('status').textContent,/Berechnet/);
 assert.equal(elements.has('extended-frequency'),false);assert.equal(el('frequency').min,50);assert.equal(el('frequency').max,20000);
 assert.match(el('amplitude-svg').innerHTML,/Auslenkung \(µm\) · linear/);assert.equal(el('drive-value').textContent,'10 nm');assert.equal(el('active-amplitude').disabled,true);
 const detailAxis=()=>el('amplitude-svg').innerHTML.match(/<g id="maximum-detail-axis"[\s\S]*?<\/g>/)[0];
 const firstDetailAxis=detailAxis();
 const passiveBar=()=>el('amplitude-svg').innerHTML.match(/<rect id="maximum-passive-bar"[^>]+/)[0];
 const initialPassiveBar=passiveBar();
 assert.doesNotMatch(el('amplitude-svg').innerHTML,/id="maximum-detail-bar"/);

 const passivePlot=el('amplitude-svg').innerHTML;
 const passiveCurve=()=>el('amplitude-svg').innerHTML.match(/id="passive-amplitude-curve" d="([^"]+)"/)[1];
 const originalPassiveCurve=passiveCurve(),originalWave=el('wave-line').attrs.d,originalEnvelope=el('passive-envelope-top').attrs.d,originalNote=el('amplitude-note').textContent;
 change('active-amplitude',30,'input');finite();assert.equal(el('amplitude-svg').innerHTML,passivePlot);
 el('mode-active').handlers.click();finite();assert.notEqual(el('amplitude-svg').innerHTML,passivePlot);assert.equal(passiveCurve(),originalPassiveCurve);assert.notEqual(el('wave-line').attrs.d,originalWave);assert.equal(elements.has('passive-wave-line'),false);assert.equal(elements.has('input-mode'),false);assert.equal(el('passive-envelope-top').attrs.d,originalEnvelope);assert.equal(el('amplitude-note').textContent,originalNote);
 for(const gain of [30,50,100]){change('active-amplitude',gain,'input');finite();assert.equal(detailAxis(),firstDetailAxis);assert.equal(passiveBar(),initialPassiveBar);assert.match(el("amplitude-svg").innerHTML,/id="maximum-detail-bar"/);}
 assert.match(el('diagnostics').innerHTML,/100 %/);
 assert.equal(el('stapes-motion').attrs.transform,'translate(3 0)');assert.equal(el('round-window-motion').attrs.transform,'translate(-3 0)');assert.match(el('flow-arrows').innerHTML,/data-velocity/);
 const full=el('drive-value').textContent;change('drive',600,'input');finite();assert.equal(el('drive-value').textContent,'1 nm');assert.notEqual(el('drive-value').textContent,full);assert.notEqual(detailAxis(),firstDetailAxis);
 change('drive',-1,'input');assert.equal(el('drive').value,0);change('drive',1001,'input');assert.equal(el('drive').value,1000);
 const wave=el('wave-line').attrs.d;change('phase-position',90,'input');assert.notEqual(el('wave-line').attrs.d,wave);assert.match(el('flow-arrows').innerHTML,/62 H/);assert.match(el('flow-arrows').innerHTML,/158 H/);const arrows=Array.from(el('flow-arrows').innerHTML.matchAll(/M([\d.]+) (62|158) H([\d.]+)/g));assert.ok(arrows.length>0);
 assert.match(el('spiral-svg').innerHTML,/stroke-width=".8"/);assert.match(el('spiral-svg').innerHTML,/x="244"/);
 change('frequency',50);finite();change('frequency',20000);finite();assert.equal(el('drive-value').textContent,'100 nm');change('frequency',20001);assert.equal(el('input-error').hidden,false);
 el('reset').handlers.click();flush();finite();assert.equal(Number(el('active-amplitude').value),100);assert.equal(el('drive').value,800);assert.equal(el('drive-value').textContent,'10 nm');assert.equal(el('mode-passive').attrs['aria-pressed'],'true');
});
