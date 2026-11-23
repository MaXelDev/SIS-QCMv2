"use strict";
/* Animations d'aide. Anim.monter(conteneur, spec) renvoie une fonction d'arrêt.
   Types disponibles :
   - {type:"discret", x:[...], h:[...], comparer:true?}  convolution discrète glissante (option : bascule corrélation)
   - {type:"rect", x:{a,b,A}, h:{a,b,A}}                   convolution de deux rectangles en temps continu
   - {type:"superposition", x:[...], h:[...]}              y = somme des x[k]·h[n−k] (d'où vient la formule) */

const Anim = (() => {
  const W = 640;

  function stems(f, kmin, kmax, val, cls, dx = 0) {
    let s = "";
    for (let k = kmin; k <= kmax; k++) {
      const v = val(k);
      if (!v) continue;
      const X = f.sx(k) + dx;
      s += `<line class="${cls}" x1="${X}" y1="${f.sy(0)}" x2="${X}" y2="${f.sy(v)}"/><circle class="${cls} f" cx="${X}" cy="${f.sy(v)}" r="4"/>`;
    }
    return s;
  }
  const yTicks = m => (m <= 1 ? [-1, 1] : m <= 3 ? [-m, -1, 1, m].filter((v, i, a) => a.indexOf(v) === i) : [-m, -Math.round(m / 2), Math.round(m / 2), m]);

  function controls(id, min, max, step, val, label) {
    return `<div class="actl">
      <button class="btn small" data-a="prev" type="button" aria-label="Pas précédent">‹</button>
      <label class="arange"><span>${label}</span><input type="range" min="${min}" max="${max}" step="${step}" value="${val}" data-a="sl"></label>
      <output data-a="out"></output>
      <button class="btn small" data-a="next" type="button" aria-label="Pas suivant">›</button>
      <button class="btn small" data-a="play" type="button">Lecture</button></div>`;
  }

  function wire(root, step, draw, delay) {
    const sl = root.querySelector('[data-a="sl"]'), pb = root.querySelector('[data-a="play"]');
    let timer = null;
    const set = v => { sl.value = Math.min(+sl.max, Math.max(+sl.min, v)); draw(+sl.value); };
    sl.addEventListener("input", () => draw(+sl.value));
    root.querySelector('[data-a="prev"]').onclick = () => set(+sl.value - step);
    root.querySelector('[data-a="next"]').onclick = () => set(+sl.value + step);
    const stop = () => { clearInterval(timer); timer = null; pb.textContent = "Lecture"; };
    pb.onclick = () => {
      if (timer) return stop();
      pb.textContent = "Pause";
      timer = setInterval(() => { let v = +sl.value + step; if (v > +sl.max + 1e-9) v = +sl.min; set(+v.toFixed(4)); }, delay);
    };
    draw(+sl.value);
    return stop;
  }

  /* ---------- Convolution discrète ---------- */
  function discret(root, sp) {
    const x = sp.x, h = sp.h, L = x.length, Mh = h.length;
    const xv = k => (k >= 0 && k < L ? x[k] : 0), hv = k => (k >= 0 && k < Mh ? h[k] : 0);
    let mode = "conv";
    const res = () => {
      const r = {};
      for (let n = -(Mh + 1); n <= L + Mh; n++) {
        let s = 0;
        for (let k = 0; k < L; k++) s += xv(k) * (mode === "conv" ? hv(n - k) : hv(k - n));
        r[n] = s;
      }
      return r;
    };
    let R = res();
    const nmin = -Mh - 1, nmax = L + Mh - 1, kmin = -Mh - 1, kmax = L + Mh;
    root.innerHTML = (sp.comparer ? `<div class="toggle" role="group" aria-label="Opération"><button class="btn small on" data-m="conv" type="button">Convolution x * h</button><button class="btn small" data-m="corr" type="button">Corrélation R<sub>xh</sub></button></div>` : "")
      + controls("n", nmin, nmax, 1, 0, "n") + `<div class="acalc" aria-live="polite"></div><svg class="asvg" viewBox="0 0 ${W} 400"></svg>
      <p class="alegend"><span class="sw c1"></span>x[k] fixe <span class="sw c2"></span><span data-l>h[n − k] : h retourné puis décalé de n</span> <span class="sw c3"></span>colonnes où les deux sont non nuls</p>`;
    const svg = root.querySelector("svg"), calc = root.querySelector(".acalc"), out = root.querySelector("output");
    const draw = n => {
      const mx = Math.max(1, ...x.map(Math.abs), ...h.map(Math.abs));
      const my = Math.max(1, ...Object.values(R).map(Math.abs));
      const f1 = frame(W, 190, { x0: kmin, x1: kmax, xs: 1, y0: -mx * 1.2, y1: mx * 1.25, yt: yTicks(mx), titre: "axe k" });
      const f2 = frame(W, 190, { x0: kmin, x1: kmax, xs: 1, y0: -my * 1.2, y1: my * 1.25, yt: yTicks(my), titre: mode === "conv" ? "y[n] = (x * h)[n]" : "R[n] = Σ x[k]·h[k − n]" });
      const g = k => (mode === "conv" ? hv(n - k) : hv(k - n));
      let s = "", terms = [], sum = 0;
      for (let k = kmin; k <= kmax; k++) {
        if (xv(k) && g(k)) {
          s += `<rect class="hl" x="${f1.sx(k) - 13}" y="22" width="26" height="150" rx="5"/>`;
          terms.push(`(${fr(xv(k))})(${fr(g(k))})`); sum += xv(k) * g(k);
        }
      }
      s += f1.s + stems(f1, kmin, kmax, xv, "c1", -5) + stems(f1, kmin, kmax, g, "c2 d", 5);
      let s2 = f2.s;
      for (let m = nmin; m <= n; m++) {
        const v = R[m]; const X = f2.sx(m);
        if (!v) { s2 += `<circle class="${m === n ? "c3" : "c0"} z" cx="${X}" cy="${f2.sy(0)}" r="3"/>`; continue; }
        s2 += `<line class="${m === n ? "c3" : "c0"}" x1="${X}" y1="${f2.sy(0)}" x2="${X}" y2="${f2.sy(v)}"/><circle class="${m === n ? "c3" : "c0"} f" cx="${X}" cy="${f2.sy(v)}" r="4"/>`;
      }
      s2 += `<line class="cur" x1="${f2.sx(n)}" y1="20" x2="${f2.sx(n)}" y2="170"/>`;
      svg.innerHTML = s + `<g transform="translate(0,205)">${s2}</g>`;
      out.textContent = "n = " + n;
      const nom = mode === "conv" ? "y" : "R";
      calc.innerHTML = terms.length ? `${nom}[${n}] = ${terms.join(" + ")} = <b>${fr(sum)}</b>` : `${nom}[${n}] = <b>0</b> : aucune colonne en commun`;
    };
    const stop = wire(root, 1, draw, 1100);
    root.querySelectorAll("[data-m]").forEach(b => b.onclick = () => {
      mode = b.dataset.m; R = res();
      root.querySelectorAll("[data-m]").forEach(c => c.classList.toggle("on", c === b));
      root.querySelector("[data-l]").textContent = mode === "conv" ? "h[n − k] : h retourné puis décalé de n" : "h[k − n] : h seulement décalé de n, pas retourné";
      draw(+root.querySelector('[data-a="sl"]').value);
    });
    return stop;
  }

  /* ---------- Deux rectangles en temps continu ---------- */
  function rect(root, sp) {
    const X = sp.x, H = sp.h;
    const tmin = X.a + H.a - 1, tmax = X.b + H.b + 1;
    const ov = t => Math.max(0, Math.min(X.b, t - H.a) - Math.max(X.a, t - H.b));
    const z = t => X.A * H.A * ov(t);
    const zmax = X.A * H.A * Math.min(X.b - X.a, H.b - H.a);
    const t0 = Math.min(X.a, tmin - H.b), t1 = Math.max(X.b, tmax - H.a);
    const st = 0.05;
    root.innerHTML = controls("t", +tmin.toFixed(2), +tmax.toFixed(2), st, +((X.a + H.a)).toFixed(2), "t")
      + `<div class="acalc" aria-live="polite"></div><svg class="asvg" viewBox="0 0 ${W} 400"></svg>
      <p class="alegend"><span class="sw c1"></span>x(τ) fixe <span class="sw c2"></span>h(t − τ) : h retourné puis centré sur t <span class="sw c3"></span>aire commune = z(t)</p>`;
    const svg = root.querySelector("svg"), calc = root.querySelector(".acalc"), out = root.querySelector("output");
    const mA = Math.max(X.A, H.A);
    const draw = t => {
      const f1 = frame(W, 190, { x0: t0, x1: t1, xs: (t1 - t0) > 8 ? 1 : 0.5, y0: -mA * 0.12, y1: mA * 1.25, yt: [...new Set([X.A, H.A])], titre: "axe τ" });
      const f2 = frame(W, 190, { x0: tmin, x1: tmax, xs: (tmax - tmin) > 8 ? 1 : 0.5, y0: -zmax * 0.12, y1: zmax * 1.25, yt: [zmax], titre: "z(t) = (x * h)(t)" });
      const a = Math.max(X.a, t - H.b), b = Math.min(X.b, t - H.a), hmin = Math.min(X.A, H.A);
      let s = "";
      if (b > a) s += `<rect class="hlf" x="${f1.sx(a)}" y="${f1.sy(hmin)}" width="${f1.sx(b) - f1.sx(a)}" height="${f1.sy(0) - f1.sy(hmin)}"/>`;
      s += f1.s;
      s += `<rect class="c1 r" x="${f1.sx(X.a)}" y="${f1.sy(X.A)}" width="${f1.sx(X.b) - f1.sx(X.a)}" height="${f1.sy(0) - f1.sy(X.A)}"/>`;
      s += `<rect class="c2 r d" x="${f1.sx(t - H.b)}" y="${f1.sy(H.A)}" width="${f1.sx(t - H.a) - f1.sx(t - H.b)}" height="${f1.sy(0) - f1.sy(H.A)}"/>`;
      let p = "", pd = "";
      for (let i = 0; i <= 400; i++) {
        const tt = tmin + (tmax - tmin) * i / 400, pt = `${f2.sx(tt).toFixed(1)},${f2.sy(z(tt)).toFixed(1)}`;
        p += (i ? " " : "") + pt; if (tt <= t + 1e-9) pd += (pd ? " " : "") + pt;
      }
      let s2 = f2.s + (pd ? `<polyline class="c3 thick" points="${pd}"/>` : "")
        + `<circle class="c3 f" cx="${f2.sx(t)}" cy="${f2.sy(z(t))}" r="5"/>`;
      svg.innerHTML = s + `<g transform="translate(0,205)">${s2}</g>`;
      out.textContent = "t = " + fr(t);
      const o = ov(t);
      const ph = o <= 1e-9 ? "pas de recouvrement" : Math.abs(z(t) - zmax) < 1e-9 ? "recouvrement maximal" : (t < (X.a + X.b + H.a + H.b) / 2 ? "le recouvrement grandit" : "le recouvrement diminue");
      calc.innerHTML = `recouvrement = ${fr(o)} s, donc z(t) = ${fr(X.A)} × ${fr(H.A)} × ${fr(o)} = <b>${fr(z(t))}</b> <span class="muted">(${ph})</span>`;
    };
    return wire(root, st, draw, 60);
  }

  /* ---------- Superposition : d'où vient la formule ---------- */
  function superposition(root, sp) {
    const x = sp.x, h = sp.h, L = x.length, Mh = h.length, N = L + Mh - 1;
    const xv = k => (k >= 0 && k < L ? x[k] : 0), hv = k => (k >= 0 && k < Mh ? h[k] : 0);
    const y = conv(x, h);
    root.innerHTML = controls("k", 0, L, 1, 0, "étape")
      + `<div class="acalc" aria-live="polite"></div><svg class="asvg" viewBox="0 0 ${W} 560"></svg>
      <p class="alegend"><span class="sw c1"></span>impulsion x[k]·δ[n − k] <span class="sw c2"></span>sa réponse x[k]·h[n − k] <span class="sw c3"></span>somme des réponses = y[n]</p>`;
    const svg = root.querySelector("svg"), calc = root.querySelector(".acalc"), out = root.querySelector("output");
    const n0 = -2, n1 = N + 1;
    const draw = k => {
      const mx = Math.max(1, ...x.map(Math.abs)), mc = Math.max(1, ...x.flatMap(a => h.map(b => Math.abs(a * b)))), my = Math.max(1, ...y.map(Math.abs));
      const done = k >= L, kk = Math.min(k, L - 1);
      const f1 = frame(W, 175, { x0: n0, x1: n1, xs: 1, y0: -mx * 1.2, y1: mx * 1.3, yt: yTicks(mx), titre: "entrée x[n] = Σ x[k]·δ[n − k]" });
      const f2 = frame(W, 175, { x0: n0, x1: n1, xs: 1, y0: -mc * 1.2, y1: mc * 1.3, yt: yTicks(mc), titre: done ? "toutes les réponses x[k]·h[n − k]" : `réponse du SLTI à x[${kk}]·δ[n − ${kk}]` });
      const f3 = frame(W, 175, { x0: n0, x1: n1, xs: 1, y0: -my * 1.2, y1: my * 1.3, yt: yTicks(my), titre: done ? "y[n] complet" : `somme des réponses pour k = 0 à ${kk}` });
      let s1 = f1.s + stems(f1, n0, n1, n => (done || n !== kk ? xv(n) : 0), "c0") + (done ? "" : stems(f1, n0, n1, n => (n === kk ? xv(n) : 0), "c1"));
      let s2 = f2.s;
      const upto = done ? L - 1 : kk;
      for (let j = 0; j <= upto; j++) s2 += stems(f2, n0, n1, n => xv(j) * hv(n - j), j === kk && !done ? "c2" : "c0", (j - upto / 2) * 3);
      let partial = Array(N).fill(0);
      for (let j = 0; j <= upto; j++) for (let n = 0; n < N; n++) partial[n] += xv(j) * hv(n - j);
      let s3 = f3.s + stems(f3, n0, n1, n => partial[n] || 0, "c3");
      svg.innerHTML = s1 + `<g transform="translate(0,190)">${s2}</g><g transform="translate(0,380)">${s3}</g>`;
      out.textContent = done ? "fin" : "k = " + kk;
      calc.innerHTML = done
        ? `En additionnant toutes les réponses : <b>y[n] = Σ<sub>k</sub> x[k]·h[n − k]</b>, c'est la convolution. Résultat : y = ${vec(y)}`
        : `Linéarité + invariance : x[${kk}]·δ[n − ${kk}] donne x[${kk}]·h[n − ${kk}] = ${fr(xv(kk))} × h décalé de ${kk}`;
    };
    return wire(root, 1, draw, 1600);
  }

  const types = { discret, rect, superposition };
  return {
    monter(root, sp) { return types[sp.type] ? types[sp.type](root, sp) : () => {}; }
  };
})();
