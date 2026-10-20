const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
// Exercise the real tour controller with DOM events, including a round trip through
// active comparison and custom oscillator settings. Layout needs separate browser checks.
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
 stations[2].click();assert.equal(element('tour-tones').hidden,false);
 element('tour-tone-low').click();assert.equal(element('frequency').value,200);assert.equal(element('tour-tone-low').attrs['aria-pressed'],'true');
 element('tour-tone-high').click();assert.equal(element('frequency').value,5000);
 stations[4].click();assert.equal(element('tour-amplification').hidden,false);element('tour-active').click();assert.equal(element('mode-active').attrs['aria-pressed'],'true');
 assert.equal(element('tour-active').attrs['aria-pressed'],'true');
 stations[5].click();element('mode-active').click();element('frequency').value='200';element('drive').value='900';
 element('tour-next').click();
 assert.equal(previews.at(-1),null,'Exit restores the independent panel layout');assert.equal(element('view-menu').hidden,false);
 assert.equal(element('frequency').value,'5000');assert.equal(element('drive').value,'620');assert.equal(element('active-amplitude').value,'80');
 assert.equal(element('mode-active').attrs['aria-pressed'],'true');assert.deepEqual(learning,original);assert.equal(element('learning-bridge').open,true);assert.equal(stops,2);
});

test('Tour uses six explanatory stages without exercise or hidden-answer blocks',()=>{
 const {steps}=require('../learning-tour.js'),html=fs.readFileSync(require.resolve('../index.html'),'utf8');
 assert.equal(steps.length,6);
 for(const s of steps){assert.ok(s.intro.length>80);assert.ok(s.key);assert.equal(s.predict,undefined);assert.equal(s.observe,undefined);}
 assert.match(steps[5].intro,/nicht simuliert/);
 for(const id of ['tour-predict','tour-observe','tour-answer','tour-advanced'])assert.ok(!html.includes('id="'+id+'"'));
});
