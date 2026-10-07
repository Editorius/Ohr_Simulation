/* Shared complex solver and response analysis; no model-specific mechanics. */
(function installNumerics(root) {
  "use strict";
  function linearSolve(ar0, ai0, b0, bi0 = new Float64Array(b0.length)) {
    const n = b0.length,
      ar = ar0.slice(),
      ai = ai0.slice(),
      br = b0.slice(),
      bi = bi0.slice();
    let minPivot = Infinity;
    for (let k = 0; k < n; k++) {
      let pivot = k,
        best = 0;
      for (let i = k; i < n; i++) {
        const v = Math.hypot(ar[i * n + k], ai[i * n + k]);
        if (v > best) {
          best = v;
          pivot = i;
        }
      }
      if (!Number.isFinite(best) || best < 1e-18)
        throw Error("Numerisch singuläres System");
      minPivot = Math.min(minPivot, best);
      if (pivot !== k) {
        for (let j = k; j < n; j++) {
          let a = k * n + j,
            b = pivot * n + j;
          [ar[a], ar[b]] = [ar[b], ar[a]];
          [ai[a], ai[b]] = [ai[b], ai[a]];
        }
        [br[k], br[pivot]] = [br[pivot], br[k]];
        [bi[k], bi[pivot]] = [bi[pivot], bi[k]];
      }
      const pr = ar[k * n + k],
        pi = ai[k * n + k],
        den = pr * pr + pi * pi;
      for (let i = k + 1; i < n; i++) {
        const idx = i * n + k,
          fr = (ar[idx] * pr + ai[idx] * pi) / den,
          fi = (ai[idx] * pr - ar[idx] * pi) / den;
        ar[idx] = 0;
        ai[idx] = 0;
        for (let j = k + 1; j < n; j++) {
          const a = i * n + j,
            b = k * n + j;
          ar[a] -= fr * ar[b] - fi * ai[b];
          ai[a] -= fr * ai[b] + fi * ar[b];
        }
        br[i] -= fr * br[k] - fi * bi[k];
        bi[i] -= fr * bi[k] + fi * br[k];
      }
    }
    const real = new Float64Array(n),
      imag = new Float64Array(n);
    for (let i = n - 1; i >= 0; i--) {
      let rr = br[i],
        ri = bi[i];
      for (let j = i + 1; j < n; j++) {
        rr -= ar[i * n + j] * real[j] - ai[i * n + j] * imag[j];
        ri -= ar[i * n + j] * imag[j] + ai[i * n + j] * real[j];
      }
      const a = ar[i * n + i],
        b = ai[i * n + i],
        d = a * a + b * b;
      real[i] = (rr * a + ri * b) / d;
      imag[i] = (ri * a - rr * b) / d;
    }
    let err = 0,
      norm = 0,
      bnorm = 0,
      ynorm = 0;
    for (let i = 0; i < n; i++) {
      let rr = -b0[i],
        ri = -bi0[i],
        row = 0;
      for (let j = 0; j < n; j++) {
        const a = ar0[i * n + j],
          b = ai0[i * n + j];
        rr += a * real[j] - b * imag[j];
        ri += a * imag[j] + b * real[j];
        row += Math.hypot(a, b);
      }
      err = Math.max(err, Math.hypot(rr, ri));
      norm = Math.max(norm, row);
      bnorm = Math.max(bnorm, Math.hypot(b0[i], bi0[i]));
      ynorm = Math.max(ynorm, Math.hypot(real[i], imag[i]));
    }
    return {
      real,
      imag,
      residual: err / (norm * ynorm + bnorm || 1),
      minPivot,
    };
  }
  function assessPeak(x, amplitude, peakIndex) {
    const peak = amplitude[peakIndex];
    if (!peak)
      return {
        available: false,
        edgeLimited: false,
        competing: false,
        widthMm: null,
        left: null,
        right: null,
      };
    const limit = peak / Math.sqrt(2),
      n = x.length;
    let lo = peakIndex,
      hi = peakIndex;
    while (lo > 0 && amplitude[lo - 1] >= limit) lo--;
    while (hi < n - 1 && amplitude[hi + 1] >= limit) hi++;
    const cross = (i, j) =>
      x[i] +
      ((limit - amplitude[i]) / (amplitude[j] - amplitude[i])) * (x[j] - x[i]);
    const left = lo === 0 ? null : cross(lo - 1, lo),
      right = hi === n - 1 ? null : cross(hi, hi + 1),
      other = [];
    for (let i = 1; i < n - 1; i++)
      if (
        Math.abs(i - peakIndex) > 3 &&
        amplitude[i] >= amplitude[i - 1] &&
        amplitude[i] > amplitude[i + 1] &&
        amplitude[i] >= 0.9 * peak
      )
        other.push({ x: x[i], relativeAmplitude: amplitude[i] / peak });
    return {
      available: true,
      edgeLimited: left === null || right === null,
      competing: other.length > 0,
      otherMaxima: other,
      left,
      right,
      widthMm: left === null || right === null ? null : (right - left) * 1000,
    };
  }

  function unwrapPhase(real, imag) {
    const phase = [];
    for (let i = 0; i < real.length; i++) {
      let value = Math.atan2(imag[i], real[i]);
      if (i) {
        while (value - phase[i - 1] > Math.PI) value -= 2 * Math.PI;
        while (value - phase[i - 1] < -Math.PI) value += 2 * Math.PI;
      }
      phase.push(value);
    }
    return phase;
  }
  function greenwood(frequency, length) {
    return length * (1 - Math.log10(frequency / 165.4 + 0.88) / 2.1);
  }
  const api = { linearSolve, assessPeak, unwrapPhase, greenwood };
  api.workerSource = "(" + installNumerics.toString() + ")(self);";
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.CochleaNumerics = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
