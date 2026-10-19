const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
// Exercise the real tour controller with DOM events, including a round trip through
// active comparison and custom oscillator settings. Rendering geometry is browser-tested.
test('Tour isolates its controls and restores laboratory inputs on exit',()=>{
 const nodes=new Map(),stations=[],previews=[];
 function element(id){if(nodes.has(id))return nodes.get(id);
  const e={value:'',hidden:false,disabled:false,open:false,textContent:'',dataset:{},attrs:{},listeners:{},classList:{toggle(){}},
   setAttribute(k,v){this.attrs[k]=v;},getAttribute(k){return this.attrs[k]??null;},removeAttribute(k){delete this.attrs[k];},
   addEventListener(k,f){(this.listeners[k]??=[]).push(f);},dispatchEvent(ev){for(const f of this.listeners[ev.type]||[])f(ev);},
   click(){this.onclick?.();this.dispatchEvent({type:'click'});},focus(){},append(child){if(child.dataset.tourStep!==undefined)stations.push(child);},
   closest(){return element(id+'-section');}};nodes.set(id,e);return e;
 }
 const original={mm:21.5,custom:true,values:['2','3','.4']};let learning=structuredClone(original),stops=0;
 for(const [id,v] of Object.entries({frequency:'5000',drive:'620','active-amplitude':'80'}))element(id).value=v;
 element('learning-bridge').open=true;element('mode-active').attrs['aria-pressed']='true';

 for(const mode of ['passive','active'])element('mode-'+mode).onclick=()=>{element('mode-active').attrs['aria-pressed']=String(mode==='active');};
 element('learn-defaults').onclick=()=>{learning.custom=false;learning.values=['1','1','.18'];};
 const context={document:{getElementById:element,querySelector:element,querySelectorAll(){return stations;},createElement(){return element(Symbol());},body:element('body')},
  CochleaPlayback:{pause(){stops++;}},Event:class{constructor(type){this.type=type;}},PanelLayout:{preview(value){previews.push(value);}},
  LearningView:{snapshot(){return structuredClone(learning);},restore(s){learning=s;},setCustom(v){learning.custom=v;}}};context.window=context;
 vm.runInNewContext(fs.readFileSync(require.resolve('../learning-tour.js'),'utf8'),context);
 element('study-tour').click();assert.equal(element('frequency').value,1000);assert.equal(element('mode-active').attrs['aria-pressed'],'false');assert.equal(element('view-menu').hidden,true);
 assert.deepEqual(Array.from(previews.at(-1)),['wave']);
 stations[3].click();assert.equal(learning.custom,true);assert.equal(element('learn-resonance-view').hidden,false);
 element('learn-defaults').click();assert.equal(learning.custom,true,'Reset must keep the exploration controls editable');
 element('tour-advanced').checked=true;element('tour-advanced').onchange();assert.equal(element('learn-resonance-view').hidden,false);
 stations[5].click();element('mode-active').click();element('frequency').value='200';element('drive').value='900';
 element('tour-next').click();
 assert.equal(previews.at(-1),null,'Exit restores the independent panel layout');assert.equal(element('view-menu').hidden,false);
 assert.equal(element('frequency').value,'5000');assert.equal(element('drive').value,'620');assert.equal(element('active-amplitude').value,'80');
 assert.equal(element('mode-active').attrs['aria-pressed'],'true');assert.deepEqual(learning,original);assert.equal(element('learning-bridge').open,true);assert.equal(stops,2);
});
