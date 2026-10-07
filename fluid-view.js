/* Cross-section mean flow reconstructed from incompressible volume balance.
 * Historical q is positive INTO SV. Q_SV(x)=iw[As*ys+sum(b_eff*dx*q)].
 * Both longitudinal coordinates point base -> apex, hence Q_ST=-Q_SV.
 * Not the 3D near-field velocity. Geometry and q share the exact 600 cells.
 */
(function(root){
'use strict';
const geometry=typeof module!=="undefined"&&module.exports?require('./fluid-geometry'):root.CochleaFluidGeometry;
function reconstruct(response,g=geometry){
 if(response.real.length!==g.sweptArea.length)throw Error('Strömungsgitter passt nicht zur BM.');
 const w=2*Math.PI*response.frequency;
 let dr=response.sourceAreaMm2*1e-6*response.stapesDisplacement,di=0;
 const flowReal=[0],flowImag=[w*dr];
 for(let i=0;i<response.real.length;i++){
  dr+=g.sweptArea[i]*response.real[i];di+=g.sweptArea[i]*response.imag[i];
  flowReal.push(-w*di);flowImag.push(w*dr);
 }
 const make=(area,sign)=>({real:flowReal.map((q,i)=>sign*q/area[i]),imag:flowImag.map((q,i)=>sign*q/area[i])});
 const sv=make(g.svArea,1),st=make(g.stArea,-1);
 return {x:g.x,flowReal,flowImag,sv,st,maxSpeed:Math.max(...sv.real.map((v,i)=>Math.hypot(v,sv.imag[i])),...st.real.map((v,i)=>Math.hypot(v,st.imag[i])))};
}
function sample(flow,scala,x,phase){
 let hi=1;while(hi<flow.x.length-1&&flow.x[hi]<x)hi++;
 const lo=hi-1,t=Math.max(0,Math.min(1,(x-flow.x[lo])/(flow.x[hi]-flow.x[lo]))),v=flow[scala];
 const re=v.real[lo]*(1-t)+v.real[hi]*t,im=v.imag[lo]*(1-t)+v.imag[hi]*t;
 return re*Math.cos(phase)-im*Math.sin(phase);
}
const api={reconstruct,sample};if(typeof module!=="undefined"&&module.exports)module.exports=api;root.CochleaFluid=api;
})(globalThis);
