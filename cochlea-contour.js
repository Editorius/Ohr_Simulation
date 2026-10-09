/* Display geometry only. Half-circle effective radii from the existing scala
 * areas; smoothing and vertical exaggeration never feed back into the solver. */
(function(root) {
  "use strict";
  const geometry = typeof module !== "undefined" && module.exports
    ? require("./fluid-geometry") : root.CochleaFluidGeometry;
  const left = 130, right = 930, center = 110;
  const length = geometry.x[geometry.x.length - 1];
  const profiles = {};
  for (const [scala, areas] of [["sv", geometry.svArea], ["st", geometry.stArea]]) {
    // Smooth in physical distance rather than index on the nonuniform grid.
    const radius = areas.map(a => Math.sqrt(2 * a / Math.PI) * 1000);
    profiles[scala] = geometry.x.map(x => {
      let sum = 0, weights = 0;
      for (let i = 0; i < radius.length - 1; i++) {
        const mid = (geometry.x[i] + geometry.x[i + 1]) / 2;
        const weight = Math.exp(-.5 * ((mid - x) / .0005) ** 2)
          * (geometry.x[i + 1] - geometry.x[i]);
        sum += weight * radius[i]; weights += weight;
      }
      return 36 + 18 * sum / weights;
    });
  }
  function boundary(scala, screenX) {
    const x = Math.max(0, Math.min(length, (screenX - left) / (right - left) * length));
    let hi = 1;
    while (hi < geometry.x.length - 1 && geometry.x[hi] < x) hi++;
    const lo = hi - 1, t = (x - geometry.x[lo]) / (geometry.x[hi] - geometry.x[lo]);
    const h = profiles[scala][lo] * (1 - t) + profiles[scala][hi] * t;
    return center + (scala === "sv" ? -h : h);
  }
  function outline() {
    const line = (scala, reverse) => Array.from({length: 161}, (_, i) => {
      const x = left + (reverse ? 160-i : i) * 5;
      return `${x} ${boundary(scala,x).toFixed(3)}`;
    });
    const upper = line("sv", false), lower = line("st", true);
    const top = boundary("sv", right), bottom = boundary("st", right);
    const body = `M${upper.join(" L")} C966 ${top} 966 ${bottom} ${lower.join(" L")}`;
    return {
      fill: body + " Z",
      wall: body + ` M130 ${boundary("sv",left)} V74 M130 96 V125 M130 145 V${boundary("st",left)}`,
    };
  }
  function arrowY(scala, begin, end) {
    // Keep the entire horizontal arrow, including its head, outside the wall.
    const ys = Array.from({length: 17}, (_, i) => boundary(scala, begin+(end-begin)*i/16));
    return scala === "sv" ? Math.min(...ys)-10 : Math.max(...ys)+10;
  }
  const api = {boundary, outline, arrowY};
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.CochleaContour = api;
})(globalThis);
