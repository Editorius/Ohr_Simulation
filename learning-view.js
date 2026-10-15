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
 function update(){
  p=M.parameters(mm,Number($('learn-mass').value),Number($('learn-stiffness').value),Number($('learn-damping').value));answer=M.response(frequency,p);
  $('learn-place-value').textContent=fmt(mm,2)+' mm ab Basis';
  $('learn-mass-value').textContent=fmt(p.mass,2)+' ×';$('learn-stiffness-value').textContent=fmt(p.stiffness,2)+' ×';
  $('learn-damping-value').textContent=p.zeta<.15?'Gering':p.zeta<.4?'Mittel':'Stark';
  $('learn-state').textContent=custom?'Eigenes Modell':'Ortsvorgabe · vereinfachte Zuordnung';
  for(const id of ['learn-mass','learn-stiffness','learn-damping'])$(id).disabled=!custom;
  $('learn-explain').setAttribute('aria-pressed',String(!custom));$('learn-experiment').setAttribute('aria-pressed',String(custom));
  $('learn-frequency').textContent='Anregung: '+fmt(frequency)+' Hz · aus Kachel Anregung';
  $('learn-f0').textContent='Eigenfrequenz: '+fmt(p.f0)+' Hz';
  $('learn-resonance').textContent=p.resonanceHz?'Resonanzmaximum: '+fmt(p.resonanceHz)+' Hz':'Kein Resonanzmaximum bei f > 0';
  // Linear frequency axis expands to include the selected drive and the local peak.
  const maxF=Math.max(2*p.f0,frequency*1.15),peak=M.response(p.resonanceHz,p).amplitude;
  scale=Math.max(peak,answer.amplitude)*1.12;
  const X=f=>55+430*f/maxF,Y=a=>235-190*a/scale;
  const frequencies=Array.from({length:351},(_,i)=>i*maxF/350).concat(p.resonanceHz,frequency).sort((a,b)=>a-b);
  const curve=frequencies.map((f,i)=>(i?'L':'M')+X(f)+','+Y(M.response(f,p).amplitude)).join(' ');
  let s='<path d="M55 35V235H490" fill="none" stroke="#8da0a8"/>';
  for(let i=0;i<=4;i++){const f=maxF*i/4;s+=svgText(X(f)-12,255,fmt(f));}
  for(let i=0;i<=2;i++){const a=scale*i/2;s+=svgText(10,Y(a)+4,fmt(a,1));}
  s+=`<path d="${curve}" fill="none" stroke="#173d67" stroke-width="3"/><path d="M${X(p.f0)} 35V235" stroke="#697c85" stroke-dasharray="4 4"/>`;
  s+=`<path d="M${X(frequency)} ${Y(answer.amplitude)}V235" stroke="#147b80" stroke-width="2"/><circle cx="${X(frequency)}" cy="${Y(answer.amplitude)}" r="6" fill="#147b80"/>`;
  s+=svgText(60,22,'Relative Amplitude')+svgText(185,285,'Anregungsfrequenz f in Hz');
  $('learn-curve').innerHTML=s;mark();animateMass();
 }
 function animateMass(){
  const y=180-48*answer.amplitude/scale*Math.cos(phase-answer.phase);
  let spring='M180 40V53';for(let i=0;i<=12;i++)spring+=`L${180+(i===0||i===12?0:i%2?15:-15)} ${53+i*(y-70)/12}`;
  spring+=`L180 ${y}`;$('learn-spring').setAttribute('d',spring);$('learn-block').setAttribute('transform',`translate(0 ${y-180})`);
 }
 function defaults(){custom=false;for(const [id,value] of [['learn-mass',1],['learn-stiffness',1],['learn-damping',.18]])$(id).value=value;update();}
 $('learn-place').oninput=()=>{mm=Number($('learn-place').value);update();};
 for(const id of ['learn-mass','learn-stiffness','learn-damping'])$(id).oninput=update;
 $('learn-explain').onclick=defaults;$('learn-defaults').onclick=defaults;$('learn-experiment').onclick=()=>{custom=true;update();};
 $('learn-play').onclick=()=>{playing=!playing;$('learn-play').textContent=playing?'Pause':'Abspielen';$('learn-play').setAttribute('aria-pressed',String(playing));};
 wave.addEventListener('click',event=>{
  const matrix=wave.getScreenCTM();if(!matrix)return;const point=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse());
  const l=CochleaContour.layout;if(point.x<l.left||point.x>l.right||Math.abs(point.y-l.center)>100)return;
  mm=Math.max(0,Math.min(33.5,(point.x-l.left)/(l.right-l.left)*33.5));$('learn-place').value=mm;update();
 });
 window.LearningView={setFrequency(f){if(Number.isFinite(f)&&f>0){frequency=f;update();}},reset(){mm=11.26;$('learn-place').value=mm;phase=0;defaults();}};
 frame.addEventListener('load',mark);window.addEventListener('message',e=>{if(e.source===frame.contentWindow&&e.data?.type==='cochlea-ready')mark();});
 new MutationObserver(mark).observe(panel,{attributes:true,attributeFilter:['hidden']});
 function tick(now){if(playing&&!document.hidden&&!panel.hidden){phase=(phase+Math.min((now-last)/1000,.1)*Math.PI)% (2*Math.PI);animateMass();}last=now;requestAnimationFrame(tick);}
 defaults();requestAnimationFrame(tick);
})();
