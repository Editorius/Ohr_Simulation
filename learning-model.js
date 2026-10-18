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
 function bounds(mm,mass,stiffness,kind){
  const base=parameters(mm).f0;
  return kind==='mass'?[stiffness*(base/20000)**2,stiffness*(base/50)**2]:[mass*(50/base)**2,mass*(20000/base)**2];
 }
 function amplitudeAxis(peak){const exponent=Math.floor(Math.log10(peak)),factor=10**exponent;return {exponent,factor,maximum:Math.ceil(peak*1.12/factor)*factor};}
 const api={parameters,response,sliderFactor,local,bounds,amplitudeAxis};if(typeof module!=='undefined')module.exports=api;root.LearningModel=api;
})(globalThis);
