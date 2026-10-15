/* Independent teaching oscillator. Dimensionless gain for constant force amplitude. */
(function(root){
 'use strict';
 function parameters(mm,mass=1,stiffness=1,zeta=.18){
  if(![mm,mass,stiffness,zeta].every(Number.isFinite)||mm<0||mm>33.5||mass<=0||stiffness<=0||zeta<=0)throw Error('Ungültige Modellparameter');
  // Greenwood place law as a teaching assignment, not a local solver eigenmode.
  const baseHz=165.4*(10**(2.1*(1-mm/33.5))-.88);
  const f0=baseHz*Math.sqrt(stiffness/mass);
  return {f0,baseHz,mass,stiffness,zeta,resonanceHz:zeta<Math.SQRT1_2?f0*Math.sqrt(1-2*zeta*zeta):0};
 }
 function response(frequency,p){
  if(!Number.isFinite(frequency)||frequency<0)throw Error('Ungültige Frequenz');
  const r=frequency/p.f0,a=p.stiffness*(1-r*r),b=p.stiffness*2*p.zeta*r;
  return {amplitude:1/Math.hypot(a,b),phase:Math.atan2(b,a)};
 }
 const api={parameters,response};if(typeof module!=='undefined')module.exports=api;root.LearningModel=api;
})(globalThis);
