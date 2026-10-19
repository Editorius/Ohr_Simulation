(function(){
 'use strict';
 const $=id=>document.getElementById(id),M=LearningModel,fmt=(n,d=0)=>n.toLocaleString('de-DE',{maximumFractionDigits:d});
 let currentMaximum=null,frequency=1000,mm=11.26,custom=false,playing=true,last=0,phase=0,p,answer,scale=1;
 const panel=$('learning-panel'),wave=$('wave-svg'),frame=$('anatomy-frame');
 const svgText=(x,y,t)=>`<text x="${x}" y="${y}">${t}</text>`;
 function mark(){
  const layout=CochleaContour.layout,x=layout.left+(layout.right-layout.left)*mm/33.5;
  $('learning-wave-marker').innerHTML=panel.hidden||(!custom&&currentMaximum===null)?'':`<path d="M${x} ${layout.center-28}v56" stroke="#147b80" stroke-width="3"/><circle cx="${x}" cy="${layout.center}" r="7" fill="white" stroke="#147b80" stroke-width="3"/>`;
  frame.contentWindow?.postMessage({type:'cochlea-learning',positionMm:mm,visible:!panel.hidden&&(custom||currentMaximum!==null)},'*');
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
 function showData(visible){const dialog=$('learn-depth');if(visible&&!dialog.open)dialog.showModal();else if(!visible&&dialog.open)dialog.close();}
 $('learn-depth-open').onclick=()=>showData(true);
 $('learn-depth-close').onclick=()=>showData(false);
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
 function update(moved){
  let mass=M.sliderFactor(Number($('learn-mass').value)),stiffness=M.sliderFactor(Number($('learn-stiffness').value));
  if(custom)({mass,stiffness}=M.constrain(mm,mass,stiffness,moved));
  for(const [id,kind,value] of [['learn-mass','mass',mass],['learn-stiffness','stiffness',stiffness]]){
   const fixed=M.rails(mm,kind),limits=M.bounds(mm,mass,stiffness,kind),el=$(id);
   const lo=Math.log10(fixed[0]),hi=Math.log10(fixed[1]);
   el.min=lo;el.max=hi;el.step='any';el.value=Math.log10(value);
   const percent=v=>Math.max(0,Math.min(100,100*(Math.log10(v)-lo)/(hi-lo)));
   el.style.setProperty('--allowed-start',percent(limits[0])+'%');
   el.style.setProperty('--allowed-end',percent(limits[1])+'%');
   el.title='Graue Bereiche sind für die aktuelle Kombination gesperrt (50–20.000 Hz).';
  }
  p=M.parameters(mm,M.sliderFactor(Number($('learn-mass').value)),M.sliderFactor(Number($('learn-stiffness').value)),.08);answer=M.response(p.resonanceHz,p);
  $('learn-place-value').textContent=!custom&&currentMaximum===null?'Kein darstellbares Wellenmaximum':'Position auf der BM: '+fmt(mm,2)+' mm ab Basis';
  const massText=(p.massKg*1e9).toLocaleString('de-DE',{maximumSignificantDigits:3})+' µg',stiffnessText=p.stiffnessNm.toLocaleString('de-DE',{maximumSignificantDigits:3})+' N/m';
  $('learn-mass').setAttribute('aria-valuetext',massText);$('learn-stiffness').setAttribute('aria-valuetext',stiffnessText);
  $('learn-mass-value').textContent=massText;$('learn-stiffness-value').textContent=stiffnessText;
  $('learn-columns').hidden=!custom&&currentMaximum===null;
  $('learn-state').textContent=custom?'Eigenes Modell · Ausgangspunkt fest':'Ortsvorgabe am Wellenmaximum';
  for(const id of ['learn-mass','learn-stiffness'])$(id).disabled=!custom;
  $('learn-explain').setAttribute('aria-pressed',String(!custom));$('learn-experiment').setAttribute('aria-pressed',String(custom));
  $('learn-experiment').disabled=!custom&&currentMaximum===null;
  $('learn-defaults').disabled=currentMaximum===null;
  bridge();
  $('learn-resonance').textContent='Stärkste Schwingung bei '+fmt(p.resonanceHz)+' Hz';
  // Fixed horizontal range while changing mass/stiffness: the peak moves visibly.
  const maxF=M.parameters(mm).f0>18000?40000:20000,peak=M.response(p.resonanceHz,p).amplitude;
  scale=peak;
  const X=f=>55+430*f/maxF,Y=a=>235-180*a/peak;
  const frequencies=Array.from({length:601},(_,i)=>i*maxF/600)
   .concat(Array.from({length:101},(_,i)=>p.resonanceHz*(.5+i/100))).filter(f=>f<=maxF).sort((a,b)=>a-b);
  const curve=frequencies.map((f,i)=>(i?'L':'M')+X(f)+','+Y(M.response(f,p).amplitude)).join(' ');
  let s='<path d="M55 35V235H490" fill="none" stroke="#8da0a8"/>';
  for(let i=0;i<=4;i++){const f=maxF*i/4;s+=svgText(X(f)-12,255,fmt(f/1000));}
  for(const value of [0,.5,1])s+=svgText(15,235-180*value+4,fmt(value,1));
  s+=`<path d="${curve}" fill="none" stroke="#173d67" stroke-width="3"/><path d="M${X(p.resonanceHz)} 55V235" stroke="#147b80" stroke-width="2"/><circle cx="${X(p.resonanceHz)}" cy="55" r="7" fill="#147b80" stroke="white" stroke-width="2"/>`;
  s+=svgText(60,22,'Relative Schwingungsamplitude')+svgText(185,285,'Frequenz in kHz');
  $('learn-curve').innerHTML=s;profileCharts();mark();animateMass();
 }
 function animateMass(){
  const y=180-32*answer.amplitude/scale*Math.cos(phase-answer.phase);
  let spring='M180 40V53';for(let i=0;i<=12;i++)spring+=`L${180+(i===0||i===12?0:i%2?15:-15)} ${53+i*(y-70)/12}`;
  spring+=`L180 ${y}`;$('learn-spring').setAttribute('d',spring);$('learn-block').setAttribute('transform',`translate(0 ${y-180})`);
 }
 function restoreSlider(id,value){const el=$(id);if(id!=='learn-damping'){el.min=-30;el.max=30;}el.value=value;}
 function defaults(){custom=false;if(currentMaximum!==null)mm=currentMaximum;for(const [id,value] of [['learn-mass',0],['learn-stiffness',0]])restoreSlider(id,value);update();}
 for(const id of ['learn-mass','learn-stiffness'])$(id).oninput=()=>update(id==='learn-mass'?'mass':'stiffness');
 $('learn-explain').onclick=defaults;$('learn-defaults').onclick=defaults;$('learn-experiment').onclick=()=>{if(currentMaximum===null)return;custom=true;update();};
 $('learn-play').onclick=()=>{playing=!playing;$('learn-play').textContent=playing?'Pause':'Abspielen';$('learn-play').setAttribute('aria-pressed',String(playing));};
 window.LearningView={showData,snapshot(){return {mm,custom,values:['learn-mass','learn-stiffness'].map(id=>$(id).value)};},restore(s){mm=s.mm;custom=s.custom;if(!custom){defaults();return;}['learn-mass','learn-stiffness'].forEach((id,i)=>restoreSlider(id,s.values[i]));update();},setCustom(value){if(!value){defaults();return;}custom=true;update();},setMaximum(value){currentMaximum=Number.isFinite(value)&&value>=0&&value<=33.5?value:null;if(!custom)defaults();},setFrequency(f){if(Number.isFinite(f)&&f>0){frequency=f;update();}},reset(){mm=11.26;phase=0;defaults();}};
 frame.addEventListener('load',mark);window.addEventListener('message',e=>{if(e.source===frame.contentWindow&&e.data?.type==='cochlea-ready')mark();});
 new MutationObserver(mark).observe(panel,{attributes:true,attributeFilter:['hidden']});
 function tick(now){if(playing&&!document.hidden&&!panel.hidden){phase=(phase+Math.min((now-last)/1000,.1)*Math.PI)% (2*Math.PI);animateMass();}last=now;requestAnimationFrame(tick);}
 defaults();requestAnimationFrame(tick);
})();
