/* Corrected historical human cochlea (formerly B), 600 mechanical cells. */
(function installCochlea(root,data){
'use strict';
const Core=typeof module!=='undefined'&&module.exports?require('./numerics.js'):root.CochleaNumerics;
function decode(s){const b=atob(s),v=new DataView(new ArrayBuffer(b.length));for(let i=0;i<b.length;i++)v.setUint8(i,b.charCodeAt(i));return Float64Array.from({length:b.length/8},(_,i)=>v.getFloat64(i*8,true));}
let prepared;
function geometry(){if(!prepared){prepared={...data};for(const k of ['M','C','x','k','h','ws2','gamma','source'])prepared[k]=decode(data[k]);}return prepared;}
function solveForView({frequency,activity=0,sourceAreaMm2=2.86}={}){
 if(!Number.isFinite(frequency)||frequency<50||frequency>20000)throw Error('Frequenz muss zwischen 50 und 20 000 Hz liegen.');
 if(!Number.isFinite(sourceAreaMm2)||sourceAreaMm2<=0)throw Error('Ungültige Steigbügelfläche.');
 const g=geometry();if(!g.gains.some(v=>Math.abs(v-activity)<1e-9))throw Error('Aktivität ist nicht geprüft.');
 const pole=g.stability.find(p=>Math.abs(p.activity-activity)<1e-9);
 const n=g.n,w=2*Math.PI*frequency,ar=new Float64Array(n*n),ai=new Float64Array(n*n),rhs=new Float64Array(n);
 for(let i=0;i<n;i++){
  for(let j=0;j<n;j++){const a=i*n+j;ar[a]=-w*w*g.M[a]+(i===j?g.k[i]:0);ai[a]=w*g.C[a];}
  const dr=g.ws2[i]-w*w,di=w*g.gamma[i],num=w*w*activity*g.h[i]*g.gamma[i],den=dr*dr+di*di;
  ar[i*n+i]+=num*dr/den;ai[i*n+i]-=num*di/den;rhs[i]=w*w*g.source[i]*sourceAreaMm2/(4*Math.PI);
 }
 const q=Core.linearSolve(ar,ai,rhs),all=Array.from(q.real,(v,i)=>Math.hypot(v,q.imag[i]));let fullPeak=0;for(let i=1;i<n;i++)if(all[i]>all[fullPeak])fullPeak=i;
 const x=Array.from(g.x.slice(0,g.visible)),real=Array.from(q.real.slice(0,g.visible)),imag=Array.from(q.imag.slice(0,g.visible)),amplitude=all.slice(0,g.visible);let peakIndex=0;for(let i=1;i<g.visible;i++)if(amplitude[i]>amplitude[peakIndex])peakIndex=i;
 return {model:'historical-b-600',normalized:true,modelLabel:'Menschliche Cochlea · korrigiertes historisches Modell',frequency,activity,cells:g.visible,computationalCells:n,computationalLength:g.computationalLength,visibleLength:g.length,dx:x[1]-x[0],x,real,imag,amplitude,phase:Core.unwrapPhase(real,imag),peakIndex,peakX:x[peakIndex],peakAmplitude:amplitude[peakIndex],peakOutside:fullPeak>=g.visible,fullPeakX:g.x[fullPeak],fullPeakAmplitude:all[fullPeak],peakAnalysis:Core.assessPeak(x,amplitude,peakIndex),residual:q.residual,stapesDisplacement:1,sourceAreaMm2,greenwoodX:Core.greenwood(frequency,g.length),
 unstable:pole.unstable>0,maxRealPole:pole.maxReal,warning:pole.unstable>0?'Aktive Einstellung dynamisch instabil: Die Animation zeigt eine formale harmonische Antwort, keine stabile Dauerbewegung.':'Lineares Modell; keine menschliche Messvalidierung. Stabilitätsprüfung siehe technische Dokumentation.',
 boundaryLabel:'33,5 mm · unterer Helicotrema-Beitrag korrigiert',sourceLabel:'BM/Steigbügel · projizierte Quellfläche '+sourceAreaMm2+' mm²',mechanicsLabel:'TM-Resonanz und Scherkopplung (Faktor 25)',settings:{nearField:true}};
}
const api={solveForView};api.workerSource='('+installCochlea.toString()+')(self,'+JSON.stringify(data)+');';if(typeof module!=='undefined'&&module.exports)module.exports=api;root.CochleaModel=api;
})(globalThis,typeof module!=='undefined'&&module.exports?require('./cochlea-data.js'):globalThis.CochleaData);
