(function(root){
 'use strict';
 const steps=[
  {title:'Wo reagiert die BM auf hohe und tiefe Töne?',panels:['wave'],intro:'Beginne mit der passiven Cochlea. Verändere zunächst nur die Frequenz.',predict:'Liegt das Maximum bei einem hohen Ton näher an der Basis oder am Apex?',observe:'Vergleiche 200 Hz, 1 000 Hz und 5 000 Hz. Spiele die Wanderwelle ab und beobachte die rote Linie mit Punkt: Sie zeigt den Ort des globalen Hüllkurvenmaximums. Die Klammer bezeichnet nur den vergrößerten Lupenausschnitt.',explain:'Hohe Frequenzen erreichen ihr Maximum näher an der Basis, tiefe weiter in Richtung Apex. Die Position hängt von der Frequenz ab. Die Hüllkurve beschreibt die maximale Auslenkung an jedem Ort; ihr globales Maximum ist rot markiert. Es bleibt während einer Schwingungsperiode am selben Ort, obwohl sich die momentane Wellenform bewegt.'},
  {title:'Wo liegt dieser Ort in der Cochlea?',panels:['wave','anatomy'],intro:'Verbinde die entrollte Darstellung mit der gewundenen Anatomie.',predict:'Welche Stelle im 3D-Modell entspricht der Basis der entrollten Cochlea?',observe:'Wähle zwei Frequenzen. Drehe das 3D-Modell und vergleiche die rote Markierung mit der entrollten Ansicht und der Entfernung ab Basis.',explain:'Beide Darstellungen verwenden denselben berechneten Maximalort auf der Modellkoordinate 0–33,5 mm. Die Zuordnung zur anatomischen Oberfläche ist näherungsweise.'},
  {title:'Warum kann ein BM-Abschnitt schwingen?',panels:['wave','learning'],intro:'Wir vereinfachen einen kleinen Abschnitt der Basilarmembran zu einem Feder-Masse-Schwinger.',predict:'Welche Eigenschaften des Gewebes könnten durch Feder und Masse ersetzt werden?',observe:'Verfolge den türkis markierten Abschnitt von der Cochlea zum Ersatzmodell. Verändere die Anregungsfrequenz. Das Ersatzmodell übernimmt automatisch den Abschnitt am Wellenmaximum.',explain:'Die Feder beschreibt elastische Rückstellung, die Masse Trägheit. Die Flüssigkeit regt den Abschnitt an. Die örtlichen Modellwerte bestimmen die bevorzugte Frequenz dieses einzelnen Abschnitts. Im vollständigen Innenohr kommt die Flüssigkeitskopplung hinzu.'},
  {title:'Welcher Abschnitt reagiert auf welche Frequenz?',panels:['learning'],intro:'Untersuche jeweils eine Größe. Die Regler verändern ausschließlich das lokale Lernmodell.',predict:'Wandert das Maximum bei größerer Masse nach links oder rechts? Was erwartest du bei einer steiferen Feder?',observe:'Der Ausgangspunkt bleibt fest. Erhöhe nur die Masse und beobachte das Maximum. Setze zurück und erhöhe nur die Steifigkeit. Beschreibe die Verschiebung.',explain:'Mehr Masse verschiebt das Maximum zu tieferen Frequenzen; eine steifere Feder zu höheren. Die Animation zeigt jeweils die stärkste Schwingung in Zeitlupe.'},
  {title:'Wie wird daraus eine Wanderwelle?',panels:['wave','learning'],intro:'Übertrage die lokale Modellvorstellung auf die gesamte Basilarmembran.',predict:'Wo erwartest du eine starke Antwort auf hohe Frequenzen: im steiferen oder im nachgiebigeren Bereich?',observe:'Verändere die Anregungsfrequenz und beobachte das rote Wellenmaximum. Das Ersatzmodell folgt diesem Ort und übernimmt dessen Masse und Steifigkeit. Sein Resonanzmaximum muss wegen der fehlenden Flüssigkeitskopplung nicht der Anregungsfrequenz entsprechen.',explain:'Basal steifere Abschnitte passen zu höheren, apikal nachgiebigere zu niedrigeren Frequenzen. Für die Wanderwelle braucht es zusätzlich die räumliche Kopplung über die Flüssigkeit. Unabhängige Einzelschwinger allein erklären ihre Ausbreitung nicht. Türkis ist die Auswahl, Rot das Wellenmaximum.'},
  {title:'Was verändert die aktive Verstärkung?',panels:['wave','amplitude'],intro:'Optionale biologische Vertiefung: Vergleiche die passive mit der aktiven Modellantwort.',predict:'Erwartest du nur ein höheres Maximum oder auch eine veränderte räumliche Verteilung?',observe:'Wähle dieselbe Frequenz und Steigbügelanregung für beide Antworten. Schalte Aktiv/Passiv um. Beachte: Die Amplitudenachse wechselt ihren Bereich; vergleiche die Zahlenwerte.',explain:'Die aktive Antwort modelliert den Beitrag äußerer Haarzellen vereinfacht. Beurteile Höhe, Breite und Lage des Maximums anhand der berechneten Kurven. Das passive Feder-Masse-Ersatzmodell bildet diesen aktiven Prozess nicht ab.'}
 ];
 function presentation(index,advanced){const i=Math.max(0,Math.min(steps.length-1,index));return {...steps[i],index:i,advanced:advanced&&i>=3,custom:i===3};}
 if(typeof module!=='undefined')module.exports={steps,presentation};
 if(!root.document)return;
 const $=id=>document.getElementById(id);
 let touring=false,index=0,saved=null;
 const frequencySection=$('frequency').closest('section'),gainSection=$('mode-passive').closest('section'),audioSection=$('audio-toggle').closest('section');
 function change(id,value,event='input'){$(id).value=value;$(id).dispatchEvent(new Event(event,{bubbles:true}));}
 function render(focus=false){
  $('study-tour').disabled=false;$('study-lab').disabled=false;
  const s=presentation(index,$('tour-advanced').checked);document.body.dataset.studyMode=touring?'tour':'lab';
  $('study-tour').setAttribute('aria-pressed',String(touring));$('study-lab').setAttribute('aria-pressed',String(!touring));
  $('tour-guide').hidden=!touring;$('view-menu').hidden=touring;
  $('study-mode-note').textContent=touring?'Schrittweise entdecken · Vermuten, beobachten, erklären':'Frei beobachten, Ansichten auswählen und eigene Fragen untersuchen.';
  frequencySection.hidden=touring&&(index===3);gainSection.hidden=touring&&index!==5;audioSection.hidden=touring;
  document.querySelector('.sidebar').hidden=frequencySection.hidden&&gainSection.hidden&&audioSection.hidden;
  document.querySelector('.workspace').classList.toggle('study-wide',document.querySelector('.sidebar').hidden);
  window.LearningView?.showData?.(touring&&s.advanced);
  $('learn-resonance-view').hidden=false;
  document.querySelector('.learn-columns').classList.toggle('learn-single',false);
  $('reset').hidden=touring;
  $('learn-defaults').hidden=touring&&index!==3;
  $('learn-defaults').textContent=touring?'Parameter zurücksetzen':'Zur Ortsvorgabe';
  PanelLayout.preview(touring?s.panels:null);
  if(!touring)return;
  $('tour-title').textContent=s.title;$('tour-progress').textContent=`Station ${index+1} von ${steps.length}`;
  $('tour-intro').textContent=s.intro;$('tour-predict').textContent=s.predict;$('tour-observe').textContent=s.observe;$('tour-explain').textContent=s.explain;

  $('tour-answer').open=false;$('tour-back').disabled=index===0;$('tour-next').textContent=index===5?'Im Labor weiterforschen':'Weiter';
  document.querySelectorAll('[data-tour-step]').forEach((button,i)=>{if(i===index)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
  if(focus)$('tour-title').focus({preventScroll:true});
 }
 function enterStep(next){index=next;if(index<5)$('mode-passive').click();
  if(index===2||index===3||index===4){$('learn-defaults').click();LearningView.setCustom(index===3);$('learning-bridge').open=index===2;}
  render(true);
 }
 function enter(){if(touring)return;
  saved={frequency:$('frequency').value,active:$('mode-active').getAttribute('aria-pressed')==='true',drive:$('drive').value,gain:$('active-amplitude').value,learning:LearningView.snapshot(),bridge:$('learning-bridge').open};
  // Stop sound/playback before hiding their controls; no automatic sound on return.
  window.CochleaPlayback.pause();touring=true;$('view-menu').open=false;change('frequency',1000,'change');change('drive',800);change('active-amplitude',100);enterStep(0);
 }
 function leave(){if(!touring)return;window.CochleaPlayback.pause();touring=false;render();
  change('frequency',saved.frequency,'change');change('drive',saved.drive);change('active-amplitude',saved.gain);$(saved.active?'mode-active':'mode-passive').click();LearningView.restore(saved.learning);$('learning-bridge').open=saved.bridge;
  $('study-lab').focus({preventScroll:true});
 }
 steps.forEach((s,i)=>{const li=document.createElement('li'),b=document.createElement('button');b.type='button';b.textContent=String(i+1);b.title=s.title;b.setAttribute('aria-label',`Station ${i+1}: ${s.title}`);b.dataset.tourStep=i;b.onclick=()=>enterStep(i);li.append(b);$('tour-stations').append(li);});
 $('learn-defaults').addEventListener('click',()=>{if(touring&&index===3)LearningView.setCustom(true);});
 $('study-tour').onclick=enter;$('study-lab').onclick=leave;$('tour-back').onclick=()=>enterStep(Math.max(0,index-1));$('tour-next').onclick=()=>index===5?leave():enterStep(index+1);$('tour-advanced').onchange=()=>render();
 render();
})(typeof window==='undefined'?globalThis:window);
