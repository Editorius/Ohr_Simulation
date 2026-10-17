(function(){
 const api=window.CochleaLocation;
 window.addEventListener('message',event=>{
  if(event.source!==window.parent)return;
  if(event.data?.type==='cochlea-learning'){const mm=event.data.positionMm;api.setLearningPosition?.(event.data.visible===true&&Number.isFinite(mm)&&mm>=0&&mm<=33.5?mm:null);return;}
  if(event.data?.type!=='cochlea-maximum')return;
  const {positionMm,valid}=event.data;
  const ok=valid===true&&Number.isFinite(positionMm)&&positionMm>=0&&positionMm<=33.5;
  api.setMarkerVisible(false);
  if(ok){api.setMaximumPositionMm(positionMm);api.setMarkerVisible(true);}
 });
 window.parent.postMessage({type:'cochlea-ready'},'*');
})();
