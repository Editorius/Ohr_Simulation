(function(root){
 'use strict';
 const steps=[
  {title:'Schall bringt Flüssigkeit in Bewegung',panels:['wave'],intro:'Der Steigbügel bewegt sich am ovalen Fenster und regt die Flüssigkeit im Innenohr an. Das runde Fenster ermöglicht den nötigen Volumenausgleich. Die Animation zeigt diese Bewegung stark vergrößert und in Zeitlupe.',key:'Steigbügel → Flüssigkeitsbewegung'},
  {title:'Eine Welle läuft über die Basilarmembran',panels:['wave'],intro:'Die Flüssigkeitsbewegung versetzt die Basilarmembran in Schwingung. Eine Wanderwelle entsteht: Ihre Auslenkung wächst zunächst an und fällt hinter dem Maximum deutlich ab. Die Hüllkurve zeigt, wie groß die Schwingung an jedem Ort wird.',key:'Die rote Markierung zeigt das Maximum der Hüllkurve.'},
  {title:'Verschiedene Töne erreichen verschiedene Orte',panels:['wave','anatomy'],intro:'Hohe Töne erreichen ihr Maximum näher an der Basis, tiefe Töne weiter in Richtung Apex. Die rote Markierung zeigt denselben berechneten Ort in der entrollten Ansicht und in der gewundenen Cochlea. Die Tonvorgaben machen den Ortswechsel sichtbar.',key:'Hoher Ton → nahe der Basis · Tiefer Ton → Richtung Apex'},
  {title:'Die mechanischen Eigenschaften ändern sich',panels:['learning'],intro:'Die Basilarmembran besitzt entlang ihres Verlaufs unterschiedliche mechanische Eigenschaften. Ein einzelner Feder-Masse-Schwinger veranschaulicht deren Einfluss: Eine steifere Feder begünstigt höhere, eine größere Masse tiefere Resonanzfrequenzen. Die Regler lassen sich freiwillig ausprobieren; die Flüssigkeitskopplung des Innenohrs fehlt in diesem Ersatzmodell.',key:'Steifere Feder → höhere Frequenz · Größere Masse → tiefere Frequenz'},
  {title:'Das Innenohr verstärkt die Bewegung',panels:['wave','amplitude'],intro:'Äußere Haarzellen können die mechanische Bewegung verstärken. Die passive und die aktive Modellantwort zeigen ihren Einfluss auf die Auslenkung. Die Zahlen an den Achsen helfen beim Vergleich, denn der dargestellte Wertebereich kann wechseln.',key:'Äußere Haarzellen unterstützen die mechanische Antwort.'},
  {title:'Vom Schwingen zum Hören',panels:['anatomy'],intro:'Die Bewegung im Corti-Organ führt zur Auslenkung der Haarbündel. Innere Haarzellen wandeln den mechanischen Reiz in elektrische Signale um; über den Hörnerv gelangt die Information zum Gehirn. Dieser letzte Schritt wird hier erläutert, aber nicht simuliert.',key:'Mechanische Bewegung → elektrische Signale → Gehirn'}
 ];
 function presentation(index){const i=Math.max(0,Math.min(steps.length-1,index));return {...steps[i],index:i,custom:i===3};}
 if(typeof module!=='undefined')module.exports={steps,presentation};
 if(!root.document)return;
 const $=id=>document.getElementById(id);
 let touring=false,index=0,saved=null;
 const frequencySection=$('frequency').closest('section'),gainSection=$('mode-passive').closest('section'),audioSection=$('audio-toggle').closest('section');
 function change(id,value,event='input'){$(id).value=value;$(id).dispatchEvent(new Event(event,{bubbles:true}));}
 function render(focus=false){
  $('study-tour').disabled=false;$('study-lab').disabled=false;
  const s=presentation(index);document.body.dataset.studyMode=touring?'tour':'lab';
  $('study-tour').setAttribute('aria-pressed',String(touring));$('study-lab').setAttribute('aria-pressed',String(!touring));
  $('tour-guide').hidden=!touring;$('view-menu').hidden=touring;
  $('study-mode-note').textContent=touring?'Ein Rundgang durch die Funktionsweise des Innenohrs':'Frei beobachten, Ansichten auswählen und eigene Fragen untersuchen.';
  frequencySection.hidden=touring;gainSection.hidden=touring;audioSection.hidden=touring;
  document.querySelector('.sidebar').hidden=frequencySection.hidden&&gainSection.hidden&&audioSection.hidden;
  document.querySelector('.workspace').classList.toggle('study-wide',document.querySelector('.sidebar').hidden);

  $('learn-resonance-view').hidden=false;
  document.querySelector('.learn-columns').classList.toggle('learn-single',false);
  $('reset').hidden=touring;
  $('learn-defaults').hidden=touring&&index!==3;
  $('learn-defaults').textContent=touring?'Parameter zurücksetzen':'Zum aktuellen BM-Abschnitt';
  PanelLayout.preview(touring?s.panels:null);
  if(!touring)return;
  $('tour-title').textContent=s.title;$('tour-progress').textContent=`Schritt ${index+1} von ${steps.length}`;
  $('tour-intro').textContent=s.intro;$('tour-key').textContent=s.key;
  $('tour-tones').hidden=index!==2;$('tour-amplification').hidden=index!==4;
  syncChoices();

  $('tour-back').disabled=index===0;$('tour-next').textContent=index===5?'Zum Experimentierlabor':'Weiter';
  document.querySelectorAll('[data-tour-step]').forEach((button,i)=>{if(i===index)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
  if(focus)$('tour-title').focus({preventScroll:true});
 }
 function syncChoices(){
  for(const [id,f] of [['tour-tone-low',200],['tour-tone-mid',1000],['tour-tone-high',5000]])$(id).setAttribute('aria-pressed',String(Number($('frequency').value)===f));
  const active=$('mode-active').getAttribute('aria-pressed')==='true';
  $('tour-passive').setAttribute('aria-pressed',String(!active));$('tour-active').setAttribute('aria-pressed',String(active));
 }
 function enterStep(next){index=next;window.LearningView?.showData?.(false);$('mode-passive').click();
  $('learning-bridge').open=false;
  if(index===3){$('learn-defaults').click();LearningView.setCustom(true);}
  else LearningView.setCustom(false);
  if(index===4)change('frequency',1000,'change');
  if(steps[index].panels.includes('wave')&&$('animation-toggle').getAttribute('aria-pressed')!=='true')$('animation-toggle').click();
  render(true);
 }
 function enter(){if(touring)return;
  saved={envelope:$('envelope').checked,depth:$('learn-depth').open,frequency:$('frequency').value,active:$('mode-active').getAttribute('aria-pressed')==='true',drive:$('drive').value,gain:$('active-amplitude').value,learning:LearningView.snapshot(),bridge:$('learning-bridge').open};
  // Stop sound/playback before hiding their controls; no automatic sound on return.
  window.CochleaPlayback.pause();touring=true;if(!$('envelope').checked)$('envelope').click();$('view-menu').open=false;change('frequency',1000,'change');change('drive',800);change('active-amplitude',100);enterStep(0);
 }
 function leave(){if(!touring)return;window.CochleaPlayback.pause();touring=false;render();
  change('frequency',saved.frequency,'change');change('drive',saved.drive);change('active-amplitude',saved.gain);$(saved.active?'mode-active':'mode-passive').click();LearningView.restore(saved.learning);$('learning-bridge').open=saved.bridge;if($('envelope').checked!==saved.envelope)$('envelope').click();window.LearningView?.showData?.(saved.depth);
  $('study-lab').focus({preventScroll:true});
 }
 steps.forEach((s,i)=>{const li=document.createElement('li'),b=document.createElement('button');b.type='button';b.textContent=String(i+1);b.title=s.title;b.setAttribute('aria-label',`Station ${i+1}: ${s.title}`);b.dataset.tourStep=i;b.onclick=()=>enterStep(i);li.append(b);$('tour-stations').append(li);});
 $('learn-defaults').addEventListener('click',()=>{if(touring&&index===3)LearningView.setCustom(true);});
 $('study-tour').onclick=enter;$('study-lab').onclick=leave;$('tour-back').onclick=()=>enterStep(Math.max(0,index-1));$('tour-next').onclick=()=>index===5?leave():enterStep(index+1);
 for(const [id,f] of [['tour-tone-low',200],['tour-tone-mid',1000],['tour-tone-high',5000]])$(id).onclick=()=>{change('frequency',f,'change');syncChoices();};
 for(const mode of ['passive','active'])$('tour-'+mode).onclick=()=>{$('mode-'+mode).click();syncChoices();};
 root.InnerEarTour={leave};
 render();
})(typeof window==='undefined'?globalThis:window);
