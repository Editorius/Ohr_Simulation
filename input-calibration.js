/* Human measured piston-velocity reference. No extrapolation outside the data. */
(function(root,data){
  'use strict';
  const minHz=data.frequencyHz[0],maxHz=data.frequencyHz.at(-1);
  function transfer(f){
    if(!Number.isFinite(f)||f<minHz||f>maxHz)throw Error('Keine Eingangsmessdaten für diese Frequenz. Direkte Steigbügelanregung wählen.');
    let i=0;while(i<data.frequencyHz.length-2&&data.frequencyHz[i+1]<f)i++;
    const t=Math.log(f/data.frequencyHz[i])/Math.log(data.frequencyHz[i+1]/data.frequencyHz[i]);
    const logInterp=a=>Math.exp(Math.log(a[i])*(1-t)+Math.log(a[i+1])*t);
    return {velocityMPerSPa:logInterp(data.velocityMPerSPa),phaseCycles:data.phaseCycles[i]*(1-t)+data.phaseCycles[i+1]*t,
      minVelocityMPerSPa:logInterp(data.minVelocityMPerSPa),maxVelocityMPerSPa:logInterp(data.maxVelocityMPerSPa)};
  }
  function fromSpl(f,db){
    if(!Number.isFinite(db)||db<20||db>80)throw Error('Schalldruckpegel muss zwischen 20 und 80 dB SPL liegen.');
    const h=transfer(f),pressureRmsPa=20e-6*10**(db/20),pressurePeakPa=Math.SQRT2*pressureRmsPa;
    return {frequency:f,splDb:db,pressureRmsPa,pressurePeakPa,stapesPeakM:h.velocityMPerSPa*pressurePeakPa/(2*Math.PI*f),
      stapesPhaseRad:2*Math.PI*h.phaseCycles-Math.PI/2,
      minStapesPeakM:h.minVelocityMPerSPa*pressurePeakPa/(2*Math.PI*f),maxStapesPeakM:h.maxVelocityMPerSPa*pressurePeakPa/(2*Math.PI*f)};
  }
  const api={minHz,maxHz,transfer,fromSpl,data};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;root.CochleaInput=api;
})(globalThis,typeof module!=='undefined'&&module.exports?require('./human-input-data'):globalThis.HumanInputData);
