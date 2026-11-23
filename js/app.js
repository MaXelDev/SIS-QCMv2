"use strict";
const $ = s => document.querySelector(s), app = $("#app"), LT = "abcdefghijklmnopqrstuvwxyz";
let S = null, choix = null, avecIA = true, stopAnim = null;

/* ---------- Thème ---------- */
function setTheme(t) { document.documentElement.dataset.theme = t; $("#theme").textContent = t === "dark" ? "Mode clair" : "Mode sombre"; }
setTheme(matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
$("#theme").onclick = () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
$("#logo").onclick = () => { if (!S || S.done || confirm("Quitter le QCM en cours ? Tes réponses seront perdues.")) home(); };

/* ---------- Outils ---------- */
const inst = e => (typeof e === "function" ? e() : e);
const pages = p => { // [184,185,191] -> "p. 184–185, 191"
  const s = [...p].sort((a, b) => a - b), out = [];
  for (let i = 0; i < s.length; i++) { let j = i; while (j + 1 < s.length && s[j + 1] === s[j] + 1) j++; out.push(j > i ? `${s[i]}–${s[j]}` : `${s[i]}`); i = j; }
  return (s.length > 1 ? "p. " : "p. ") + out.join(", ");
};
const isOK = i => S.qs[i].options.every((o, j) => o.ok === S.ans[i].has(j));
const answered = () => S.ans.filter(a => a.size).length;

/* ---------- Fenêtre générique ---------- */
const dlg = $("#dlg");
function ouvrir(titre, html, onMount, petit = false) {
  if (stopAnim) { stopAnim(); stopAnim = null; }
  dlg.className = petit ? "small" : "";
  dlg.innerHTML = `<div class="dlg-h"><h3>${titre}</h3><button class="btn ghost small" type="button" data-close aria-label="Fermer">Fermer</button></div><div class="dlg-b">${html}</div>`;
  dlg.querySelectorAll("[data-close]").forEach(b => b.onclick = () => dlg.close());
  dlg.showModal();
  if (onMount) onMount(dlg);
}
dlg.addEventListener("close", () => { if (stopAnim) { stopAnim(); stopAnim = null; } });
dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });

/* ---------- Accueil ---------- */
function home() {
  S = null;
  const qcms = QCM.liste.map(d => {
    const qs = d.questions.map(inst);
    return { d, n: qs.length, ia: qs.filter(q => q.ai).length };
  });
  if (!choix) choix = new Set(QCM.liste.map(d => d.id));
  const nIA = qcms.reduce((a, q) => a + (choix.has(q.d.id) ? q.ia : 0), 0);
  app.innerHTML = `<section class="home">
    <div><h1>Entraînement aux QCM de SysCom</h1>
      <p class="lead">Refais les QCM de Signaux et systèmes autant de fois que tu veux. Tu réponds à tout, puis tu termines : la correction n'arrive qu'à ce moment-là.</p>
      <p class="lead">Bloqué sur une question ? Le bouton Aide donne un indice et une animation, le bouton Cours renvoie à la bonne diapo du poly.</p></div>
    <figure class="scope" aria-label="Animation : convolution de deux rectangles"><svg id="hero" viewBox="0 0 520 240"></svg>
      <p>Le rectangle violet glisse sur le bleu : l'aire commune trace la convolution.</p></figure>
  </section>
  <section class="setup"><h2>Choisis tes QCM</h2><p>Tu peux en combiner plusieurs : les questions sont mélangées.</p>
    <div class="qlist">${qcms.map(q => `<label class="qitem"><input type="checkbox" data-id="${q.d.id}" ${choix.has(q.d.id) ? "checked" : ""}>
      <div><b>${q.d.titre}</b><span>${q.d.description || ""}</span></div><span class="count">${q.n - q.ia} du QCM, ${q.ia} IA</span></label>`).join("")}</div>
    <label class="aiopt"><input type="checkbox" id="useAI" ${avecIA ? "checked" : ""}><span>Inclure les ${nIA} questions créées par IA à partir du cours <span class="badge ai">IA</span><br><span class="muted">Leurs valeurs numériques changent à chaque lancement.</span></span></label>
    <ul class="rules"><li>Ordre des questions et des réponses mélangé à chaque lancement.</li>
      <li>1 point si tu coches exactement les bonnes réponses, 0 sinon.</li>
      <li>Rien n'est enregistré : recharger la page remet tout à zéro.</li></ul>
    <button id="go" class="btn primary big" type="button">Commencer le QCM</button><p class="err" id="err" role="alert"></p>
  </section>`;
  app.querySelectorAll(".qitem input").forEach(c => c.onchange = () => { c.checked ? choix.add(c.dataset.id) : choix.delete(c.dataset.id); home(); });
  $("#useAI").onchange = e => { avecIA = e.target.checked; };
  $("#go").onclick = () => {
    if (!choix.size) { $("#err").textContent = "Coche au moins un QCM pour commencer."; return; }
    start();
  };
  hero();
}

