"use strict";
/* QCM : convolution et SLTI (Chantal Muller, poly « Signaux et systèmes »).
   Pages « cours » = numéros des diapos du poly (identiques aux pages du PDF). */

const SK = "Σ<sub>k=−∞</sub><sup>+∞</sup>";
const INT = "∫<sub>−∞</sub><sup>+∞</sup>";

QCM.ajouter({
  id: "convolution",
  titre: "Convolution et SLTI",
  description: "Opération de convolution, sortie d'un SLTI, calculs en temps discret et continu.",
  questions: [

  /* ================= Questions du QCM ================= */

  {
    id: "conv-proprietes",
    ...M("L'opération de convolution",
      ["permet de trouver la solution d'un système TD régi par une équation aux différences à coefficients constants initialement au repos.",
       "a un élément neutre qui est le signal impulsion ou le dirac.",
       "permet de trouver la solution d'un système TC régi par une équation différentielle à coefficients constants initialement au repos.",
       "nécessite de connaitre la sortie associée au signal impulsion ou au dirac."],
      ["permet de connaitre la sortie de n'importe quel système lorsqu'on applique un signal en entrée.",
       "a un élément neutre qui est le signal échelon.",
       "s'applique à tout système linéaire."]),
    indice: "La convolution ne marche que pour un système <b>linéaire ET invariant dans le temps</b> (SLTI). Méfie-toi de « n'importe quel système » ou « tout système linéaire ». Et que donne x * δ ? Et x * u ?",
    anim: { type: "superposition", x: [2, 1, -1], h: [1, 0.5, 0.25] },
    cours: [11, 128, 191, 196, 197],
    explication: "Une équation différentielle ou aux différences à coefficients constants, au repos, décrit un SLTI : y = x * h. Il faut connaître h (réponse au dirac). x * δ = x (élément neutre), alors que x * u intègre x. Un système linéaire mais variant dans le temps n'a pas un h unique : pas de convolution."
  },

  {
    id: "conv-formule-discrete",
    ...U("En temps discret, la réponse y[n] d'un SLTI caractérisé par sa réponse impulsionnelle h[n], lorsqu'on applique une entrée x[n], s'obtient par l'opération suivante :<div class=\"eq\">y[n] = " + SK + " x[k]·h[n − k]</div>",
      "Vrai", ["Faux"], { garderOrdre: true }),
    indice: "Décompose x en impulsions décalées : x[n] = Σ x[k]·δ[n − k]. Que donne le SLTI pour chacune ? Regarde l'animation pas à pas.",
    anim: { type: "superposition", x: [1, 2, -1], h: [1, -0.5] },
    cours: [181, 182, 184],
    explication: "Chaque impulsion x[k]·δ[n − k] donne x[k]·h[n − k] (linéarité + invariance). La somme de ces réponses est exactement la somme de convolution. Pas de conjugué : le conjugué n'apparaît que dans la corrélation."
  },

  {
    id: "conv-calcul-1",
    ...U("Soit un signal discret x qui prend les valeurs suivantes :<br>x = [1 2 3 2 1]<br><br>Soit un SLTI initialement au repos dont la réponse impulsionnelle h de durée finie prend les valeurs suivantes :<br>h = [1 −1]<br><br>Le résultat du filtrage de x par h est :",
      "y = [1&nbsp;&nbsp;1&nbsp;&nbsp;1&nbsp;&nbsp;−1&nbsp;&nbsp;−1&nbsp;&nbsp;−1]",
      ["y = [1&nbsp;&nbsp;3&nbsp;&nbsp;5&nbsp;&nbsp;5&nbsp;&nbsp;3&nbsp;&nbsp;1]", "y = [−1&nbsp;&nbsp;−3&nbsp;&nbsp;−5&nbsp;&nbsp;−5&nbsp;&nbsp;−3&nbsp;&nbsp;−1]", "y = [−1&nbsp;&nbsp;−3&nbsp;&nbsp;−5&nbsp;&nbsp;5&nbsp;&nbsp;3&nbsp;&nbsp;1]",
       "y = [1&nbsp;&nbsp;2&nbsp;&nbsp;3&nbsp;&nbsp;2&nbsp;&nbsp;1&nbsp;&nbsp;0]", "y = [−1&nbsp;&nbsp;−1&nbsp;&nbsp;−1&nbsp;&nbsp;1&nbsp;&nbsp;1&nbsp;&nbsp;1]"]),
    indice: "h = [1 −1] donne y[n] = x[n] − x[n − 1]. Vérifs express : y[0] = x[0]·h[0], longueur 5 + 2 − 1 = 6, et Σy = Σx · Σh = 0.",
    anim: { type: "discret", x: [1, 2, 3, 2, 1], h: [1, -1] },
    cours: [184, 185, 191],
    explication: "y[n] = x[n] − x[n − 1] : 1, 2−1, 3−2, 2−3, 1−2, 0−1 = [1 1 1 −1 −1 −1]. [1 3 5 5 3 1] correspond à h = [1 1], [1 2 3 2 1 0] à h = δ."
  },

  {
    id: "conv-rectangles",
    ...M("Soient deux signaux x(t) et y(t) que l'on va convoluer : z(t) = x(t) * y(t).<br>Cochez les bonnes réponses concernant z(t) :",
      ["z(t) est non nul pendant 3 secondes", "z(t) est un trapèze", "L'intégrale de z(t) vaut 4"],
      ["z(t) est une rampe", "z(t) est non nul pendant 2 secondes", "L'intégrale de z(t) vaut 3", "z(t) est non nul pendant 1 secondes",
       "z(t) est un sinus cardinal", "z(t) est un échelon", "L'intégrale de z(t) vaut 2", "z(t) est un rectangle", "z(t) est un triangle"]),
    figure: () => figs(rectSVG([{ a: -0.5, b: 0.5, A: 1 }], { titre: "x(t)", x0: -2, x1: 2, ymax: 2, yt: [1, 2], cls: "c1" }),
                       rectSVG([{ a: -1, b: 1, A: 2 }], { titre: "y(t)", x0: -2, x1: 2, ymax: 2, yt: [1, 2], cls: "c2" })),
    indice: "Trois réflexes : la durée de z est la somme des durées, l'aire de z est le produit des aires, et deux rectangles de largeurs différentes donnent un trapèze (même largeur : un triangle).",
    anim: { type: "rect", x: { a: -0.5, b: 0.5, A: 1 }, h: { a: -1, b: 1, A: 2 } },
    cours: [120, 186, 187],
    explication: "Durée : 1 + 2 = 3 s, de −1,5 à 1,5. Aire : (1×1) × (2×2) = 4. Largeurs différentes, donc trapèze, avec un plateau à 1×2×1 = 2. Le sinus cardinal est la transformée de Fourier d'un rectangle, pas une convolution de rectangles."
  },

  {
    id: "conv-calcul-2",
    ...U("Soit un signal discret x qui prend les valeurs suivantes :<br>x = [−1 1 1 −1]<br><br>Soit un SLTI initialement au repos dont la réponse impulsionnelle h de durée finie prend les valeurs suivantes :<br>h = [1 −1 1 −1]<br><br>Le résultat du filtrage de x par h est :",
      "y = [−1&nbsp;&nbsp;2&nbsp;&nbsp;−1&nbsp;&nbsp;0&nbsp;&nbsp;1&nbsp;&nbsp;−2&nbsp;&nbsp;1]",
      ["y = [−1&nbsp;&nbsp;−2&nbsp;&nbsp;1&nbsp;&nbsp;0&nbsp;&nbsp;1&nbsp;&nbsp;2&nbsp;&nbsp;1]", "y = [−1&nbsp;&nbsp;0&nbsp;&nbsp;1&nbsp;&nbsp;0&nbsp;&nbsp;1&nbsp;&nbsp;0&nbsp;&nbsp;−1]", "y = [−1&nbsp;&nbsp;−2&nbsp;&nbsp;−1&nbsp;&nbsp;0&nbsp;&nbsp;1&nbsp;&nbsp;2&nbsp;&nbsp;1]",
       "y = [−1&nbsp;&nbsp;2&nbsp;&nbsp;−1&nbsp;&nbsp;4&nbsp;&nbsp;1&nbsp;&nbsp;−2&nbsp;&nbsp;1]", "y = [1&nbsp;&nbsp;−2&nbsp;&nbsp;1&nbsp;&nbsp;0&nbsp;&nbsp;−1&nbsp;&nbsp;2&nbsp;&nbsp;−1]"]),
    indice: "Pas besoin de tout calculer : y[0] = x[0]·h[0] et le dernier terme = x[3]·h[3]. Attention, à n = 0 une seule case se recouvre.",
    anim: { type: "discret", x: [-1, 1, 1, -1], h: [1, -1, 1, -1] },
    cours: [184, 185],
    explication: "y[0] = (−1)(1) = −1 et y[6] = (−1)(−1) = 1 éliminent presque tout. Σy doit valoir Σx·Σh = 0, ce qui élimine la réponse avec un 4. Le calcul complet donne [−1 2 −1 0 1 −2 1]."
  },

  {
    id: "conv-formules-slti",
    ...M("Soit un SLTI causal, stable et initialement au repos de réponse impulsionnelle h, en entrée le signal x et en sortie le signal y.<br>Cochez les propriétés valides :",
      ["y(t) = x(t) * h(t)", `y(t) = ${INT} x(τ)·h(t − τ) dτ`, `y(t) = ${INT} h(τ)·x(t − τ) dτ`],
      ["y(t) = x(t) × h(t)", "h(t) = y(t) / x(t)", `y(t) = ${INT} x(t)·h(τ − t) dt`]),
    indice: "En <b>temps</b> on convolue, en <b>fréquence</b> on multiplie. Une bonne intégrale de convolution se fait en dτ et contient t − τ. Et la convolution est commutative.",
    anim: { type: "rect", x: { a: 0, b: 1, A: 1 }, h: { a: 0, b: 2, A: 1 } },
    cours: [120, 121, 186, 188],
    explication: "y = x * h, développée en ∫ x(τ)h(t − τ)dτ ou, par commutativité, ∫ h(τ)x(t − τ)dτ. Le produit x × h et le quotient y / x n'ont de sens qu'en fréquence (Y = X·H). La dernière formule intègre en dt (le résultat ne dépend plus de t) et ne retourne pas h."
  },

  {
    id: "conv-graphes",
    type: "multi",
    enonce: "Quelle est la sortie d'un SLTI initialement au repos lorsque l'entrée appliquée x[n] et la réponse impulsionnelle h[n] sont les signaux représentés ci-dessous :",
    figure: () => figs(stemSVG([1, 1, -1, -1], { titre: "x[n] (entrée)", cls: "c1" }), stemSVG([1, -1, 1, -1], { titre: "h[n] (réponse impulsionnelle)", cls: "c2" })),
    options: [
      O(stemSVG(neg(conv([1, 1, -1, -1], [1, -1, 1, -1])), { x0: -3, x1: 9, ymax: 2, yt: [-2, -1, 1, 2], label: "proposition" })),
      O(stemSVG(conv([1, 1, -1, -1], [1, -1, 1, -1]), { x0: -3, x1: 9, ymax: 1, label: "proposition" }), true),
      O(stemSVG(scale(conv([1, 1, -1, -1], [1, -1, 1, -1]), 2), { x0: -3, x1: 9, ymax: 2, yt: [-2, -1, 1, 2], label: "proposition" })),
      O(stemSVG([1, -3, 0, 0, 3, 0, -1], { x0: -3, x1: 9, ymax: 3, yt: [-3, -2, 2, 3], label: "proposition" }))
    ],
    grille: true,
    indice: "<b>Lis l'axe vertical</b> : deux propositions ont la même allure à un facteur près. Puis vérifie y[0] = x[0]·h[0].",
    anim: { type: "discret", x: [1, 1, -1, -1], h: [1, -1, 1, -1] },
    cours: [184, 185],
    explication: "y = [1 0 −1 0 −1 0 1], amplitudes de 1. La proposition de même forme mais montant à ±2 vaut 2y : fausse, car y[0] = 1·1 = 1. Celle qui commence à −1 a tous les signes inversés."
  },

  /* ================= Questions créées par IA (données variables) ================= */

  () => {
    let x, h, y, c;
    do {
      x = Array.from({ length: rnd(3, 4) }, () => pick([-2, -1, 1, 2, 3]));
      h = Array.from({ length: rnd(2, 3) }, () => pick([-1, 1, 2, -2]));
      y = conv(x, h); c = conv(x, h.slice().reverse());
    } while (same(y, c));
    const d = [neg(y), c, [...y.slice(1), 0], scale(y, 2), conv(x, neg(h)).map((v, i) => (i === 0 ? -v : v))];
    const seen = new Set([vec(y)]), bad = [];
    d.forEach(a => { const s = vec(a); if (!seen.has(s)) { seen.add(s); bad.push("y = " + s); } });
    return {
      id: "ia-calcul-discret", ai: true,
      ...U(`Soit x = ${vec(x)} et un SLTI initialement au repos de réponse impulsionnelle h = ${vec(h)} (les deux commencent en n = 0).<br>Que vaut la sortie y = x * h ?`, "y = " + vec(y), bad.slice(0, 4)),
      indice: `Longueur attendue : ${x.length} + ${h.length} − 1 = ${y.length}. Premier terme : x[0]·h[0] = ${fr(x[0] * h[0])}. Dernier terme : ${fr(x[x.length - 1] * h[h.length - 1])}. Et Σy = Σx·Σh = ${fr(x.reduce((a, b) => a + b) * h.reduce((a, b) => a + b))}.`,
      anim: { type: "discret", x, h, comparer: true },
      cours: [184, 185],
      explication: `y = ${vec(y)}. La proposition ${vec(c)} correspond à h non retourné (corrélation) : piège classique.`
    };
  },

  () => {
    let x, h, y, c;
    do {
      x = Array.from({ length: rnd(3, 4) }, () => pick([-1, 1, 1, 0]));
      h = Array.from({ length: 3 }, () => pick([-1, 1]));
      x[0] = pick([-1, 1]); x[x.length - 1] = pick([-1, 1]);
      y = conv(x, h); c = conv(x, h.slice().reverse());
    } while (same(y, c) || same(c, neg(y)) || same(c, scale(y, 2)));
    const m = Math.max(...y.map(Math.abs)), o = { x0: -2, x1: 8 };
    const plot = a => stemSVG(a, { ...o, ymax: Math.max(...a.map(Math.abs)) || 1, label: "proposition" });
    return {
      id: "ia-graphes", ai: true, type: "unique", grille: true,
      enonce: "Quelle est la sortie du SLTI (initialement au repos) pour l'entrée x[n] et la réponse impulsionnelle h[n] ci-dessous ?",
      figure: () => figs(stemSVG(x, { titre: "x[n]", cls: "c1", x0: -3, x1: 6 }), stemSVG(h, { titre: "h[n]", cls: "c2", x0: -3, x1: 6 })),
      options: shuffle([O(plot(y), true), O(plot(neg(y))), O(plot(scale(y, 2))), O(plot(c))]),
      garderOrdre: true,
      indice: `Lis bien les graduations verticales. Le premier échantillon vaut x[0]·h[0] = ${fr(x[0] * h[0])} et le maximum en valeur absolue vaut ${m}.`,
      anim: { type: "discret", x, h },
      cours: [184, 185],
      explication: `y = ${vec(y)}. Les pièges : −y (signes inversés), 2y (bonne forme, mauvaise échelle) et la corrélation (h non retourné).`
    };
  },

  () => {
    let W1, W2, A1, A2;
    do { W1 = pick([1, 2, 3]); W2 = pick([1, 2, 3, 4]); A1 = pick([1, 2]); A2 = pick([1, 2, 3]); } while (A1 * W1 * A2 * W2 === A1 * A2);
    const tri = W1 === W2, D = W1 + W2, aire = A1 * W1 * A2 * W2, zmax = A1 * A2 * Math.min(W1, W2);
    const good = [`z(t) est non nul pendant ${D} secondes`, `z(t) est un ${tri ? "triangle" : "trapèze"}`, `L'intégrale de z(t) vaut ${aire}`, `La valeur maximale de z(t) est ${zmax}`];
    const badC = [`z(t) est non nul pendant ${Math.max(W1, W2)} secondes`, `z(t) est un ${tri ? "trapèze" : "triangle"}`, "z(t) est un rectangle", "z(t) est un sinus cardinal",
      `L'intégrale de z(t) vaut ${A1 * A2}`, `L'intégrale de z(t) vaut ${A1 * W1 + A2 * W2}`, `La valeur maximale de z(t) est ${A1 * A2 * Math.max(W1, W2)}`];
    const bad = [...new Set(badC)].filter(b => !good.includes(b));
    const xa = -W1 / 2, ha = -W2 / 2, lim = Math.max(W1, W2) / 2 + 0.5;
    return {
      id: "ia-rectangles", ai: true,
      ...M("On convolue les deux rectangles ci-dessous : z(t) = x(t) * y(t). Cochez les bonnes réponses.", good, bad),
      figure: () => figs(rectSVG([{ a: xa, b: -xa, A: A1 }], { titre: "x(t)", cls: "c1", x0: -lim, x1: lim, ymax: Math.max(A1, A2), yt: [...new Set([A1, A2])] }),
                         rectSVG([{ a: ha, b: -ha, A: A2 }], { titre: "y(t)", cls: "c2", x0: -lim, x1: lim, ymax: Math.max(A1, A2), yt: [...new Set([A1, A2])] })),
      indice: "Durée = somme des durées. Aire = produit des aires. Plateau = produit des hauteurs × la plus petite largeur. Largeurs égales : triangle, sinon trapèze.",
      anim: { type: "rect", x: { a: xa, b: -xa, A: A1 }, h: { a: ha, b: -ha, A: A2 } },
      cours: [186, 187],
      explication: `Durée ${W1} + ${W2} = ${D} s. Aire (${A1}×${W1}) × (${A2}×${W2}) = ${aire}. Maximum ${A1}×${A2}×${Math.min(W1, W2)} = ${zmax}. ${tri ? "Même largeur : triangle." : "Largeurs différentes : trapèze."}`
    };
  },

  {
    id: "ia-proprietes", ai: true,
    ...M("Cochez les propriétés vraies de la convolution (signaux discrets ou continus).",
      ["x * h = h * x (commutativité)", "x * (h₁ + h₂) = x * h₁ + x * h₂ (distributivité)", "x[n] * δ[n − n₀] = x[n − n₀]",
       "Deux SLTI en série équivalent à un seul SLTI de réponse impulsionnelle h₁ * h₂", "Si x dure L échantillons et h dure M échantillons, y = x * h dure L + M − 1 échantillons"],
      ["x[n] * δ[n − n₀] = x[n + n₀]", "x * u = x, l'échelon est l'élément neutre", "Une convolution en temps correspond à une convolution en fréquence",
       "Si x dure L échantillons et h dure M échantillons, y = x * h dure L + M échantillons", "L'ordre de deux SLTI en série change la réponse impulsionnelle globale"]),
    indice: "Pense aux diapos « Propriétés des SLTI » : commutativité, distributivité, associativité, élément neutre et décalage.",
    anim: { type: "discret", x: [1, 2, 1], h: [0, 0, 1] },
    cours: [120, 188, 189, 190, 191],
    explication: "Convoluer par δ[n − n₀] retarde de n₀ (l'animation le montre avec h = δ[n − 2]). Convolution en temps ↔ produit en fréquence. L'associativité rend l'ordre des SLTI en série sans effet. Longueur : L + M − 1."
  },

  {
    id: "ia-td-tc", ai: true,
    ...M("Cochez les affirmations correctes sur les systèmes TD (temps discret) et TC (temps continu).",
      ["Un système TD manipule des signaux x[n] définis pour n entier.", "En TC, la sortie d'un SLTI s'obtient par une intégrale de convolution.",
       "Un système TD régi par une équation aux différences à coefficients constants, initialement au repos, est un SLTI.",
       "On passe d'un signal TC à un signal TD par échantillonnage : x[n] = x(nTₑ)."],
      ["En TD, la sortie d'un SLTI s'obtient par une intégrale de convolution.", "Un système TC est décrit par une équation aux différences.",
       "Un signal TD est défini pour tout réel t.", "En TD, l'élément neutre de la convolution est l'échelon u[n]."]),
    indice: "TC : variable t réelle, équation différentielle, dirac δ(t), intégrale. TD : variable n entière, équation aux différences, impulsion δ[n], somme.",
    anim: { type: "rect", x: { a: 0, b: 1, A: 1 }, h: { a: 0, b: 1, A: 1 } },
    cours: [6, 9, 11, 184, 186],
    explication: "TD : somme Σ, équation aux différences, élément neutre δ[n]. TC : intégrale ∫, équation différentielle, élément neutre δ(t)."
  },

  () => {
    const x = Array.from({ length: rnd(3, 5) }, () => pick([-3, -2, -1, 1, 2, 3]));
    const h = Array.from({ length: rnd(2, 4) }, () => pick([-2, -1, 1, 2]));
    const y = conv(x, h), N = y.length, a = y[0], b = y[N - 1];
    const fmt = (p, q, r) => `y[0] = ${fr(p)}, dernier échantillon = ${fr(q)}, longueur ${r}`;
    const cand = [fmt(a, b, N + 1), fmt(-a, -b, N), fmt(b, a, N), fmt(x[0] + h[0], x[x.length - 1] + h[h.length - 1], N), fmt(a, b, N - 1)];
    const good = fmt(a, b, N);
    return {
      id: "ia-express", ai: true,
      ...U(`x = ${vec(x)} et h = ${vec(h)} commencent tous les deux en n = 0. Sans tout calculer, que vaut y = x * h au début et à la fin ?`, good, [...new Set(cand)].filter(c => c !== good).slice(0, 4)),
      indice: "À n = 0, une seule case se recouvre : y[0] = x[0]·h[0]. Le dernier échantillon est le produit des deux derniers termes. Longueur : L + M − 1.",
      anim: { type: "discret", x, h },
      cours: [184, 185],
      explication: `y[0] = ${fr(x[0])} × ${fr(h[0])} = ${fr(a)}, dernier = ${fr(x[x.length - 1])} × ${fr(h[h.length - 1])} = ${fr(b)}, longueur ${x.length} + ${h.length} − 1 = ${N}. Le résultat complet est y = ${vec(y)}.`
    };
  },

  {
    id: "ia-correlation", ai: true,
    ...M("Convolution ou corrélation ? Cochez les affirmations correctes (signaux d'énergie finie).",
      [`L'intercorrélation discrète s'écrit R<sub>xy</sub>[k] = Σ<sub>n</sub> x[n]·y*[n − k]`, `La convolution discrète s'écrit (x * h)[n] = ${SK} x[k]·h[n − k], sans conjugué`,
       "Pour des signaux réels, R<sub>yx</sub>(t) = x(−t) * y(t)", "L'autocorrélation R<sub>xx</sub> est maximale en 0 et vaut l'énergie du signal"],
      ["La convolution x * h fait apparaître le conjugué h*", "L'intercorrélation est commutative : R<sub>xy</sub> = R<sub>yx</sub>",
       "La corrélation retourne le signal décalé, la convolution non", "L'autocorrélation d'un signal réel est impaire"]),
    indice: "Le conjugué vient du produit scalaire : il est dans la corrélation, pas dans la convolution. Dans l'animation, compare les deux modes : la corrélation ne retourne pas h.",
    anim: { type: "discret", x: [1, 2, 0, -1], h: [1, 1, -1], comparer: true },
    cours: [85, 88, 93, 94],
    explication: "Corrélation : produit scalaire, donc conjugué, sans retournement. Convolution : retournement, sans conjugué. R<sub>xy</sub>(τ) = R*<sub>yx</sub>(−τ) (symétrie hermitienne), pas R<sub>yx</sub>. Pour x réel, R<sub>xx</sub> est paire et maximale en 0 (= E<sub>x</sub>)."
  },

  {
    id: "ia-indicielle", ai: true,
    ...M("On note i la réponse indicielle d'un SLTI (sortie quand l'entrée est l'échelon u) et h sa réponse impulsionnelle. Cochez les relations vraies.",
      ["i[n] = h[n] * u[n]", "h[n] = i[n] − i[n − 1]", "h(t) = di(t)/dt"],
      ["i[n] = h[n] × u[n]", "h(t) = ∫ i(τ) dτ", "i = h, car l'échelon est l'élément neutre de la convolution", "h[n] = i[n] + i[n − 1]"]),
    indice: "La réponse à n'importe quelle entrée est h * entrée. Et δ[n] = u[n] − u[n − 1], δ(t) = du/dt.",
    anim: { type: "discret", x: [1, 1, 1, 1, 1], h: [1, 0.5, 0.25] },
    cours: [72, 193],
    explication: "i = h * u (la sortie pour l'entrée u). Comme δ[n] = u[n] − u[n − 1], on retrouve h[n] = i[n] − i[n − 1], et en continu h = di/dt. L'animation convolue h par un échelon tronqué : on voit la sortie cumuler h."
  },

  {
    id: "ia-causal-stable", ai: true,
    ...M("Soit un SLTI de réponse impulsionnelle h. Cochez les affirmations correctes.",
      ["Il est causal si et seulement si h[n] = 0 pour n < 0", `Il est stable si et seulement si ${SK} |h[k]| < ∞`, "Il est sans mémoire si h[n] = 0 pour n ≠ 0"],
      ["Il est causal si et seulement si h[n] = 0 pour n > 0", "Il est stable dès que h est bornée", "Un SLTI est toujours causal", "Il est stable si et seulement si h[0] = 1"]),
    indice: "Causal : la sortie ne dépend pas du futur de l'entrée. Stable : entrée bornée → sortie bornée, ce qui demande une réponse impulsionnelle absolument sommable (ou intégrable).",
    anim: { type: "superposition", x: [1, -1, 2], h: [1, 0.5, 0.25] },
    cours: [10, 192],
    explication: "Causalité : h[n] = 0 pour n < 0. Stabilité EBSB : Σ|h[k]| < ∞ (h bornée ne suffit pas : l'échelon est borné mais pas sommable). Sans mémoire : h = K·δ."
  },

  () => {
    const a = rnd(-3, 0), b = a + rnd(1, 3), c = rnd(-2, 2), d = c + rnd(1, 3);
    const I = (p, q) => `[${fr(p)} ; ${fr(q)}]`;
    const good = I(a + c, b + d);
    const cand = [I(Math.min(a, c), Math.max(b, d)), I(a - d, b - c), I(a + c, b + d + 1), I(b + c, a + d), I(a - c, b - d)].filter(s => s !== good);
    return {
      id: "ia-support", ai: true,
      ...U(`x(t) est non nul uniquement sur ${I(a, b)} et h(t) uniquement sur ${I(c, d)}. Sur quel intervalle z(t) = x(t) * h(t) est-il non nul ?`, good, [...new Set(cand)].slice(0, 4)),
      indice: "Début de z = début de x + début de h. Fin de z = fin de x + fin de h. La durée est donc la somme des durées.",
      anim: { type: "rect", x: { a, b, A: 1 }, h: { a: c, b: d, A: 1 } },
      cours: [186, 187, 191],
      explication: `z commence en ${fr(a)} + ${fr(c)} = ${fr(a + c)} et finit en ${fr(b)} + ${fr(d)} = ${fr(b + d)}. Durée ${b - a} + ${d - c} = ${b + d - a - c} s.`
    };
  }

  ]
});
