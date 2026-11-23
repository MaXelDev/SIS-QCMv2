"use strict";
/* Outils communs + registre des QCM.
   Chaque fichier de qcm/ appelle QCM.ajouter({...}) : voir qcm/_modele.js */

const QCM = {
  liste: [],
  ajouter(def) { this.liste.push(def); }
};

const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const O = (t, ok = false) => ({ t, ok });
const fr = x => String(+(+x).toFixed(3)).replace(".", ",").replace("-", "−");
const vec = a => "[" + a.map(fr).join("&nbsp;&nbsp;") + "]";

/* Convolution et corrélation discrètes (signaux commençant en n = 0) */
function conv(x, h) {
  const y = Array(x.length + h.length - 1).fill(0);
  x.forEach((a, i) => h.forEach((b, j) => { y[i + j] += a * b; }));
  return y;
}
const neg = a => a.map(v => -v || 0);
const scale = (a, k) => a.map(v => v * k);
const same = (a, b) => a.length === b.length && a.every((v, i) => Math.abs(v - b[i]) < 1e-9);

/* Question à choix multiples : bonnes puis mauvaises réponses */
function M(enonce, bonnes, mauvaises, extra = {}) {
  return { type: "multi", enonce, options: [...bonnes.map(t => O(t, true)), ...mauvaises.map(t => O(t))], ...extra };
}
/* Question à réponse unique */
function U(enonce, bonne, mauvaises, extra = {}) {
  return { type: "unique", enonce, options: [O(bonne, true), ...mauvaises.map(t => O(t))], ...extra };
}

/* ---------- Graphiques SVG statiques ---------- */
function frame(w, h, o) {
  const L = 34, R = 10, T = 22, B = 22;
  const sx = v => L + (v - o.x0) / (o.x1 - o.x0) * (w - L - R);
  const sy = v => h - B - (v - o.y0) / (o.y1 - o.y0) * (h - T - B);
  let s = `<line class="ax" x1="${sx(o.x0)}" y1="${sy(0)}" x2="${sx(o.x1)}" y2="${sy(0)}"/>`;
  for (let t = Math.ceil(o.x0 / o.xs) * o.xs; t <= o.x1 + 1e-9; t += o.xs)
    s += `<line class="tk" x1="${sx(t)}" y1="${sy(0) - 3}" x2="${sx(t)}" y2="${sy(0) + 3}"/><text x="${sx(t)}" y="${h - 6}" text-anchor="middle">${fr(t)}</text>`;
  for (const v of o.yt || [])
    s += `<line class="grid" x1="${L}" y1="${sy(v)}" x2="${w - R}" y2="${sy(v)}"/><text x="${L - 6}" y="${sy(v) + 4}" text-anchor="end">${fr(v)}</text>`;
  if (o.titre) s += `<text class="ttl" x="${L}" y="14">${o.titre}</text>`;
  return { s, sx, sy };
}

/* Diagramme en bâtons : valeurs à partir de n0 */
function stemSVG(vals, o = {}) {
  const w = o.w || 300, h = o.h || 170, n0 = o.n0 || 0;
  const m = o.ymax || Math.max(1, ...vals.map(Math.abs));
  const yt = o.yt || (m <= 1 ? [-1, 1] : m <= 2 ? [-2, -1, 1, 2] : [-m, -Math.round(m / 2), Math.round(m / 2), m]);
  const f = frame(w, h, { x0: o.x0 ?? -4, x1: o.x1 ?? 8, xs: o.xs || 2, y0: -m * 1.15, y1: m * 1.15, yt, titre: o.titre });
  let s = f.s;
  const col = o.cls || "c1";
  for (let n = Math.ceil(o.x0 ?? -4); n <= (o.x1 ?? 8); n++) {
    const k = n - n0, v = k >= 0 && k < vals.length ? vals[k] : 0;
    if (v === 0) s += `<circle class="${col} z" cx="${f.sx(n)}" cy="${f.sy(0)}" r="2.2"/>`;
    else s += `<line class="${col}" x1="${f.sx(n)}" y1="${f.sy(0)}" x2="${f.sx(n)}" y2="${f.sy(v)}"/><circle class="${col} f" cx="${f.sx(n)}" cy="${f.sy(v)}" r="3.6"/>`;
  }
  return `<svg class="plot" viewBox="0 0 ${w} ${h}" role="img" aria-label="${o.label || "signal discret"}">${s}</svg>`;
}

/* Rectangle(s) en temps continu : liste de {a, b, A} */
function rectSVG(rects, o = {}) {
  const w = o.w || 300, h = o.h || 170;
  const m = o.ymax || Math.max(...rects.map(r => r.A));
  const f = frame(w, h, { x0: o.x0 ?? -2, x1: o.x1 ?? 2, xs: o.xs || 0.5, y0: -m * 0.12, y1: m * 1.2, yt: o.yt || [m], titre: o.titre });
  let s = f.s;
  rects.forEach(r => {
    s += `<polyline class="${o.cls || "c1"}" fill="none" points="${f.sx(o.x0 ?? -2)},${f.sy(0)} ${f.sx(r.a)},${f.sy(0)} ${f.sx(r.a)},${f.sy(r.A)} ${f.sx(r.b)},${f.sy(r.A)} ${f.sx(r.b)},${f.sy(0)} ${f.sx(o.x1 ?? 2)},${f.sy(0)}"/>`;
  });
  return `<svg class="plot" viewBox="0 0 ${w} ${h}" role="img" aria-label="${o.label || "signal continu"}">${s}</svg>`;
}

const figs = (...svgs) => `<div class="figs">${svgs.join("")}</div>`;
