/* View and sound are independent consumers of the same confirmed model frequency. */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id),
    fmt = (n, d = 1) =>
      n.toLocaleString("de-DE", {
        minimumFractionDigits: d,
        maximumFractionDigits: d,
      });
  const audio = new TonePlayer();
  const contour = CochleaContour.outline();
  $("scala-fill").setAttribute("d", contour.fill);
  $("scala-wall").setAttribute("d", contour.wall);
  let result,
    reference,
    pair,
    passive,
    activeMode = false,
    phase = 0,
    running = false,
    last = 0,
    pendingAudio = false;
  let driveNm = 10, fluidFlow, fluidReference = 1;
  const lengthText = CochleaResponse.formatLength;
  const viewLength = () => result?.visibleLength || .0335;
  const axisTicks = () => [0,10,20,30,33.5];
  const frequencyBounds = () => [50,20000];
  function updateFrequencyRange() {
    const [lo, hi] = frequencyBounds();
    $("frequency").min = lo;
    $("frequency").max = hi;
    $("frequency-min-label").textContent = fmt(lo, 0) + " Hz";
    $("frequency-max-label").textContent = fmt(hi, 0) + " Hz";

  }
  const modelName = r => r.modelLabel;
  const comparing = () => activeMode;
  const path = (xs, ys) =>
    xs
      .map((x, i) => (i ? "L" : "M") + x.toFixed(2) + " " + ys[i].toFixed(2))
      .join(" ");
  const text = (x, y, t, extra = "") =>
    `<text x="${x}" y="${y}" ${extra}>${t}</text>`;
  function audioState(message) {
    $("audio-toggle").textContent = audio.on
      ? "♫  Ton ausschalten"
      : "♫  Ton einschalten";
    $("audio-toggle").setAttribute("aria-pressed", String(audio.on));
    $("audio-status").textContent =
      message ||
      (audio.on ? `Ton an · ${fmt(result.frequency, 0)} Hz` : "Ton aus");
  }
  function stopAudio() {
    pendingAudio = false;
    audio.stop();
    audioState();
  }
  function stopAnimation() {
    running = false;
    $("animation-toggle").textContent = "▶  Animation starten";
    $("animation-toggle").setAttribute("aria-pressed", "false");
  }
  function startAnimation() {
    running = true;
    last = performance.now();
    $("animation-toggle").textContent = "Ⅱ  Bildpause";
    $("animation-toggle").setAttribute("aria-pressed", "true");
  }
  function periodTime(seconds, period = seconds) {
    return period >= 0.001
      ? fmt(seconds * 1000, 2) + " ms"
      : fmt(seconds * 1e6, 2) + " µs";
  }
  function timeline() {
    if (!result) return;
    const fraction = phase / (2 * Math.PI);
    $("phase-position").value = fraction * 360;
    $("phase-value").textContent = fmt(fraction * 360, 0) + "°";
    $("period-time").textContent = "T = " + periodTime(1 / result.frequency);
    $("instant-time").textContent =
      "t = " + periodTime(fraction / result.frequency, 1 / result.frequency);
    $("period-end").textContent = periodTime(1 / result.frequency);

  }
  function fail(message) {
    $("status").textContent = message;
    $("status").classList.add("error");
    $("wave-svg").setAttribute("aria-busy", "false");
    $("input-error").hidden = false;
    $("input-error").textContent =
      message + " Die letzte gültige Rechnung bleibt angezeigt.";
  }
  function configureInput() {
    $("drive").min = 0;
    $("drive").max = 1000;
    $("drive").value = Math.round(1000*Math.log10(driveNm/.001)/5);
    $("drive").setAttribute("aria-label","Anregung am Steigbügel, logarithmisch von 1 pm bis 100 nm");
  }
  function updateInput() {
    $("drive").value = Math.max(0,Math.min(1000,Number($("drive").value)));
    driveNm=.001*10**(5*Number($("drive").value)/1000);
    $("drive-value").textContent=lengthText(driveNm*1e-9);
    $("calibration-note").textContent="Scheitelamplitude aus der Ruhelage."+(activeMode ? " Aktiv: lineares Kleinsignalmodell, noch ohne Kompression." : "");
  }
  function selectResult() {
    $("active-amplitude").value=Math.min(100,Math.max(30,Number($("active-amplitude").value)));
    $("active-amplitude").disabled=!activeMode;
    $("active-amplitude-value").textContent=fmt(Number($("active-amplitude").value),0)+" %";

    for (const mode of ["passive","active"]) {
      const selected = (mode === "active") === activeMode;
      $("mode-"+mode).classList.toggle("selected",selected);
      $("mode-"+mode).setAttribute("aria-pressed",String(selected));
    }
    if (!pair) return;
    updateInput(pair.passive.frequency);
    const comparison=CochleaResponse.prepareComparison(pair,driveNm,activeMode,Number($("active-amplitude").value));
    passive=comparison.passive;
    result=comparison.result;
    reference={peakAmplitude:comparison.referencePeak};
    fluidFlow=CochleaFluid.reconstruct(result);
    const fullActive=CochleaResponse.scaleResponse(pair.active,driveNm*1e-9);
    fullActive.stapesDisplacement=driveNm*1e-9;
    fluidReference=Math.max(CochleaFluid.reconstruct(passive).maxSpeed,CochleaFluid.reconstruct(fullActive).maxSpeed,1e-30);
    $("model-warning").hidden = false;
    $("model-warning").textContent = result.warning;
    $("model-warning").classList.toggle("error",result.unstable);
    $("confirmed-frequency").textContent =
      (activeMode ? "Aktiv" : "Passiv") +
      " · " +
      fmt(result.frequency, 0) +
      " Hz";
    draw();
  }
  const solver = new SolverClient((value) => {
    pair = value;
    selectResult();
    $("wave-svg").setAttribute("aria-busy", "false");
    $("frequency").removeAttribute("aria-invalid");
    $("input-error").hidden = true;
    const playable = audio.setFrequency(result.frequency);
    audioState(
      playable
        ? undefined
        : "Ton aus · Frequenz über der Audiogrenze dieses Geräts",
    );
    $("status").textContent = "Berechnet";
    $("status").classList.remove("error");
  }, fail);
  function calculate(frequency) {
    const [lo, hi] = frequencyBounds();
    if (!Number.isFinite(frequency) || frequency < lo || frequency > hi) {
      solver.invalidate();
      $("frequency").setAttribute("aria-invalid", "true");
      fail(`Bitte eine Frequenz zwischen ${fmt(lo, 0)} und ${fmt(hi, 0)} Hz eingeben.`);
      return;
    }
    $("frequency").value = frequency;
    $("frequency-slider").value = Math.round(
      (Math.log(frequency / lo) / Math.log(hi / lo)) * 1000,
    );
    $("status").textContent =
      "Berechnung läuft … die letzte bestätigte Antwort bleibt sichtbar.";
    $("wave-svg").setAttribute("aria-busy", "true");
    solver.request({frequency,activity:.8});
  }

  function wave() {
    if (!result) return;
    const scale = 34 / reference.peakAmplitude;
    const xs = result.x.map((x) => 130 + (800 * x) / viewLength());
    $("wave-line").setAttribute(
      "d",
      path(
        xs,
        result.real.map(
          (v, i) =>
            110 -
            scale * (v * Math.cos(phase) - result.imag[i] * Math.sin(phase)),
        ),
      ),
    );
    // Same phase as the prescribed stapes displacement. Window excursions are
    // illustrative: no round-window area or membrane shape is inferred here.
    const windowShift =
      3 * Math.cos(phase);
    $("stapes-motion").setAttribute("transform", `translate(${windowShift} 0)`);
    $("round-window-motion").setAttribute(
      "transform",
      `translate(${-windowShift} 0)`,
    );
    $("oval-attachment").setAttribute(
      "d",
      `M130 74 H${130 + windowShift} M130 96 H${130 + windowShift}`,
    );
    $("round-attachment").setAttribute(
      "d",
      `M130 125 H${130 - windowShift} M130 145 H${130 - windowShift}`,
    );
    // Local complex mean velocity, not the BM envelope or a uniform sine.
    const arrows=[];
    for(const scala of ['sv','st']) {
      for(let x=146;x<=914;x+=48) {
        const position=(x-130)/800*viewLength();
        const velocity=CochleaFluid.sample(fluidFlow,scala,position,phase);
        const span=32*velocity/fluidReference;
        if(Math.abs(span)<.08)continue;
        const end=x+span/2,begin=x-span/2;
        const y=CochleaContour.arrowY(scala,begin,end);
        const head=Math.min(3.5,Math.abs(span)*.35),back=end-Math.sign(span)*head;
        arrows.push(`<path data-scala="${scala}" data-velocity="${velocity}" d="M${begin} ${y} H${end} M${back} ${y-head} L${end} ${y} L${back} ${y+head}" fill="none" stroke="#438d99" stroke-width="1.4" opacity=".8"/>`);
      }
    }
    $("flow-arrows").innerHTML=arrows.join("");
    timeline();
  }
  function spiral() {
    const points = [];
    let distance = 0;
    for (let j = 0; j <= 800; j++) {
      const t = j / 800,
        a = 2.2 - 5 * Math.PI * t,
        r = 91 - 81 * t,
        x = 140 + r * Math.cos(a),
        y = 108 + r * Math.sin(a);
      if (j) distance += Math.hypot(x - points[j - 1].x, y - points[j - 1].y);
      points.push({ x, y, d: distance });
    }
    const d = path(
      points.map((p) => p.x),
      points.map((p) => p.y),
    );
    const target = (result.peakX / viewLength()) * distance;
    const point = points.reduce((a, b) =>
      Math.abs(a.d - target) < Math.abs(b.d - target) ? a : b,
    );
    const active = points.filter((p) => Math.abs(p.d - target) < 11),
      mark = path(
        active.map((p) => p.x),
        active.map((p) => p.y),
      );
    const pp = points.reduce((a, b) =>
      Math.abs(a.d - (passive.peakX / viewLength()) * distance) <
      Math.abs(b.d - (passive.peakX / viewLength()) * distance)
        ? a
        : b,
    );
    $("spiral-svg").innerHTML =
      `<path d="${d}" fill="none" stroke="#89b5b9" stroke-width="20" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#d8ebeb" stroke-width="16" stroke-linecap="round"/>${result.peakAmplitude && !result.peakOutside ? `<path d="${mark}" fill="none" stroke="#c95454" stroke-width="13" stroke-linecap="round"/><circle cx="${point.x}" cy="${point.y}" r="5" fill="#c95454" stroke="white" stroke-width="2"/>` : ""}${comparing() && result.peakAmplitude && !passive.peakOutside ? `<circle cx="${pp.x}" cy="${pp.y}" r="6" fill="none" stroke="#526770" stroke-width="2"/>` : ""}${`<path d="M18 205 L${points[0].x} ${points[0].y} M242 8 L${points.at(-1).x} ${points.at(-1).y}" fill="none" stroke="#64747e" stroke-width=".8"/>`}${text(-22, 220, "Basis", 'class="svg-small"')}${text(244, 8, "Apex", 'class="svg-small"')}`;
  }
  function plot() {
    const left = 40,
      right = 470,
      top = 25,
      bottom = 176,
      axis = CochleaResponse.amplitudeScale;
    const X = (x) => left + ((right - left) * x) / viewLength(),
      Y = (v) => bottom - (bottom-top)*axis.fraction(v);
    let s = `<defs><clipPath id="amplitude-clip"><rect x="${left}" y="${top}" width="${right-left}" height="${bottom-top}"/></clipPath></defs>`;
    for (const tick of axis.ticks) {
      const y = Y(tick);
      s +=
        `<path d="M${left} ${y} H${right}" stroke="#edf1f2"/>` +
        text(
          left - 9,
          y + 4,
          tick === axis.min ? "1 pm" : (tick*1e6).toLocaleString("de-DE",{maximumFractionDigits:1}),
          'text-anchor="end" class="svg-small"',
        );
    }
    for (const mm of axisTicks())
      s += text(
        X(mm / 1000),
        bottom + 21,
        mm,
        'text-anchor="middle" class="svg-small"',
      );
    s +=
      text(left, 14, "Auslenkung (µm) · linear", 'class="svg-small"') +
      text(
        (left + right) / 2,
        224,
        "Position ab Basis (mm)",
        'text-anchor="middle" class="svg-small"',
      );
    s += `<path d="M${left} ${top} V${bottom} H${right}" fill="none" stroke="#8498a1"/>`;
    if ($("greenwood").checked) {
      const x = X(result.greenwoodX);
      s += `<path d="M${x} ${top} V${bottom}" stroke="#bd8a34" stroke-dasharray="4 4"/>`;
    }
    s += `<g clip-path="url(#amplitude-clip)">`;
    s += `<path id="passive-amplitude-curve" d="${path(passive.x.map(X),passive.amplitude.map(Y))}" class="comparison-curve"/><circle cx="${X(passive.peakX)}" cy="${Y(passive.peakAmplitude)}" r="${passive.peakAmplitude && !passive.peakOutside ? 4 : 0}" fill="#697c85"/>`;
    if(activeMode)s += `<path id="active-amplitude-curve" d="${path(result.x.map(X),result.amplitude.map(Y))}" fill="none" stroke="#126e72" stroke-width="2.7"/>`;
    const band = result.peakAnalysis;
    if (result.peakAmplitude && !result.peakOutside && band.widthMm !== null) {
      const y = Y(result.peakAmplitude / Math.sqrt(2));
      s +=
        `<path d="M${X(band.left)} ${y} H${X(band.right)} M${X(band.left)} ${y - 4} v8 M${X(band.right)} ${y - 4} v8" stroke="#bd8a34" stroke-width="1.5" fill="none"/>` +
        text(X(band.right) + 5, y - 5, "−3 dB", 'class="svg-small"');
    }
    if (result.peakAmplitude && !result.peakOutside)
      s += `<path d="M${X(result.peakX)} ${top} V${bottom}" stroke="#c95454" opacity=".25" stroke-width="12"/><circle cx="${X(result.peakX)}" cy="${Y(result.peakAmplitude)}" r="5" fill="#c95454" stroke="white" stroke-width="2"/>`;
    s+='</g>';
    // Independent linear maximum indicator, with no spatial coordinate.
    const detailMax=CochleaResponse.detailMaximum(pair,driveNm);
    const detailUnit=CochleaResponse.unit(detailMax);
    const detailY=v=>bottom-(bottom-top)*v/detailMax;
    s+=`<path d="M495 5 V225" stroke="#e2e8eb"/>`;
    s+=text(510,14,"Maximum · eigene Skala",'class="svg-small"');
    s+=`<g id="maximum-detail-axis" data-maximum="${detailMax}">`;
    s+=text(661,34,detailUnit.label,'text-anchor="end" class="svg-small"');
    s+=`<path d="M550 ${top} V${bottom}" fill="none" stroke="#8498a1"/>`;
    for(let i=0;i<=4;i++){
      const value=detailMax*i/4,y=detailY(value);
      s+=`<path d="M545 ${y} H660" stroke="#edf1f2"/>`;
      s+=text(538,y+4,(value*detailUnit.factor).toLocaleString("de-DE",{maximumSignificantDigits:3}),'text-anchor="end" class="svg-small"');
    }
    s+='</g>';
    const maximumBar=(id,center,value,label,color)=>
      `<rect id="${id}" x="${center-11}" y="${detailY(value)}" width="22" height="${(bottom-top)*value/detailMax}" fill="${color}"/>`+
      text(center,198,label,'text-anchor="middle" class="svg-small"')+
      text(center,218,lengthText(value),'text-anchor="middle" class="svg-small"');
    s+=maximumBar("maximum-passive-bar",581,passive.peakAmplitude,"Passiv","#3f4348");
    if(activeMode)s+=maximumBar("maximum-detail-bar",640,result.peakAmplitude,"Aktiv","#126e72");
    $("amplitude-svg").innerHTML = s;
    $("amplitude-note").textContent="Feste lineare Skala: 1 pm bis 16 µm · keine automatische Anpassung. Werte außerhalb des Bereichs werden abgeschnitten. Rechts: eigene lineare Skala, angepasst an Frequenz und Steigbügelanregung; fest bei Passiv/Aktiv und aktiver Amplitude.";
    $("amplitude-values").textContent="Maximum passiv: "+lengthText(passive.peakAmplitude)+(activeMode ? " · aktiv: "+lengthText(result.peakAmplitude)+" · Verhältnis der Maxima: "+(passive.peakAmplitude>0?fmt(result.peakAmplitude/passive.peakAmplitude,2)+"-fach":"–") : "");
    $("amplitude-svg").setAttribute("aria-label","BM-Auslenkung links fest linear von 1 pm bis 16 µm; rechts passive und bei Aktiv zusätzlich aktive Maxima auf gemeinsamer eigener linearer Skala");
  }
  function phasePlot() {
    // Suppress meaningless far-tail phases below 0.1% of the peak.
    const ids = result.amplitude
        .map((a, i) => (a > result.peakAmplitude * 0.001 ? i : -1))
        .filter((i) => i >= 0),
      values = ids.map((i) => result.phase[i] / (2 * Math.PI));
    const min = values.length ? Math.floor(Math.min(...values)) : 0,
      max = values.length
        ? Math.max(min + 1, Math.ceil(Math.max(...values)))
        : 1;
    const X = (x) => 45 + (470 * x) / viewLength(),
      Y = (y) => 145 - (120 * (y - min)) / (max - min);
    let s =
      `<path d="M45 20 V145 H515" fill="none" stroke="#8498a1"/>` +
      text(45, 170, "Basis", 'class="svg-small"') +
      text(480, 170, "Apex", 'class="svg-small"');
    s +=
      text(38, 27, max, 'text-anchor="end" class="svg-small"') +
      text(38, 145, min, 'text-anchor="end" class="svg-small"') +
      text(
        52,
        17,
        "Perioden · sehr kleine Amplituden ausgeblendet",
        'class="svg-small"',
      );
    if (ids.length)
      s += `<path d="${path(
        ids.map((i) => X(result.x[i])),
        values.map(Y),
      )}" fill="none" stroke="#126e72" stroke-width="2"/>`;
    $("phase-svg").innerHTML = s;
  }
  function draw() {
    if (!result) return;
    const scale = 34 / reference.peakAmplitude,
      xs = result.x.map((x) => 130 + (800 * x) / viewLength()),
      peak = 130 + (800 * result.peakX) / viewLength();

    const assessment = result.peakAnalysis,
      notes = [];
    if (result.peakAmplitude) {
      if (assessment.edgeLimited)
        notes.push(
          "Hüllkurve erreicht den Modellrand: Ortszuordnung eingeschränkt",
        );
      if (assessment.competing) notes.push("Mehrere ähnlich starke Maxima");
      if (!result.peakOutside && assessment.widthMm !== null)
        notes.push(
          "Räumliche −3-dB-Breite: " + fmt(assessment.widthMm, 2) + " mm",
        );
      if (result.frequency < 150)
        notes.push(
          "Tieffrequenter Prüfbereich: Abschluss und Mechanik beeinflussen die Ortslage",
        );
      notes.push("600 Rechenabschnitte · Knotenmaximum; zwei Nachkommastellen sind keine Genauigkeitszusage");
      if (result.normalized && result.frequency >= 14000) notes.push("Basaler Prüfbereich: noch gitterabhängig");
      notes.push("Berechnetes Schwingungsmaximum, kein nachgewiesener Hörort");
    } else notes.push("Keine Anregung – kein Maximum");
    $("peak-assessment").textContent = notes.join(" · ");
    $("peak-assessment").classList.toggle(
      "error",
      !!result.peakAmplitude &&
        (result.peakOutside || assessment.edgeLimited || assessment.competing),
    );
    $("plot-legend").textContent = activeMode ? (comparing() ? "Aktiv · Passiv gestrichelt" : "Aktiv") : "Passiv";
    const px = 130 + (800 * passive.peakX) / viewLength();
    $("passive-marker").innerHTML =
      comparing() && result.peakAmplitude && !passive.peakOutside
        ? `<path d="M${px} 70 V150" stroke="#697c85" stroke-dasharray="4 4"/><circle cx="${px}" cy="${110 - scale * passive.peakAmplitude}" r="4" fill="#697c85"/>`
        : "";
    for (const [id, sign] of [
      ["passive-envelope-top", -1],
      ["passive-envelope-bottom", 1],
    ]) {
      $(id).setAttribute(
        "d",
        path(
          xs,
          passive.amplitude.map((a) => 110 + sign * scale * a),
        ),
      );
      $(id).style.display = $("envelope").checked ? "" : "none";
    }
    $("wave-marker").innerHTML = result.peakAmplitude && !result.peakOutside
      ? `<path d="M${peak} 65 V155" stroke="#c95454" opacity=".16" stroke-width="16"/><circle cx="${peak}" cy="${110 - scale * result.peakAmplitude}" r="5" fill="#c95454" stroke="white" stroke-width="2"/>${text(Math.min(peak + 12, 805), 35, "Maximum", 'style="fill:#c95454" class="svg-small"')}`
      : "";
    $("envelope-top").setAttribute(
      "d",
      path(
        xs,
        result.amplitude.map((a) => 110 - scale * a),
      ),
    );
    $("envelope-bottom").setAttribute(
      "d",
      path(
        xs,
        result.amplitude.map((a) => 110 + scale * a),
      ),
    );
    for (const id of ["envelope-top", "envelope-bottom"])
      $(id).style.display = activeMode && $("envelope").checked ? "" : "none";
    let axis = '<path d="M130 238 H930" stroke="#8da0a8"/>';
    for (const mm of axisTicks()) {
      const x = 130 + (800 * mm) / (viewLength()*1000);
      axis +=
        `<path d="M${x} 238 v6" stroke="#8da0a8"/>` +
        text(
          x,
          258,
          mm === viewLength()*1000 ? fmt(mm,1) + " mm" : mm,
          'text-anchor="middle" class="svg-small"',
        );
    }
    $("wave-axis").innerHTML = axis;
    const gx = 130 + (800 * result.greenwoodX) / viewLength();
    $("greenwood-wave").innerHTML = $("greenwood").checked
      ? `<path d="M${gx} 70 V155" stroke="#bd8a34" stroke-dasharray="5 4"/>${text(Math.min(gx + 8, 770), 219, "Greenwood " + fmt(result.greenwoodX * 1000) + " mm", 'style="fill:#9a7028" class="svg-small"')}`
      : "";
    $("diagnostics").innerHTML = `<dt>Modell</dt><dd>${modelName(result)}</dd><dt>Gitter</dt><dd>${result.cells} Abschnitte · ca. 0,024–0,108 mm</dd><dt>Relativer Gleichungsfehler</dt><dd>${result.residual.toExponential(2)}</dd><dt>Mechanik</dt><dd>${result.mechanicsLabel}</dd><dt>Anregung</dt><dd>${result.sourceLabel}</dd><dt>Maximaler Polrealteil</dt><dd>${fmt(result.maxRealPole,3)} s⁻¹</dd><dt>BM-Maximum</dt><dd>${lengthText(result.peakAmplitude)}</dd><dt>Aktive Amplitude</dt><dd>${activeMode ? fmt(Number($("active-amplitude").value),0)+" %" : "Passiv"}</dd><dt>Steigbügelhub</dt><dd>${lengthText(driveNm*1e-9)}</dd><dt>Einordnung</dt><dd>${result.warning}</dd>`;
    wave();
    plot();
    spiral();
    phasePlot();
  }
  $("frequency").addEventListener("change", () =>
    calculate(Number($("frequency").value)),
  );
  $("frequency-slider").addEventListener("input", () =>
    calculate(
      Math.round(frequencyBounds()[0] * (frequencyBounds()[1] / frequencyBounds()[0]) ** (Number($("frequency-slider").value) / 1000)),
    ),
  );
  document.querySelectorAll("[data-frequency-step]").forEach((b) =>
    b.addEventListener("click", () => {
      const frequency = Number($("frequency").value);
      const [lo, hi] = frequencyBounds();
      if (!Number.isFinite(frequency) || frequency < lo || frequency > hi) {
        calculate(frequency);
        return;
      }
      calculate(
        Math.max(
          lo,
          Math.min(hi, frequency + Number(b.dataset.frequencyStep)),
        ),
      );
    }),
  );
  document
    .querySelectorAll("[data-frequency]")
    .forEach((b) =>
      b.addEventListener("click", () => calculate(Number(b.dataset.frequency))),
    );
  $("drive").addEventListener("input", selectResult);
  for (const mode of ["passive", "active"])
    $("mode-" + mode).addEventListener("click", () => {
      activeMode = mode === "active";
      selectResult();
    });
  $("active-amplitude").addEventListener("input",selectResult);
  for (const id of ["envelope", "greenwood"])
    $(id).addEventListener("change", draw);
  $("volume").addEventListener("input", () => {
    audio.setVolume(Number($("volume").value));
    $("volume-value").textContent = $("volume").value + " %";
  });
  $("audio-toggle").addEventListener("click", async () => {
    if (!result) return;
    if (audio.on || pendingAudio) {
      stopAudio();
      return;
    }
    pendingAudio = true;
    try {
      await audio.start(result.frequency);
      if (!pendingAudio) {
        audio.stop();
        return;
      }
      audio.setFrequency(result.frequency);
      pendingAudio = false;
      audioState();
    } catch (e) {
      pendingAudio = false;
      audio.stop();
      audioState(e.message);
    }
  });
  $("animation-toggle").addEventListener("click", () => {
    if (running) {
      stopAnimation();
      $("animation-toggle").textContent = "▶  Animation fortsetzen";
    } else startAnimation();
  });
  $("phase-position").addEventListener("input", () => {
    stopAnimation();
    phase = (Number($("phase-position").value) / 360) * 2 * Math.PI;
    wave();
  });
  $("next-state").addEventListener("click", () => {
    stopAnimation();
    let degrees = Math.round((phase / (2 * Math.PI)) * 360);
    degrees =
      degrees >= 360 ? 0 : Math.min(360, (Math.floor(degrees / 15) + 1) * 15);
    phase = (degrees / 360) * 2 * Math.PI;
    wave();
  });
  $("speed").addEventListener("change", timeline);
  $("stop").addEventListener("click", () => {
    stopAnimation();
    stopAudio();
  });
  $("reset").addEventListener("click", () => {
    stopAnimation();
    stopAudio();
    phase = 0;
    updateFrequencyRange();
    activeMode = false;
    $("active-amplitude").value = "100";

    selectResult();
    driveNm = 10;
    configureInput();
    $("volume").value = 10;
    audio.setVolume(10);
    $("volume-value").textContent = "10 %";
    $("speed").value = 0.5;
    $("envelope").checked = true;
    $("greenwood").checked = false;
    calculate(1000);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAudio();
    last = performance.now();
  });
  window.addEventListener("pagehide", () => {
    stopAnimation();
    stopAudio();
  });
  function frame(now) {
    if (result && running && !document.hidden) {
      phase =
        (phase +
          Math.min((now - last) / 1000, 0.1) *
            Number($("speed").value) *
            2 *
            Math.PI) %
        (2 * Math.PI);
      wave();
    }
    last = now;
    requestAnimationFrame(frame);
  }
  updateFrequencyRange();
  configureInput();
  calculate(1000);
  startAnimation();
  requestAnimationFrame(frame);
})();
