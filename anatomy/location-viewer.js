(function(){
'use strict';
const source=JSON.parse(document.getElementById('mesh-data').textContent),data=source.meshes,$=id=>document.getElementById(id);
// Camera pivot is biased toward the scala tympani (cochlear body).
function cameraCenter(meshes){
 const bounds=vs=>[0,1,2].map(k=>(Math.min(...vs.map(p=>p[k]))+Math.max(...vs.map(p=>p[k])))/2);
 const all=bounds(Object.values(meshes).flatMap(m=>m.vertices)),cochlea=bounds(meshes.st.vertices);
 return all.map((x,k)=>.2*x+.8*cochlea[k]);
}
function normalize(meshes){const vs=Object.values(meshes).flatMap(m=>m.vertices),lo=[0,1,2].map(k=>Math.min(...vs.map(v=>v[k]))),hi=[0,1,2].map(k=>Math.max(...vs.map(v=>v[k]))),c=cameraCenter(meshes),s=Math.max(...hi.map((v,k)=>v-lo[k]))/1.65;
 return Object.fromEntries(Object.entries(meshes).map(([k,m])=>[k,{progress:m.progress,faces:m.faces,vertices:m.vertices.map(v=>v.map((x,j)=>(x-c[j])/s))}]));}
function buffers(mesh){const normals=mesh.vertices.map(()=>[0,0,0]);for(const face of mesh.faces){const [a,b,c]=face.map(i=>mesh.vertices[i]),u=b.map((v,k)=>v-a[k]),v=c.map((x,k)=>x-a[k]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];for(const i of face)for(let k=0;k<3;k++)normals[i][k]+=n[k];}
 return {vertices:new Float32Array(mesh.vertices.flatMap((v,i)=>{const n=normals[i],l=Math.hypot(...n)||1;return [...v,...n.map(x=>x/l),mesh.progress[i]];})),indices:new Uint16Array(mesh.faces.flat())};}
const vertex=`attribute float progress;varying float along;attribute vec3 position;attribute vec3 normal;uniform vec2 angles;uniform float zoom;uniform float aspect;varying vec3 lightNormal;varying vec3 worldPosition;
vec3 rotate(vec3 p){float a=angles.x,b=angles.y;vec3 q=vec3(cos(a)*p.x-sin(a)*p.y,sin(a)*p.x+cos(a)*p.y,p.z);return vec3(q.x,cos(b)*q.y-sin(b)*q.z,sin(b)*q.y+cos(b)*q.z);}
void main(){worldPosition=position;along=progress;vec3 p=rotate(position);gl_Position=vec4(p.x*zoom/aspect,p.y*zoom,-p.z*.25,1.);lightNormal=rotate(normal);}`;
const fragment=`precision mediump float;varying float along;uniform float opacity;varying vec3 lightNormal;varying vec3 worldPosition;uniform vec3 color;void main(){float light=.4+.6*abs(dot(normalize(lightNormal),normalize(vec3(-.3,.5,1.))));vec3 c=along<.085?vec3(.88,.16,.22):color;gl_FragColor=vec4(c*(along<-.5?1.:light),opacity);}`;
const views=[];let markerVisible=false;
const lengthMm=source.bmCoordinate.lengthMm;
function pathPoint(key,mm){
 const value=Math.max(0,Math.min(lengthMm,mm)),p=source.rayPaths[key];
 if(value>33){const t=(value-33)/.5,c=source.displayReference.controls[key];return c[0].map((_,k)=>(1-t)**3*c[0][k]+3*(1-t)**2*t*c[1][k]+3*(1-t)*t*t*c[2][k]+t**3*c[3][k]);}
 const u=value/lengthMm*100,i=Math.min(99,Math.floor(u)),t=u-i;return p[i].map((x,k)=>x+(p[i+1][k]-x)*t);
}
const sampleMm=[...new Set([...Array.from({length:101},(_,i)=>i*lengthMm/100),...Array.from({length:51},(_,i)=>33+i/100)])].sort((a,b)=>a-b);
const displayPaths=Object.fromEntries(['st','sv'].map(k=>[k,sampleMm.map(mm=>pathPoint(k,mm))]));
function referencePoint(mm){const a=pathPoint('st',mm),b=pathPoint('sv',mm);return a.map((x,k)=>(x+b[k])/2);}
const reference=sampleMm.map(referencePoint);
function surfaceFrame(key,mm){
 if(mm>=33){const frame=source.terminalSurfaceSections[Math.max(0,Math.min(50,Math.round((mm-33)*100)))];return {...frame[key],mm:frame.mm};}
 const index=Math.round(mm/lengthMm*100);return {...source.raySections[key][index],mm:index*lengthMm/100};
}
// A closed tube follows the actual mesh-plane intersection, avoiding unsigned
// vertex-distance interpolation gaps. Depth testing preserves anatomical occlusion.
function contourMesh(frame,origin,scale){
 const points=frame.hits,radius=Math.min(.070,.36*Math.sqrt(frame.area/Math.PI)),vertices=[],faces=[],progress=[];
 const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],unit=a=>{const l=Math.hypot(...a)||1;return a.map(x=>x/l);};
 points.forEach((p,i)=>{const before=points[(i+points.length-1)%points.length],after=points[(i+1)%points.length],t=unit(after.map((x,k)=>x-before[k]));const axis=Math.abs(t[2])<.9?[0,0,1]:[0,1,0],u=unit(cross(t,axis)),v=cross(t,u);
 for(let j=0;j<8;j++){const a=j*Math.PI/4;vertices.push(p.map((x,k)=>(x+radius*(Math.cos(a)*u[k]+Math.sin(a)*v[k])-origin[k])/scale));progress.push(-1);}
 });
 for(let i=0;i<points.length;i++)for(let j=0;j<8;j++){const a=i*8+j,b=i*8+(j+1)%8,c=((i+1)%points.length)*8+j,d=((i+1)%points.length)*8+(j+1)%8;faces.push([a,c,b],[b,c,d]);}
 return {vertices,faces,progress};
}
function setMaximumPositionMm(mm){
 if(typeof mm!=='number'||!Number.isFinite(mm)||mm<0||mm>lengthMm)throw new RangeError('Maximalort muss zwischen 0 und 33,5 mm liegen.');
 $('position').value=String(mm);$('maximum-mm').value=String(mm);
 views.forEach(v=>v.select(mm/lengthMm));draw();return {positionMm:mm,surfacePositionMm:surfaceFrame('st',mm).mm,anatomicallyValidated:false};
}

function create(id,meshes){const canvas=$(id),gl=canvas.getContext('webgl',{antialias:true,alpha:false});if(!gl)throw Error('WebGL ist hier nicht verfügbar. Bitte die HTML-Datei in einem aktuellen Browser mit aktivierter Grafikbeschleunigung öffnen.');
 function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
 const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
 const locations=Object.fromEntries(['angles','zoom','aspect','color','opacity'].map(k=>[k,gl.getUniformLocation(program,k)])),pos=gl.getAttribLocation(program,'position'),nor=gl.getAttribLocation(program,'normal'),along=gl.getAttribLocation(program,'progress');
 const uploaded=Object.fromEntries(Object.entries(normalize(meshes)).map(([k,m])=>{const b=buffers(m),v=gl.createBuffer(),f=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,v);gl.bufferData(gl.ARRAY_BUFFER,b.vertices,gl.STATIC_DRAW);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,f);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,b.indices,gl.STATIC_DRAW);return [k,{v,f,mesh:m,buffer:b.vertices,count:b.indices.length}];}));
 const all=Object.values(data).flatMap(m=>m.vertices),lo=[0,1,2].map(k=>Math.min(...all.map(p=>p[k]))),hi=[0,1,2].map(k=>Math.max(...all.map(p=>p[k]))),origin=cameraCenter(data),unit=Math.max(...hi.map((v,k)=>v-lo[k]))/1.65;
 const markers={};
 const view={yaw:0,tilt:.65,zoom:1,draw(){const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2),w=Math.round(r.width*d),h=Math.round(r.height*d);if(!w||!h)return;if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}gl.viewport(0,0,w,h);gl.clearColor(.98,.99,.99,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.useProgram(program);gl.uniform2f(locations.angles,this.yaw,this.tilt);gl.uniform1f(locations.zoom,this.zoom);gl.uniform1f(locations.aspect,w/h);
 for(const [k,m] of Object.entries(uploaded).sort(([a],[b])=>Number($(b).checked)-Number($(a).checked))){const opaque=$(k).checked;gl.depthMask(opaque);if(opaque){gl.disable(gl.BLEND);gl.disable(gl.CULL_FACE);}else{gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);}gl.uniform1f(locations.opacity,opaque?1:.15);gl.uniform3fv(locations.color,({sv:[0,.447,.698],st:[.941,.749,.102],eq:[.66,.59,.73],stapes:[.87,.85,.77],ow:[.18,.66,.45],rw:[.85,.37,.58]})[k]);gl.bindBuffer(gl.ARRAY_BUFFER,m.v);gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,3,gl.FLOAT,false,28,0);gl.enableVertexAttribArray(nor);gl.vertexAttribPointer(nor,3,gl.FLOAT,false,28,12);gl.enableVertexAttribArray(along);gl.vertexAttribPointer(along,1,gl.FLOAT,false,28,24);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,m.f);gl.drawElements(gl.TRIANGLES,m.count,gl.UNSIGNED_SHORT,0);}gl.depthMask(true);gl.disable(gl.CULL_FACE);gl.disable(gl.BLEND);
 for(const [key,m] of Object.entries(markerVisible?markers:{})){gl.uniform1f(locations.opacity,$(key).checked?1:.15);if(!$(key).checked){gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);}else gl.disable(gl.BLEND);gl.bindBuffer(gl.ARRAY_BUFFER,m.v);gl.vertexAttribPointer(pos,3,gl.FLOAT,false,28,0);gl.vertexAttribPointer(nor,3,gl.FLOAT,false,28,12);gl.vertexAttribPointer(along,1,gl.FLOAT,false,28,24);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,m.f);gl.drawElements(gl.TRIANGLES,m.count,gl.UNSIGNED_SHORT,0);}gl.disable(gl.BLEND);}};
 view.select=(t)=>{const mm=Math.max(0,Math.min(lengthMm,t*lengthMm));
 for(const [key,m] of Object.entries(uploaded)){for(let i=0;i<m.mesh.vertices.length;i++)m.buffer[i*7+6]=100;gl.bindBuffer(gl.ARRAY_BUFFER,m.v);gl.bufferData(gl.ARRAY_BUFFER,m.buffer,gl.DYNAMIC_DRAW);}
 for(const key of ['st','sv']){const frame=surfaceFrame(key,mm),b=buffers(contourMesh(frame,origin,unit));const m=markers[key]||(markers[key]={v:gl.createBuffer(),f:gl.createBuffer()});gl.bindBuffer(gl.ARRAY_BUFFER,m.v);gl.bufferData(gl.ARRAY_BUFFER,b.vertices,gl.DYNAMIC_DRAW);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,m.f);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,b.indices,gl.DYNAMIC_DRAW);m.count=b.indices.length;}
 $('position-value').textContent=mm.toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2})+' mm ab Basis · Modellkoordinate'+(mm>=33?' · apikale Zuordnung angenähert':'');};view.select(Number($('position').value)/33.5);let drag=null;const update=draw;
 canvas.addEventListener('pointerdown',e=>{drag=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(!drag)return;view.yaw+=(e.clientX-drag[0])*.008;view.tilt+=(e.clientY-drag[1])*.008;drag=[e.clientX,e.clientY];update();});for(const event of ['pointerup','pointercancel'])canvas.addEventListener(event,()=>drag=null);
 canvas.addEventListener('wheel',e=>{e.preventDefault();view.zoom=Math.max(.5,Math.min(2,view.zoom-e.deltaY*.001));update();},{passive:false});canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-'].includes(e.key))return;e.preventDefault();view.yaw+=e.key==='ArrowLeft'?-.12:e.key==='ArrowRight'?.12:0;view.tilt+=e.key==='ArrowUp'?-.12:e.key==='ArrowDown'?.12:0;view.zoom=Math.max(.5,Math.min(2,view.zoom+(e.key==='+'?.1:e.key==='-'?-.1:0)));update();});return view;}