/* Animation d'accueil : un seul mouvement, coupé si l'utilisateur réduit les animations */
function hero() {
  const svg = $("#hero"); if (!svg) return;
  const W = 520, f1 = frame(W, 120, { x0: -2.5, x1: 2.5, xs: 0.5, y0: -0.2, y1: 2.4, yt: [], titre: "x(τ) et h(t − τ)" });
  const f2 = frame(W, 120, { x0: -2.5, x1: 2.5, xs: 0.5, y0: -0.2, y1: 2.4, yt: [], titre: "z(t) = x * h" });
  const ov = t => Math.max(0, Math.min(0.5, t + 1) - Math.max(-0.5, t - 1));
  const draw = t => {
    const a = Math.max(-0.5, t - 1), b = Math.min(0.5, t + 1);
    let s = (b > a ? `<rect class="hlf" x="${f1.sx(a)}" y="${f1.sy(1)}" width="${f1.sx(b) - f1.sx(a)}" height="${f1.sy(0) - f1.sy(1)}"/>` : "") + f1.s
      + `<rect class="c1 r" x="${f1.sx(-0.5)}" y="${f1.sy(1)}" width="${f1.sx(0.5) - f1.sx(-0.5)}" height="${f1.sy(0) - f1.sy(1)}"/>`
      + `<rect class="c2 r d" x="${f1.sx(t - 1)}" y="${f1.sy(2)}" width="${f1.sx(t + 1) - f1.sx(t - 1)}" height="${f1.sy(0) - f1.sy(2)}"/>`;
    let p = "";
    for (let i = 0; i <= 200; i++) { const tt = -2.5 + 5 * i / 200; if (tt > t) break; p += `${f2.sx(tt).toFixed(1)},${f2.sy(2 * ov(tt)).toFixed(1)} `; }
    svg.innerHTML = s + `<g transform="translate(0,120)">${f2.s}<polyline class="c3 thick" points="${p}"/><circle class="c3 f" cx="${f2.sx(t)}" cy="${f2.sy(2 * ov(t))}" r="4.5"/></g>`;
  };
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return draw(0.2);
  let t0 = null;
  const loop = ts => {
    if (!document.body.contains(svg)) return;
    if (t0 === null) t0 = ts;
    const ph = ((ts - t0) / 6000) % 1;
    draw(-2.3 + 4.6 * ph);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

/* ---------- Lancement ---------- */
function start() {
  const qs = [];
  QCM.liste.filter(d => choix.has(d.id)).forEach(d => d.questions.forEach(e => {
    const q = inst(e);
    if (q.ai && !avecIA) return;
    qs.push({ ...q, qcm: d.titre, fig: typeof q.figure === "function" ? q.figure() : (q.figure || ""), options: q.garderOrdre ? q.options : shuffle(q.options) });
  }));
  const m = shuffle(qs);
  S = { qs: m, ans: m.map(() => new Set()), flag: m.map(() => false), aide: m.map(() => false), cur: 0, done: false, filtre: "all" };
  renderQuiz(); window.scrollTo(0, 0);
}

/* ---------- Rendu d'une question ---------- */
function navHTML() {
  return S.qs.map((q, i) => {
    let c = "nv";
    if (!S.done) { if (S.ans[i].size) c += " answered"; if (S.flag[i]) c += " flagged"; if (i === S.cur) c += " current"; }
    else c += isOK(i) ? " good" : " wrong";
    return `<button class="${c}" data-i="${i}" type="button" aria-label="Question ${i + 1}">${i + 1}</button>`;
  }).join("");
}

function head(i) {
  const q = S.qs[i];
  let h = `<span class="qn">Question ${i + 1}<small> / ${S.qs.length}</small></span>`;
  if (q.ai) h += `<span class="badge ai" title="Question créée par IA à partir du cours">Créée par IA avec le cours</span>`;
  if (S.done) {
    h += isOK(i) ? `<span class="badge ok">Juste, +1</span>` : `<span class="badge bad">Faux, 0</span>`;
    if (S.aide[i]) h += `<span class="badge aide">Aide consultée</span>`;
  }
  h += `<span class="how">${q.type === "multi" ? "Plusieurs réponses possibles" : "Une seule réponse"}</span>`;
  return `<div class="qh">${h}</div>`;
}

function tools(i) {
  const q = S.qs[i]; let s = "";
  if (!S.done && (q.indice || q.anim)) s += `<button class="btn help ${S.aide[i] ? "used" : ""}" data-help="${i}" type="button">Aide${S.aide[i] ? " (déjà ouverte)" : ""}</button>`;
  if (S.done && q.anim) s += `<button class="btn help" data-help="${i}" type="button">Revoir l'animation</button>`;
  if (q.cours && q.cours.length) s += `<button class="btn cours" data-cours="${i}" type="button">Cours, ${pages(q.cours)}</button>`;
  return s ? `<div class="tools">${s}</div>` : "";
}

function optsHTML(i) {
  const q = S.qs[i], type = q.type === "multi" ? "checkbox" : "radio", rad = q.type === "multi" ? "" : " radio";
  return `<div class="opts ${q.grille ? "grille" : ""}">` + q.options.map((o, j) => {
    const sel = S.ans[i].has(j);
    if (!S.done) return `<label class="opt${rad}"><input type="${type}" name="q${i}" data-j="${j}" ${sel ? "checked" : ""}><span class="mark"></span><span class="lt">${LT[j]}.</span><span class="ot">${o.t}</span></label>`;
    let c = "opt rv" + rad, tag = "";
    if (sel && o.ok) { c += " ok"; tag = "Bonne réponse"; }
    else if (sel) { c += " bad"; tag = "Faux"; }
    else if (o.ok) { c += " miss"; tag = "Oubliée"; }
    return `<div class="${c}"><input type="${type}" disabled ${sel ? "checked" : ""}><span class="mark"></span><span class="lt">${LT[j]}.</span><span class="ot">${o.t}</span>${tag ? `<span class="tag">${tag}</span>` : ""}</div>`;
  }).join("") + "</div>";
}

function card(i) {
  const q = S.qs[i];
  const expl = S.done && q.explication ? `<div class="expl"><b>Explication</b>${q.explication}</div>` : "";
  return `<article class="card ${S.done ? (isOK(i) ? "isok" : "iswrong") : ""}" id="rq${i}">${head(i)}<div class="qt">${q.enonce}</div>${q.fig}${tools(i)}${optsHTML(i)}${expl}</article>`;
}

function bindTools(root) {
  root.querySelectorAll("[data-help]").forEach(b => b.onclick = () => aide(+b.dataset.help));
  root.querySelectorAll("[data-cours]").forEach(b => b.onclick = () => cours(S.qs[+b.dataset.cours].cours));
}

/* ---------- Aide : indice + animation ---------- */
function aide(i) {
  const q = S.qs[i];
  if (!S.done) S.aide[i] = true;
  ouvrir(S.done ? "Animation" : "Aide",
    (q.indice && !S.done ? `<p class="indice">${q.indice}</p>` : "") + (q.anim ? `<div id="anim"></div>` : ""),
    d => { if (q.anim) stopAnim = Anim.monter(d.querySelector("#anim"), q.anim); });
  if (!S.done) { const b = app.querySelector(`[data-help="${i}"]`); if (b) { b.classList.add("used"); b.textContent = "Aide (déjà ouverte)"; } }
}

/* ---------- Pages du poly ---------- */
function cours(liste) {
  const p = [...liste].sort((a, b) => a - b);
  let k = 0;
  const show = d => {
    const n = p[k];
    d.querySelector(".page-nav").innerHTML = p.map((v, j) => `<button class="btn small ${j === k ? "on" : ""}" data-p="${j}" type="button">p. ${v}</button>`).join("");
    d.querySelectorAll("[data-p]").forEach(b => b.onclick = () => { k = +b.dataset.p; show(d); });
    const box = d.querySelector(".page-box");
    box.innerHTML = `<img class="page-img" alt="Poly de cours, page ${n}" src="cours/p-${n}.jpg">`;
    box.querySelector("img").onerror = () => {
      box.innerHTML = `<div class="page-miss"><b>Poly de cours, page ${n}</b>L'image de cette page n'a pas encore été ajoutée au site.<br>Ouvre le poly « Signaux et systèmes » à la page ${n}.</div>`;
    };
  };
  ouvrir("Poly de cours, " + pages(p), `<div class="page-nav"></div><div class="page-box"></div>`, show);
}

/* ---------- Écran du QCM ---------- */
function refresh() {
  const n = S.qs.length;
  $("#nvg").innerHTML = navHTML(); $("#cnt").textContent = `${answered()} / ${n} répondues`; $("#bar").style.width = answered() / n * 100 + "%";
}

function go(i) { S.cur = i; renderQuiz(); window.scrollTo(0, 0); }

function renderQuiz() {
  const n = S.qs.length, i = S.cur, a = answered();
  app.innerHTML = `<div class="layout"><aside class="side"><h3>Navigation</h3><div class="sub" id="cnt">${a} / ${n} répondues</div><div class="bar"><i id="bar" style="width:${a / n * 100}%"></i></div>
    <div class="grid" id="nvg">${navHTML()}</div>
    <div class="legend"><span><i class="dot" style="background:var(--c1);border-color:var(--c1)"></i>Répondue</span><span><i class="dot"></i>Sans réponse</span><span><i class="dot" style="background:var(--c3);border-color:var(--c3);border-radius:50%"></i>Marquée pour revoir</span></div>
    <button class="btn primary" id="fin" type="button">Terminer le QCM</button></aside>
    <section class="main">${card(i)}<div class="nav"><button class="btn" id="prev" type="button" ${i === 0 ? "disabled" : ""}>Précédente</button>
    <span><button class="btn ghost" id="clr" type="button">Effacer ma réponse</button> <button class="btn ghost" id="flg" type="button">${S.flag[i] ? "Retirer le marquage" : "Marquer pour revoir"}</button></span>
    <button class="btn" id="next" type="button" ${i === n - 1 ? "disabled" : ""}>Suivante</button></div></section></div>`;
  $("#nvg").onclick = e => { const b = e.target.closest(".nv"); if (b) go(+b.dataset.i); };
  $("#prev").onclick = () => go(S.cur - 1);
  $("#next").onclick = () => go(S.cur + 1);
  $("#clr").onclick = () => { S.ans[S.cur].clear(); renderQuiz(); };
  $("#flg").onclick = () => { S.flag[S.cur] = !S.flag[S.cur]; renderQuiz(); };
  $("#fin").onclick = demanderFin;
  bindTools(app);
  app.querySelectorAll(".opt input").forEach(inp => inp.onchange = () => {
    const j = +inp.dataset.j, s = S.ans[S.cur];
    if (S.qs[S.cur].type === "multi") inp.checked ? s.add(j) : s.delete(j); else { s.clear(); s.add(j); }
    refresh();
  });
}

function demanderFin() {
  const n = S.qs.length, un = n - answered(), fl = S.flag.filter(Boolean).length;
  ouvrir("Terminer le QCM ?",
    `<p>Tu as répondu à <b>${answered()} / ${n}</b> questions.${un ? ` Les ${un} sans réponse compteront 0.` : ""}${fl ? ` ${fl} question(s) sont marquées pour revoir.` : ""}</p>
     <p>Une fois terminé, tu ne pourras plus modifier tes réponses.</p>
     <div class="dlg-actions"><button class="btn ghost" type="button" data-close>Continuer à répondre</button><button class="btn primary" type="button" id="ok">Terminer et voir la correction</button></div>`,
    d => { d.querySelectorAll("[data-close]").forEach(b => b.onclick = () => d.close()); d.querySelector("#ok").onclick = () => { d.close(); S.done = true; renderReview(); window.scrollTo(0, 0); }; }, true);
}

/* ---------- Correction ---------- */
function renderReview() {
  const n = S.qs.length, sc = S.qs.filter((_, i) => isOK(i)).length, pct = Math.round(sc / n * 100), na = S.aide.filter(Boolean).length;
  app.innerHTML = `<div class="layout"><aside class="side"><h3>Correction</h3><div class="sub">${sc} juste(s), ${n - sc} fausse(s)</div><div class="grid" id="nvg">${navHTML()}</div>
    <div class="legend"><span><i class="dot" style="background:var(--okbg);border-color:var(--ok)"></i>Juste</span><span><i class="dot" style="background:var(--badbg);border-color:var(--bad)"></i>Fausse</span></div>
    <button class="btn primary" id="again" type="button">Recommencer</button><button class="btn" id="hm" type="button">Retour à l'accueil</button></aside>
    <section class="main ${S.filtre === "bad" ? "f-bad" : S.filtre === "ok" ? "f-ok" : ""}"><div class="card"><div class="score"><span class="big">${sc} / ${n}</span>
      <div><b>${pct} % de questions justes</b><br><span class="muted">1 point par question entièrement juste.${na ? ` Aide ouverte sur ${na} question(s).` : ""}</span></div></div>
      <div class="filters"><button class="btn small ${S.filtre === "all" ? "on" : ""}" data-f="all" type="button">Toutes</button><button class="btn small ${S.filtre === "bad" ? "on" : ""}" data-f="bad" type="button">Fausses seulement</button><button class="btn small ${S.filtre === "ok" ? "on" : ""}" data-f="ok" type="button">Justes seulement</button></div></div>
    ${S.qs.map((_, i) => card(i)).join("")}</section></div>`;
  $("#nvg").onclick = e => {
    const b = e.target.closest(".nv"); if (!b) return;
    if ($("#rq" + b.dataset.i).offsetParent === null) { S.filtre = "all"; renderReview(); }
    $("#rq" + b.dataset.i).scrollIntoView({ behavior: "smooth", block: "start" });
  };
  $("#again").onclick = start; $("#hm").onclick = home;
  app.querySelectorAll(".filters .btn").forEach(b => b.onclick = () => { S.filtre = b.dataset.f; renderReview(); });
  bindTools(app);
}

home();
