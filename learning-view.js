(function(){
 'use strict';
 const $=id=>document.getElementById(id),M=LearningModel,fmt=(n,d=0)=>n.toLocaleString('de-DE',{maximumFractionDigits:d});
 let frequency=1000,mm=11.26,custom=false,playing=true,last=0,phase=0,p,answer,scale=1;
 const panel=$('learning-panel'),wave=$('wave-svg'),frame=$('anatomy-frame');
 const svgText=(x,y,t)=>`<text x="${x}" y="${y}">${t}</text>`;
 function mark(){
  const layout=CochleaContour.layout,x=layout.left+(layout.right-layout.left)*mm/33.5;
  $('learning-wave-marker').innerHTML=panel.hidden?'':`<path d="M${x} ${layout.center-28}v56" stroke="#147b80" stroke-width="3"/><circle cx="${x}" cy="${layout.center}" r="7" fill="white" stroke="#147b80" stroke-width="3"/>`;
  frame.contentWindow?.postMessage({type:'cochlea-learning',positionMm:mm,visible:!panel.hidden},'*');
 }
 function bridge(){
  const point=t=>{const a=-.3+t*Math.PI*4.7,r=85*(1-t)+6;return [145+r*Math.cos(a),100+r*Math.sin(a)];};
  const path=Array.from({length:161},(_,i)=>{const q=point(i/160);return (i?'L':'M')+q.join(',');}).join(' ');
  $('bridge-spiral').setAttribute('d',path);$('bridge-spiral-line').setAttribute('d',path);
  const t=mm/33.5,q=point(t),x=20+260*t;
  $('bridge-spiral-marker').setAttribute('cx',q[0]);$('bridge-spiral-marker').setAttribute('cy',q[1]);
  $('bridge-flat-marker').setAttribute('d',`M${x} ${87-42*t}V${108+42*t}`);
  $('bridge-position').textContent=fmt(mm,2)+' mm ab Basis';
 }
 let dataVisible=false;
 function showData(visible){
  dataVisible=visible;
  $('learn-chart-title').textContent=visible?'Modellparameter':'Resonanzkurve';
  $('learn-data-toggle').setAttribute('aria-pressed',String(visible));
  $('learn-data-toggle').textContent=visible?'Resonanzkurve':'Modelldaten';
  $('learn-data-view').hidden=!visible;$('learn-resonance-content').hidden=visible;
  if(visible){$('learn-resonance-view').hidden=false;document.querySelector('.learn-columns').classList.remove('learn-single');}
 }
 function profileCharts(){
  const d=LearningProfiles;
  for(const [id,values,logarithmic] of [['learn-mass-chart',d.massKgPer1mm.map(v=>v*1e9),false],['learn-stiffness-chart',d.stiffnessNPerMPer1mm,true]]){
   const top=logarithmic?100:Math.ceil(Math.max(...values)/10)*10, X=x=>55+245*x/33.5;
   const Y=v=>logarithmic?45+40*(2-Math.log10(v)):205-160*v/top;
   let s='<path d="M55 35V205H300" fill="none" stroke="#29444b" stroke-width="1.5"/>';
   const ticks=logarithmic?[100,10,1,.1,.01]:[0,top/2,top];
   for(const v of ticks){const y=Y(v);s+=`<path d="M55 ${y}H300" stroke="#dce5eb"/><text x="48" y="${y+4}" text-anchor="end">${v.toLocaleString('de-DE',{maximumFractionDigits:4})}</text>`;}
   for(const x of [0,10,20,33.5])s+=`<path d="M${X(x)} 205v5" stroke="#29444b"/><text x="${X(x)}" y="225" text-anchor="middle">${fmt(x,1)}</text>`;
   s+=`<path d="${values.map((v,i)=>(i?'L':'M')+X(d.xMm[i])+','+Y(v)).join(' ')}" fill="none" stroke="#163b65" stroke-width="2.5"/>`;
   s+=`<path d="M${X(mm)} 35V205" stroke="#147b80" stroke-width="2" stroke-dasharray="4 3"/>`;
   s+=svgText(55,20,logarithmic?'Steifigkeit in N/m · log.':'Masse in µg · linear')+svgText(65,253,'Basis → Apex · Strecke in mm');
   $(id).innerHTML=s;
  }
 }
 $('learn-data-toggle').onclick=()=>showData(!dataVisible);
 function update(){
  let mass=M.sliderFactor(Number($('learn-mass').value)),stiffness=M.sliderFactor(Number($('learn-stiffness').value));
  if(custom){const [lo,hi]=M.bounds(mm,mass,stiffness,'stiffness');stiffness=Math.max(lo,Math.min(hi,stiffness));}
  for(const [id,kind,value] of [['learn-mass','mass',mass],['learn-stiffness','stiffness',stiffness]]){
   const limits=M.bounds(mm,mass,stiffness,kind),log=Math.log10(value),el=$(id);
   el.min=Math.min(Math.log10(limits[0]),log);el.max=Math.max(Math.log10(limits[1]),log);el.step='any';el.value=log;
  }
  p=M.parameters(mm,M.sliderFactor(Number($('learn-mass').value)),M.sliderFactor(Number($('learn-stiffness').value)),Number($('learn-damping').value));answer=M.response(frequency,p);
  $('learn-place-value').textContent=fmt(mm,2)+' mm ab Basis';
  const massText=(p.massKg*1e9).toLocaleString('de-DE',{maximumSignificantDigits:3})+' µg',stiffnessText=p.stiffnessNm.toLocaleString('de-DE',{maximumSignificantDigits:3})+' N/m';
  $('learn-mass').setAttribute('aria-valuetext',massText);$('learn-stiffness').setAttribute('aria-valuetext',stiffnessText);
  $('learn-mass-value').textContent=massText;$('learn-stiffness-value').textContent=stiffnessText;
  $('learn-damping-value').textContent=p.zeta<.15?'Gering':p.zeta<.4?'Mittel':'Stark';
  $('learn-state').textContent=custom?'Eigenes Modell':'Ortsvorgabe · lokaler Ersatzschwinger';
  for(const id of ['learn-mass','learn-stiffness','learn-damping'])$(id).disabled=!custom;
  $('learn-explain').setAttribute('aria-pressed',String(!custom));$('learn-experiment').setAttribute('aria-pressed',String(custom));
  $('learn-frequency').textContent='Anregung: '+fmt(frequency)+' Hz · aus Kachel Anregung';
  $('learn-f0').textContent='Eigenfrequenz: '+fmt(p.f0)+' Hz';
  $('learn-f0-summary').textContent=$('learn-f0').textContent;
  if(!custom&&(p.f0<50||p.f0>20000))$('learn-state').textContent+=' · außerhalb 50–20.000 Hz';bridge();
  $('learn-resonance').textContent=p.resonanceHz?'Resonanzmaximum: '+fmt(p.resonanceHz)+' Hz':'Kein Resonanzmaximum bei f > 0';
  // Linear frequency axis expands to include the selected drive and the local peak.
  const extent=Math.max(1.5*p.f0,frequency*1.1),power=10**Math.floor(Math.log10(extent/4)),step=[1,2,5,10].find(v=>v*power>=extent/4)*power;
  const maxF=Math.ceil(extent/step)*step,peak=M.response(p.resonanceHz,p).amplitude,axis=M.amplitudeAxis(Math.max(peak,answer.amplitude));
  scale=axis.maximum;
  const X=f=>55+430*f/maxF,Y=a=>235-190*a/scale;
  const frequencies=Array.from({length:351},(_,i)=>i*maxF/350).concat(p.resonanceHz,frequency).sort((a,b)=>a-b);
  const curve=frequencies.map((f,i)=>(i?'L':'M')+X(f)+','+Y(M.response(f,p).amplitude)).join(' ');
  let s='<path d="M55 35V235H490" fill="none" stroke="#8da0a8"/>';
  const kHz=maxF>=2000;
  for(let f=0;f<=maxF+step*.01;f+=step)s+=svgText(X(f)-12,255,fmt(kHz?f/1000:f,2));
  for(let i=0;i<=2;i++){const a=scale*i/2;s+=svgText(10,Y(a)+4,fmt(a/axis.factor,2));}
  s+=`<path d="${curve}" fill="none" stroke="#173d67" stroke-width="3"/><path d="M${X(p.f0)} 35V235" stroke="#697c85" stroke-dasharray="4 4"/>`;
  s+=`<path d="M${X(frequency)} ${Y(answer.amplitude)}V235" stroke="#147b80" stroke-width="2"/><circle cx="${X(frequency)}" cy="${Y(answer.amplitude)}" r="6" fill="#147b80"/>`;
  s+=svgText(60,22,'Amplitude / Referenzauslenkung'+(axis.exponent?' · ×10^'+axis.exponent:''))+svgText(185,285,'Anregungsfrequenz f in '+(kHz?'kHz':'Hz'));
  $('learn-curve').innerHTML=s;profileCharts();mark();animateMass();
 }
 function animateMass(){
  const y=180-48*answer.amplitude/scale*Math.cos(phase-answer.phase);
  let spring='M180 40V53';for(let i=0;i<=12;i++)spring+=`L${180+(i===0||i===12?0:i%2?15:-15)} ${53+i*(y-70)/12}`;
  spring+=`L180 ${y}`;$('learn-spring').setAttribute('d',spring);$('learn-block').setAttribute('transform',`translate(0 ${y-180})`);
 }
 function restoreSlider(id,value){const el=$(id);if(id!=='learn-damping'){el.min=-30;el.max=30;}el.value=value;}
 function defaults(){custom=false;for(const [id,value] of [['learn-mass',0],['learn-stiffness',0],['learn-damping',.18]])restoreSlider(id,value);update();}
 $('learn-place').oninput=()=>{mm=Number($('learn-place').value);update();};
 for(const id of ['learn-mass','learn-stiffness','learn-damping'])$(id).oninput=update;
 $('learn-explain').onclick=defaults;$('learn-defaults').onclick=defaults;$('learn-experiment').onclick=()=>{custom=true;update();};
 $('learn-play').onclick=()=>{playing=!playing;$('learn-play').textContent=playing?'Pause':'Abspielen';$('learn-play').setAttribute('aria-pressed',String(playing));};
 wave.addEventListener('click',event=>{
  const matrix=wave.getScreenCTM();if(!matrix)return;const point=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse());
  const l=CochleaContour.layout;if(point.x<l.left||point.x>l.right||Math.abs(point.y-l.center)>100)return;
  mm=Math.max(0,Math.min(33.5,(point.x-l.left)/(l.right-l.left)*33.5));$('learn-place').value=mm;update();
 });
 window.LearningView={showData,snapshot(){return {mm,custom,values:['learn-mass','learn-stiffness','learn-damping'].map(id=>$(id).value)};},restore(s){mm=s.mm;custom=s.custom;$('learn-place').value=mm;['learn-mass','learn-stiffness','learn-damping'].forEach((id,i)=>restoreSlider(id,s.values[i]));update();},setCustom(value){custom=value;update();},setFrequency(f){if(Number.isFinite(f)&&f>0){frequency=f;update();}},reset(){mm=11.26;$('learn-place').value=mm;phase=0;defaults();}};
 frame.addEventListener('load',mark);window.addEventListener('message',e=>{if(e.source===frame.contentWindow&&e.data?.type==='cochlea-ready')mark();});
 new MutationObserver(mark).observe(panel,{attributes:true,attributeFilter:['hidden']});
 function tick(now){if(playing&&!document.hidden&&!panel.hidden){phase=(phase+Math.min((now-last)/1000,.1)*Math.PI)% (2*Math.PI);animateMass();}last=now;requestAnimationFrame(tick);}
 defaults();requestAnimationFrame(tick);
})();
