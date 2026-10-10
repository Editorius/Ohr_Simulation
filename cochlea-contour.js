/* Approved display silhouette. No connection from these coordinates to the
 * mechanical geometry: the solver continues to use fluid-geometry.js. */
(function(root) {
  "use strict";
  const layout = Object.freeze({left:317, right:1505, center:270, halfHeight:34});
  const fill = "M300 174 C298 116 314 79 344 81 C382 82 408 127 494 150 C677 178 1120 202 1480 224 C1523 227 1540 241 1540 270 C1540 296 1522 314 1480 317 C1210 329 757 347 568 377 C511 386 491 416 442 431 C379 450 320 443 302 412 C285 383 293 350 306 322 C319 292 320 274 314 251 C308 230 300 205 300 174 Z";
  const wall = "M300 170 C298 116 314 79 344 81 C382 82 408 127 494 150 C677 178 1120 202 1480 224 C1523 227 1540 241 1540 270 C1540 296 1522 314 1480 317 C1210 329 757 347 568 377 C511 386 491 416 442 431 C379 450 320 443 302 412 C291 394 290 381 293 372 M298 344 C300 336 304 328 306 322 C319 292 320 274 314 251 C309 232 303 216 301 210";
  const segments = {
    sv: [ [[300,174],[298,116],[314,79],[344,81]],
          [[344,81],[382,82],[408,127],[494,150]],
          [[494,150],[677,178],[1120,202],[1480,224]],
          [[1480,224],[1523,227],[1540,241],[1540,270]] ],
    st: [ [[1540,270],[1540,296],[1522,314],[1480,317]],
          [[1480,317],[1210,329],[757,347],[568,377]],
          [[568,377],[511,386],[491,416],[442,431]],
          [[442,431],[379,450],[320,443],[302,412]] ]
  };
  const profiles = {};
  for(const scala of ['sv','st']) {
    profiles[scala] = segments[scala].flatMap(p => Array.from({length:201},(_,i)=> {
      const t=i/200,u=1-t;
      return [0,1].map(j=>u*u*u*p[0][j]+3*u*u*t*p[1][j]+3*u*t*t*p[2][j]+t*t*t*p[3][j]);
    })).sort((a,b)=>a[0]-b[0]);
  }
  function boundary(scala,x) {
    const p=profiles[scala]; let hi=1;
    x=Math.max(layout.left,Math.min(layout.right,x));
    while(hi<p.length-1&&p[hi][0]<x)hi++;
    const a=p[hi-1],b=p[hi],t=(x-a[0])/(b[0]-a[0]||1);
    // Same 10% vertical compression as the SVG background, about the resting BM.
    return layout.center+0.9*(a[1]+t*(b[1]-a[1])-layout.center);
  }
  function arrowFrame(scala,x) {
    const slope=(boundary(scala,x+1)-boundary(scala,x-1))/2;
    const length=Math.hypot(1,slope),tx=1/length,ty=slope/length;
    const side=scala==='sv'?-1:1;
    // A fixed normal offset keeps the arrow outside the wall throughout a cycle.
    return {x:x-side*ty*20,y:boundary(scala,x)+side*tx*20,tx,ty};
  }
  function arrowPath(frame,span) {
    const {x,y,tx,ty}=frame,head=Math.min(3.5,Math.abs(span)*.35);
    const point=(along,normal=0)=>`${x+tx*along-ty*normal} ${y+ty*along+tx*normal}`;
    const end=span/2,back=end-Math.sign(span)*head;
    return `M${point(-span/2)} L${point(end)} M${point(back,-head)} L${point(end)} L${point(back,head)}`;
  }
  function windowMotion(phase) {
    // Visible schematic excursion, not another scale for absolute BM values.
    const shift=6*Math.cos(phase);
    return {shift,
      oval:`M300 170 H${300+shift} M301 210 L${300+shift} 210`,
      round:`M298 344 H${295-shift} M293 372 H${295-shift}`};
  }
  const api={layout,boundary,arrowFrame,arrowPath,windowMotion,outline:()=>({fill,wall})};
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  root.CochleaContour=api;
})(globalThis);
