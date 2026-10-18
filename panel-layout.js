(function(root){
  'use strict';
  const ids=['wave','learning','amplitude','anatomy'];
  const names={learning:'Schwingungsmodell',wave:'Wanderwelle',amplitude:'Auslenkung',anatomy:'Cochlea'};
  const key='cochlea-panel-layout-v1';
  function sanitize(value){
    const order=Array.isArray(value?.order)?[...new Set(value.order.filter(id=>ids.includes(id)))]:[];
    return {order:[...order,...ids.filter(id=>!order.includes(id))],hidden:ids.filter(id=>Array.isArray(value?.hidden)&&value.hidden.includes(id))};
  }
  function move(state,id,before){
    const order=state.order.filter(x=>x!==id);
    const index=before===null?order.length:order.indexOf(before);
    if(!ids.includes(id)||index<0)return state;
    order.splice(index,0,id);return {order,hidden:[...state.hidden]};
  }
  if(typeof module!=='undefined')module.exports={sanitize,move};
  if(!root.document)return;
  const $=id=>document.getElementById(id),stack=$('view-stack'),options=$('view-options');
  const panels=Object.fromEntries(ids.map(id=>[id,stack.querySelector(`[data-view="${id}"]`)]));
  let state=sanitize(null),drag=null,temporary=null;
  try{state=sanitize(JSON.parse(localStorage.getItem(key)));}catch{}
  const line=document.createElement('div');line.className='panel-drop-line';line.hidden=true;document.body.append(line);
  function announce(text){$('layout-announcement').textContent=text;}
  function save(){try{localStorage.setItem(key,JSON.stringify(state));}catch{announce('Ansicht geändert. Speichern ist in diesem Browser nicht verfügbar.');}}
  function apply(){
    const shown=temporary||state;
    shown.order.forEach((id,i)=>{panels[id].style.order=i;panels[id].hidden=shown.hidden.includes(id);
      const row=options.querySelector(`[data-option="${id}"]`);row.style.order=i;row.querySelector('input').checked=!panels[id].hidden;
      row.querySelector('[data-up]').disabled=i===0;row.querySelector('[data-down]').disabled=i===ids.length-1;
    });
    $('views-empty').hidden=shown.hidden.length!==ids.length;
  }
  function shift(id,delta){if(temporary)return;const at=state.order.indexOf(id),next=at+delta;if(next<0||next>=ids.length)return;
    [state.order[at],state.order[next]]=[state.order[next],state.order[at]];apply();announce(names[id]+' verschoben.');save();}
  function finish(commit){if(!drag)return;const id=drag.id;
    if(commit&&drag.moved){state=move(state,id,drag.before);apply();announce(names[id]+' neu angeordnet.');save();}
    panels[id].classList.remove('panel-dragged');panels[id].style.transform='';stack.classList.remove('panels-dragging');line.hidden=true;drag=null;
  }
  function point(event){if(!drag||event.pointerId!==drag.pointer)return;
    if(Math.abs(event.clientY-drag.y)>5)drag.moved=true;if(!drag.moved)return;
    stack.classList.add('panels-dragging');panels[drag.id].classList.add('panel-dragged');
    panels[drag.id].style.transform=`translateY(${event.clientY-drag.y+window.scrollY-drag.scroll}px)`;
    const others=state.order.filter(id=>id!==drag.id&&!state.hidden.includes(id));
    drag.before=others.find(id=>{const r=panels[id].getBoundingClientRect();return event.clientY<r.top+r.height/2;})||null;
    const target=drag.before?panels[drag.before]:panels[others.at(-1)];
    if(target){const r=target.getBoundingClientRect();line.hidden=false;line.style.cssText=`top:${drag.before?r.top-5:r.bottom+5}px;left:${r.left}px;width:${r.width}px`;}
    if(event.clientY<60)window.scrollBy(0,-18);else if(event.clientY>window.innerHeight-60)window.scrollBy(0,18);
  }
  for(const id of ids){
    const row=document.createElement('div');row.className='view-option';row.dataset.option=id;
    row.innerHTML=`<label><input type="checkbox"> ${names[id]}</label><button type="button" data-up aria-label="${names[id]} nach oben">↑</button><button type="button" data-down aria-label="${names[id]} nach unten">↓</button>`;
    row.querySelector('input').onchange=e=>{finish(false);state.hidden=ids.filter(k=>k===id?!e.target.checked:state.hidden.includes(k));apply();save();};
    row.querySelector('[data-up]').onclick=()=>shift(id,-1);row.querySelector('[data-down]').onclick=()=>shift(id,1);options.append(row);
    const handle=document.createElement('button');handle.type='button';handle.className='panel-grip';handle.textContent='⠿';handle.setAttribute('aria-label',names[id]+' verschieben');handle.title='Ziehen oder mit Pfeiltasten verschieben';
    panels[id].querySelector('h2').prepend(handle);
    handle.addEventListener('pointerdown',e=>{if(e.button!==0||temporary)return;finish(false);drag={id,pointer:e.pointerId,y:e.clientY,scroll:window.scrollY,moved:false,before:null};handle.setPointerCapture(e.pointerId);});
    handle.addEventListener('pointermove',point);handle.addEventListener('pointerup',()=>finish(true));handle.addEventListener('pointercancel',()=>finish(false));handle.addEventListener('lostpointercapture',()=>finish(false));
    handle.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();shift(id,e.key==='ArrowUp'?-1:1);}});
  }
  window.addEventListener('blur',()=>finish(false));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){finish(false);$('view-menu').open=false;}});
  $('layout-reset').onclick=()=>{finish(false);state=sanitize(null);apply();save();announce('Alle Ansichten in ursprünglicher Reihenfolge eingeblendet.');};
  root.PanelLayout={preview(order){finish(false);temporary=order?sanitize({order,hidden:ids.filter(id=>!order.includes(id))}):null;apply();}};
  // Keep settings native-scrollable; no wheel or touch handlers intercept sliders.
  const settingsToggle=$('settings-toggle'),settingsContent=$('settings-content');
  const narrow=window.matchMedia('(max-width: 900px)');
  let settingsOpen=false;
  function showSettings(){
    settingsToggle.hidden=!narrow.matches;
    settingsContent.hidden=narrow.matches&&!settingsOpen;
    settingsToggle.setAttribute('aria-expanded',String(!settingsContent.hidden));
    settingsToggle.querySelector('span').textContent=settingsContent.hidden?'▾':'▴';
    if(settingsContent.hidden&&settingsContent.contains(document.activeElement))settingsToggle.focus();
  }
  settingsToggle.onclick=()=>{settingsOpen=!settingsOpen;showSettings();};
  settingsContent.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&narrow.matches){settingsOpen=false;showSettings();settingsToggle.focus();}
  });
  narrow.addEventListener('change',showSettings);
  showSettings();
  apply();
})(typeof window==='undefined'?globalThis:window);