function draw(){views.forEach(v=>v.draw());if(!views.length)return;
const v=views[0],mesh=normalize(data),raw=data.st.vertices,norm=mesh.st.vertices;const scale=(raw[0][0]-raw[1][0])/(norm[0][0]-norm[1][0]);const center=raw[0].map((x,k)=>x-norm[0][k]*scale);
const rect=$('anatomy').getBoundingClientRect(),W=rect.width,H=rect.height;
function project(p){const [x,y,z]=p.map((x,k)=>(x-center[k])/scale),a=v.yaw,b=v.tilt;const xx=Math.cos(a)*x-Math.sin(a)*y,yy=Math.sin(a)*x+Math.cos(a)*y;return [W/2+xx*v.zoom*H/2,H/2-(Math.cos(b)*yy-Math.sin(b)*z)*v.zoom*H/2];}
const t=Number($('position').value)/lengthMm,p=referencePoint(t*lengthMm);
const nearest=(m,p)=>m.vertices.reduce((a,b)=>Math.hypot(...b.map((x,k)=>x-p[k]))<Math.hypot(...a.map((x,k)=>x-p[k]))?b:a);
const eqIndices=[...new Set(data.eq.faces.flat())],eq=eqIndices.map(i=>data.eq.vertices[i]).reduce((a,b)=>b[1]>a[1]?b:a);
const labels=[['Steigbügel',source.windows.stapes.center,24,115,'stapes'],['Ovales Fenster*',source.windows.ow.center,24,160,'ow'],['Rundes Fenster*',source.windows.rw.center,24,205,'rw'],['Scala vestibuli',pathPoint('sv',11.26),W-175,H-100,'sv'],['Scala tympani',pathPoint('st',11.26),W-175,H-55,'st'],['Gleichgewichtsorgan',eq,24,50,'eq'],['Ortsmarkierung',p,W-175,50,'st']];
let svg='';
if($('reference').checked){
 const points=reference.map(p=>project(p).join(',')).join(' ');
 svg+=`<polyline points="${points}" stroke="white" stroke-width="5" fill="none"/><polyline points="${points}" stroke="#173d67" stroke-width="2.5" fill="none"/>`;
 for(const mm of [0,5,10,15,20,25,30,33.5]){const [x,y]=project(referencePoint(mm));svg+=`<circle cx="${x}" cy="${y}" r="3" fill="#173d67" stroke="white"/><text x="${x+6}" y="${y-6}" font-size="12" fill="#173d67" stroke="white" stroke-width="3" paint-order="stroke">${mm.toLocaleString('de-DE')} mm</text>`;}

}
 const [x,y]=project(p);if(markerVisible)svg+=`<circle cx="${x}" cy="${y}" r="6" fill="#c93043" stroke="white" stroke-width="2"/>`;
if($('guides').checked){
 const i=Math.round(t*100);for(const key of ['st','sv']){const contour=surfaceFrame(key,t*lengthMm).hits.map(p=>project(p).join(',')).join(' ');svg+=`<polygon points="${contour}" stroke="#c93043" stroke-width="1.5" fill="none"/>`;}
 for(const key of ['sv','st']){const points=displayPaths[key].map(p=>project(p).join(',')).join(' ');svg+=`<polyline points="${points}" stroke="${key==='sv'?'#08658d':'#875400'}" stroke-width="2" fill="none" stroke-dasharray="5 3"/>`;for(let i=0;i<=100;i+=10){const [x,y]=project(pathPoint(key,i*lengthMm/100));svg+=`<circle cx="${x}" cy="${y}" r="3" fill="white" stroke="#222"/><text x="${x+5}" y="${y-5}" font-size="11">${(i*33.5/100).toLocaleString('de-DE',{maximumFractionDigits:2})} mm</text>`;}}}

for(const [text,point,x0,y,key] of labels){if(text==='Ortsmarkierung'&&!markerVisible)continue;const boxWidth=text.startsWith('Scala ')?168:text.length*8+20,right=x0>W/2,x=right?W-boxWidth-25:x0,lineX=right?x-7:x+boxWidth+7,[px,py]=project(point);svg+=`<path d="M ${lineX} ${y-5} L ${px} ${py}" stroke="#000" stroke-width="1" fill="none"/><circle cx="${px}" cy="${py}" r="3" fill="${text==='Ortsmarkierung'?'#c93043':'#000'}"/><rect x="${x}" y="${y-21}" width="${boxWidth}" height="32" rx="7" fill="#fff0da" stroke="#e8d4b4"/><text x="${x+10}" y="${y}" fill="#243c49" font-size="14">${text}</text>`;}
$('labels').setAttribute('viewBox',`0 0 ${W} ${H}`);$('labels').innerHTML=svg;
}
try{views.push(create('anatomy',data));for(const id of ['sv','st','eq','stapes','ow','rw'])$(id).onchange=draw;
for(const [id,tilt] of [['reset',.65],['top',0],['side',Math.PI/2]])$(id).onclick=()=>{views.forEach(v=>Object.assign(v,{yaw:0,tilt,zoom:1}));draw();};
$('guides').onchange=()=>{$('reference').checked=$('guides').checked;draw();};$('reference').onchange=draw;
$('position').oninput=()=>setMaximumPositionMm(Number($('position').value));
$('maximum-mm').onchange=()=>{try{setMaximumPositionMm(Number($('maximum-mm').value));$('input-error').textContent='';}catch(e){$('input-error').textContent=e.message;}};
$('rw-view').onclick=()=>{for(const key of ['eq','sv','stapes','ow'])$(key).checked=false;$('st').checked=true;$('rw').checked=true;const n=source.windows.rw.normal;views.forEach(v=>Object.assign(v,{yaw:Math.atan2(n[0],n[1]),tilt:Math.acos(Math.max(-1,Math.min(1,n[2]))),zoom:1.2}));draw();};
$('windows-view').onclick=()=>{const n=source.windows.ow.normal;views.forEach(v=>Object.assign(v,{yaw:Math.atan2(n[0],n[1]),tilt:Math.acos(Math.max(-1,Math.min(1,n[2]))),zoom:1.2}));draw();};
$('focus').onclick=()=>{const v=views[0],t=Number($('position').value)/33.5;const p=referencePoint(t*lengthMm);const all=Object.values(data).flatMap(m=>m.vertices),lo=[0,1,2].map(k=>Math.min(...all.map(v=>v[k]))),hi=[0,1,2].map(k=>Math.max(...all.map(v=>v[k])));const c=cameraCenter(data);v.yaw=Math.atan2(p[0]-c[0],p[1]-c[1]);v.tilt=Math.PI/2;draw();};
new ResizeObserver(draw).observe(document.querySelector('.grid'));draw();
}catch(e){$('error').textContent=e.message;}
window.CochleaLocation={setMarkerVisible(value){markerVisible=!!value;draw();},normalize,buffers,views,setMaximumPositionMm,referencePoint};
})();
