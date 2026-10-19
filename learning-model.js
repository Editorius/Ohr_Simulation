/* Independent teaching oscillator. Dimensionless gain for constant force amplitude. */
(function(root){
 'use strict';
 const profiles=typeof module!=='undefined'&&module.exports?require('./learning-profiles.js'):root.LearningProfiles;
 function local(mm){
  if(!Number.isFinite(mm)||mm<0||mm>33.5)throw Error('Ungültiger Ort');
  const x=profiles.xMm;let i=0;while(i<x.length-2&&x[i+1]<mm)i++;
  const t=Math.max(0,Math.min(1,(mm-x[i])/(x[i+1]-x[i])));
  const lerp=a=>a[i]+t*(a[i+1]-a[i]);
  return {massKg:lerp(profiles.massKgPer1mm),stiffnessNm:lerp(profiles.stiffnessNPerMPer1mm)};
 }
 function parameters(mm,mass=1,stiffness=1,zeta=.18){
  if(![mm,mass,stiffness,zeta].every(Number.isFinite)||mm<0||mm>33.5||mass<=0||stiffness<=0||zeta<=0)throw Error('Ungültige Modellparameter');
  const baseline=local(mm);
  const baseHz=Math.sqrt(baseline.stiffnessNm/baseline.massKg)/(2*Math.PI);
  const f0=baseHz*Math.sqrt(stiffness/mass);
  return {f0,baseHz,mass,stiffness,massKg:baseline.massKg*mass,stiffnessNm:baseline.stiffnessNm*stiffness,zeta,resonanceHz:zeta<Math.SQRT1_2?f0*Math.sqrt(1-2*zeta*zeta):0};
 }
 function response(frequency,p){
  if(!Number.isFinite(frequency)||frequency<0)throw Error('Ungültige Frequenz');
  const r=frequency/p.f0,a=p.stiffness*(1-r*r),b=p.stiffness*2*p.zeta*r;
  return {amplitude:1/Math.hypot(a,b),phase:Math.atan2(b,a)};
 }
 const sliderFactor=value=>10**value;
 const teachingZeta=.08, minHz=50, maxHz=20000;
 const peakFactor=1-2*teachingZeta**2;
 const massRange=[Math.min(...profiles.massKgPer1mm),Math.max(...profiles.massKgPer1mm)];
 // Minimal teaching extension below the historical stiffness profile to reach 50 Hz.
 const stiffnessRange=[Math.min(Math.min(...profiles.stiffnessNPerMPer1mm),massRange[1]*(2*Math.PI*minHz)**2/peakFactor),Math.max(...profiles.stiffnessNPerMPer1mm)];
 function rails(mm,kind){const p=local(mm),values=kind==='mass'?massRange:stiffnessRange,base=kind==='mass'?p.massKg:p.stiffnessNm;return values.map(v=>v/base);}
 function bounds(mm,mass,stiffness,kind){
  const base=parameters(mm,1,1,teachingZeta).resonanceHz, fixed=rails(mm,kind);
  const limits=kind==='mass'?[stiffness*(base/maxHz)**2,stiffness*(base/minHz)**2]:[mass*(minHz/base)**2,mass*(maxHz/base)**2];
  return [Math.max(fixed[0],limits[0]),Math.min(fixed[1],limits[1])];
 }
 const clamp=(v,limits)=>Math.max(limits[0],Math.min(limits[1],v));
 function constrain(mm,mass,stiffness,moved){
  mass=clamp(mass,rails(mm,'mass'));stiffness=clamp(stiffness,rails(mm,'stiffness'));
  if(moved==='mass')mass=clamp(mass,bounds(mm,mass,stiffness,'mass'));
  else stiffness=clamp(stiffness,bounds(mm,mass,stiffness,'stiffness'));
  return {mass,stiffness};
 }
 function amplitudeAxis(peak){const exponent=Math.floor(Math.log10(peak)),factor=10**exponent;return {exponent,factor,maximum:Math.ceil(peak*1.12/factor)*factor};}
 const api={parameters,response,sliderFactor,local,bounds,rails,constrain,teachingZeta,massRange,stiffnessRange,amplitudeAxis};if(typeof module!=='undefined')module.exports=api;root.LearningModel=api;
})(globalThis);
