/* Pure response preparation for the view. The physical solution is never mutated. */
(function (root) {
  "use strict";
  function scaleResponse(r, k) {
    const out = { ...r };
    for (const key of [
      "real",
      "imag",
      "amplitude",
      "basePressure",
      "volumeFlow",
      "roundWindowFlow",
      "apexPressureComplex",
      "helicotremaFlow",
    ])
      if (Array.isArray(r[key])) out[key] = r[key].map((v) => v * k);
    for (const key of ["stapesDisplacement", "peakAmplitude", "fullPeakAmplitude", "apexPressure"])
      if (typeof r[key] === "number") out[key] = r[key] * k;
    for (const key of [
      "inputPower",
      "activePower",
      "dissipation",
      "localLoss",
      "shearLoss",
      "boundaryLoss",
    ])
      if (typeof r[key] === "number") out[key] = r[key] * k * k;
    return out;
  }
  function prepareComparison(pair, driveNm, activeMode, percent) {
    if(!Number.isFinite(driveNm)||driveNm<0||!Number.isFinite(percent))throw Error('Ungültige Amplitude.');
    const fraction = Math.min(100,Math.max(30,percent))/100;
    const passive = scaleResponse(pair.passive,driveNm*1e-9);
    const result = activeMode ? scaleResponse(pair.active,driveNm*1e-9*fraction) : passive;
    // Global physical display range, independent of every control and response.
    const referencePeak = amplitudeScale.max;
    passive.stapesDisplacement=driveNm*1e-9;result.stapesDisplacement=driveNm*1e-9;
    passive.normalized=false;result.normalized=false;
    return {passive,result,referencePeak};
  }
  const amplitudeScale = Object.freeze({
    min: 1e-12,
    max: 16e-6,
    ticks: Object.freeze([1e-12, 4e-6, 8e-6, 12e-6, 16e-6]),
    fraction: value => (value - 1e-12) / (16e-6 - 1e-12),
  });
  function detailMaximum(pair, driveNm) {
    // Both full responses define the range; mode and display percentage do not.
    const peak=Math.max(pair.passive.peakAmplitude,pair.active.peakAmplitude)*driveNm*1e-9;
    const target=Math.max(peak*1.1,1e-12);
    const step=10**Math.floor(Math.log10(target/4));
    return [1,2,5,10].find(n=>4*n*step>=target)*step*4;
  }
  function unit(value){
    return value<1e-9?{factor:1e12,label:'pm'}:value<1e-6?{factor:1e9,label:'nm'}:value<1e-3?{factor:1e6,label:'µm'}:{factor:1e3,label:'mm'};
  }
  function formatLength(value){const u=unit(Math.abs(value));return (value*u.factor).toLocaleString('de-DE',{maximumSignificantDigits:3})+' '+u.label;}
  const api = { scaleResponse, prepareComparison, amplitudeScale, detailMaximum, unit, formatLength };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.CochleaResponse = api;
})(globalThis);
