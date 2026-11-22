/*
 * Le blob de Boyoyoy : une créature gélatineuse faite de caractères de code.
 * Elle ondule toute seule, évite le curseur, et rebondit quand on clique dessus.
 *
 * Rendu : une grille de cellules sur un <canvas>. Chaque cellule dessine un bloc
 * coloré et un caractère pris dans un atlas pré-rendu (plus rapide que fillText).
 * Une copie floutée du canvas, en dessous, donne la lueur.
 */
(function () {
  "use strict";

  var root = document.querySelector("[data-blob]");
  if (!root) return;

  var stage = root.querySelector(".blob-stage");
  var main = root.querySelector(".blob-main");
  var bloom = root.querySelector(".blob-bloom");
  var pokeBtn = root.querySelector("[data-poke]");
  var ctx = main.getContext("2d");
  var bctx = bloom.getContext("2d");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Le texte qui coule à l'intérieur du blob : du vrai code, nourri par la config.
  var data = window.BOYOYOY || { site: {}, projets: [] };
  var names = (data.projets || []).map(function (p) { return '"' + p.slug + '"'; }).join(", ");
  var CODE =
    'const boyoyoy = { createur: "' + ((data.site && data.site.createur) || "jolean").toLowerCase() +
    '", projets: [' + names + '], statut: "en_cours" }; ' +
    "function rebondir(blob, t) { blob.r += Math.sin(t * 3) * blob.elasticite; return blob; } " +
    'while (curieux) { const idee = imaginer("et si on essayait ?"); construire(idee); partager(idee); } ';

  var DENSE = "8#X0S&%@";
  var NOISE = "<>/\\{}[]=+*^?!;:_~|";
  var SHADOW = "-=~";

  var glyphSet = {};
  (CODE + DENSE + NOISE + SHADOW + "·").split("").forEach(function (c) {
    if (c !== " ") glyphSet[c] = true;
  });
  var GLYPHS = Object.keys(glyphSet);
  var GI = {};
  GLYPHS.forEach(function (c, i) { GI[c] = i; });
  var BLOCK = GLYPHS.length; // colonne de l'atlas réservée au bloc plein
  var DOT = GI["·"];

  var codeIdx = CODE.split("").map(function (c) { return c === " " ? -1 : GI[c]; });
  var denseIdx = DENSE.split("").map(function (c) { return GI[c]; });
  var noiseIdx = NOISE.split("").map(function (c) { return GI[c]; });
  var shadowIdx = SHADOW.split("").map(function (c) { return GI[c]; });

  // De la braise au cœur jusqu'au glacier sur le bord.
  var PALETTE = ["#ff7a2e", "#ff9a57", "#ffc28f", "#fde6d2", "#eef4f6", "#c6ebf4", "#8bd5e9", "#4d9fc0"];

  var W = 0, H = 0, dpr = 1, cell = 10, cols = 0, rows = 0;
  var atlas = null, ap = 0;
  var heat = new Float32Array(0);
  var t = 0, last = 0, raf = 0, running = false, inView = true, burstUntil = 0;

  // Modes de vibration du bord (k = nombre de lobes), chacun est un ressort amorti.
  var modes = [];
  for (var k = 2; k <= 7; k++) modes.push({ k: k, a: 0, b: 0, va: 0, vb: 0, w: 2.6 + k * 1.7 });
  var hop = { h: 0, v: 0 };          // hauteur du saut, en rayons
  var squash = { x: 0, v: 0 };       // écrasement / étirement
  var ptr = { x: 0, y: 0, on: false };

  function geometry() {
    var R = Math.min(cols, rows) * 0.35;
    var sy = 1 + squash.x * 0.24 + 0.018 * Math.sin(t * 1.6);
    if (sy < 0.6) sy = 0.6;
    var sx = 1 / Math.sqrt(sy);
    var base = rows * 0.53;
    var cy = base + R - R * sy - hop.h * R;
    return { R: R, cx: cols * 0.5, cy: cy, sx: sx, sy: sy, ground: base + R };
  }

  function idleWobble(th, time) {
    // Un peu plus large en bas : le blob est posé, comme une gelée.
    return 0.09 * Math.max(0, Math.sin(th)) +
      0.035 * Math.sin(3 * th + time * 0.9) +
      0.025 * Math.sin(5 * th - time * 1.3) +
      0.02 * Math.sin(2 * th + time * 0.55);
  }

  function displacement(th, time) {
    var d = idleWobble(th, time);
    for (var m = 0; m < modes.length; m++) {
      var md = modes[m];
      d += md.a * Math.cos(md.k * th) + md.b * Math.sin(md.k * th);
    }
    return d;
  }

  function step(dt) {
    t += dt;
    var z = 0.11;
    for (var m = 0; m < modes.length; m++) {
      var md = modes[m];
      md.va += (-md.w * md.w * md.a - 2 * z * md.w * md.va) * dt; md.a += md.va * dt;
      md.vb += (-md.w * md.w * md.b - 2 * z * md.w * md.vb) * dt; md.b += md.vb * dt;
    }

    // Écrasement : un ressort autour de 0.
    squash.v += (-81 * squash.x - 2 * 0.14 * 9 * squash.v) * dt;
    squash.x += squash.v * dt;

    // Saut : gravité, rebond au sol avec perte d'énergie. Boyoyoy.
    if (hop.h > 0 || hop.v > 0) {
      hop.v -= 9 * dt;
      hop.h += hop.v * dt;
      if (hop.h <= 0) {
        var impact = -hop.v;
        hop.h = 0;
        hop.v = impact > 0.55 ? impact * 0.5 : 0;
        squash.v -= impact * 2.4;
        for (var i = 0; i < modes.length; i++) {
          if (modes[i].k % 2 === 0) modes[i].vb += impact * 0.05 * modes[i].w * 0.3;
        }
      }
    }

    // Le blob esquive le curseur : une poussée douce vers l'intérieur près du bord.
    var g = geometry();
    if (ptr.on) {
      var dx = (ptr.x - g.cx) / g.sx, dy = (ptr.y - g.cy) / g.sy;
      var s = Math.sqrt(dx * dx + dy * dy) / g.R;
      if (s > 0.5 && s < 1.5) {
        var th = Math.atan2(dy, dx);
        var f = (1 - Math.abs(s - 1) / 0.5) * 1.8 * dt;
        for (var n = 0; n < modes.length; n++) {
          modes[n].va -= f * Math.cos(modes[n].k * th);
          modes[n].vb -= f * Math.sin(modes[n].k * th);
        }
      }
      // Les caractères s'agitent autour du curseur.
      var rad = 3.5, pxi = ptr.x | 0, pyi = ptr.y | 0;
      for (var yy = Math.max(0, pyi - 4); yy <= Math.min(rows - 1, pyi + 4); yy++) {
        for (var xx = Math.max(0, pxi - 4); xx <= Math.min(cols - 1, pxi + 4); xx++) {
          var dd = Math.hypot(xx + 0.5 - ptr.x, yy + 0.5 - ptr.y);
          if (dd < rad) {
            var hv = 1 - dd / rad, id = yy * cols + xx;
            if (heat[id] < hv) heat[id] = hv;
          }
        }
      }
    }
    var decay = dt * 2.2;
    for (var q = 0; q < heat.length; q++) if (heat[q] > 0) heat[q] = Math.max(0, heat[q] - decay);
  }

  function render() {
    if (!atlas || !cols) return;
    ctx.clearRect(0, 0, main.width, main.height);
    var g = geometry(), R = g.R, cx = g.cx, cy = g.cy, sx = g.sx, sy = g.sy;
    var cs = ap;
    var scroll = Math.floor(t * 7);
    var coreX = cx - R * 0.16 * sx, coreY = cy - R * 0.2 * sy, coreR = R * 0.62;
    var nPal = PALETTE.length;

    var j0 = Math.max(0, Math.floor(cy - R * sy * 1.6)), j1 = Math.min(rows - 1, Math.ceil(cy + R * sy * 1.6));
    var i0 = Math.max(0, Math.floor(cx - R * sx * 1.6)), i1 = Math.min(cols - 1, Math.ceil(cx + R * sx * 1.6));

    for (var j = j0; j <= j1; j++) {
      var y = j + 0.5;
      for (var i = i0; i <= i1; i++) {
        var x = i + 0.5;
        var dx = (x - cx) / sx, dy = (y - cy) / sy;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d > R * 1.6 || y > g.ground) continue;
        var th = Math.atan2(dy, dx);
        var r = R * Math.max(0.55, Math.min(1.5, 1 + displacement(th, t)));
        var s = d / r;
        if (s > 1.06) continue;

        var edge = Math.min(1, (1.06 - s) / 0.18);
        var cdx = (x - coreX) / coreR, cdy = (y - coreY) / coreR;
        var core = Math.exp(-(cdx * cdx + cdy * cdy));
        var band = 0.5 + 0.5 * Math.sin(s * 15 - t * 2.1 + th * 1.5);
        var b = edge * (0.42 + 0.33 * band + 0.35 * core);
        if (b > 1) b = 1;

        // Caractères blancs au centre, glacier vers le bord, quelques braises semées.
        var ci = s < 0.5 ? (core > 0.8 ? 3 : 4) : Math.min(nPal - 1, 4 + Math.floor(((s - 0.5) / 0.5) * 4));
        if ((i * 31 + j * 17 + (scroll >> 2)) % 13 === 0) ci = 1;
        // Les blocs derrière : une lueur de braise au cœur, du glacier ailleurs.
        var bci, ba;
        if (core > 0.3) { bci = core > 0.75 ? 0 : (core > 0.5 ? 1 : 2); ba = 0.1 + core * 0.34; }
        else { bci = Math.max(5, ci); ba = 0.04 + 0.1 * b; }
        ba *= edge;

        var id = j * cols + i;
        var gi, alpha = b;
        if (heat[id] > 0.04 && Math.random() < heat[id]) {
          gi = noiseIdx[(Math.random() * noiseIdx.length) | 0];
          ci = 4;
          alpha = Math.max(b, 0.75);
        } else if (core > 0.72 && b > 0.8) {
          gi = denseIdx[(i * 7 + j * 13 + (scroll >> 1)) % denseIdx.length];
        } else {
          gi = codeIdx[(i + j * cols + scroll) % codeIdx.length];
          if (gi === -1) { gi = DOT; alpha *= 0.45; }
        }

        var px = i * cs, py = j * cs;
        ctx.globalAlpha = ba;
        ctx.drawImage(atlas, BLOCK * ap, bci * ap, ap, ap, px, py, cs, cs);
        ctx.globalAlpha = alpha;
        ctx.drawImage(atlas, gi * ap, ci * ap, ap, ap, px, py, cs, cs);
      }
    }

    // L'ombre au sol : plus le blob saute haut, plus elle rétrécit.
    var lift = Math.min(1, hop.h / 0.6);
    var half = R * 1.05 * sx * (1 - lift * 0.45);
    var gy = Math.round(g.ground + 0.6);
    if (gy >= 0 && gy < rows) {
      for (var gx = Math.floor(cx - half); gx <= Math.ceil(cx + half); gx++) {
        if (gx < 0 || gx >= cols) continue;
        var u = Math.abs(gx + 0.5 - cx) / half;
        if (u > 1) continue;
        var si = u < 0.35 ? 1 : (u < 0.7 ? 0 : 2);
        ctx.globalAlpha = (1 - u) * 0.55 * (1 - lift * 0.6);
        ctx.drawImage(atlas, shadowIdx[si] * ap, (nPal - 1) * ap, ap, ap, gx * cs, gy * cs, cs, cs);
      }
    }

    ctx.globalAlpha = 1;

    bctx.clearRect(0, 0, bloom.width, bloom.height);
    bctx.drawImage(main, 0, 0, bloom.width, bloom.height);
  }

  function buildAtlas() {
    ap = Math.max(4, Math.round(cell * dpr));
    var cv = document.createElement("canvas");
    cv.width = ap * (GLYPHS.length + 1);
    cv.height = ap * PALETTE.length;
    var g = cv.getContext("2d");
    g.font = "500 " + Math.round(ap * 0.78) + 'px "JetBrains Mono", ui-monospace, Menlo, Consolas, monospace';
    g.textAlign = "center";
    g.textBaseline = "middle";
    var gap = Math.max(1, Math.round(ap * 0.08));
    PALETTE.forEach(function (col, r) {
      g.fillStyle = col;
      GLYPHS.forEach(function (ch, c) { g.fillText(ch, c * ap + ap / 2, r * ap + ap / 2 + ap * 0.04); });
      g.fillRect(BLOCK * ap + gap / 2, r * ap + gap / 2, ap - gap, ap - gap);
    });
    atlas = cv;
  }

  function resize() {
    var rect = stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    W = rect.width; H = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    var target = Math.max(30, Math.min(52, Math.round(W / 12.5)));
    cell = Math.max(1, Math.round((W / target) * dpr)) / dpr;
    cols = Math.ceil(W / cell);
    rows = Math.ceil(H / cell);
    main.width = Math.round(W * dpr);
    main.height = Math.round(H * dpr);
    bloom.width = Math.ceil(W / 3);
    bloom.height = Math.ceil(H / 3);
    heat = new Float32Array(cols * rows);
    buildAtlas();
    render();
  }

  function frame(now) {
    raf = 0;
    if (!running) return;
    var dt = Math.min(1 / 30, (now - last) / 1000 || 1 / 60);
    last = now;
    step(dt);
    render();
    if (shouldRun()) raf = requestAnimationFrame(frame);
    else running = false;
  }

  function shouldRun() {
    if (!inView || document.hidden) return false;
    if (!reduceMotion.matches) return true;
    return performance.now() < burstUntil;
  }

  function start() {
    if (running || !shouldRun()) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function sayBoing(px, py) {
    if (reduceMotion.matches) return;
    var el = document.createElement("span");
    el.className = "boing";
    el.setAttribute("aria-hidden", "true");
    el.style.left = px + "px";
    el.style.top = py + "px";
    "boyoyoy".split("").forEach(function (c, i) {
      var s = document.createElement("span");
      s.textContent = c;
      s.style.setProperty("--i", i);
      el.appendChild(s);
    });
    stage.appendChild(el);
    setTimeout(function () { el.remove(); }, 1300);
  }

  function poke(cellX, cellY, strength) {
    var g = geometry();
    var th = Math.atan2((cellY - g.cy) / g.sy, (cellX - g.cx) / g.sx);
    for (var m = 0; m < modes.length; m++) {
      var md = modes[m], gain = strength * md.w * 0.05;
      md.va -= gain * Math.cos(md.k * th);
      md.vb -= gain * Math.sin(md.k * th);
    }
    if (hop.h <= 0.05) hop.v = 2.2 * strength;
    else hop.v = Math.min(2.4, hop.v + 0.8 * strength);
    squash.v += 4 * strength;
    sayBoing(cellX * cell, Math.max(16, (g.cy - g.R * g.sy) * cell - 8));
    document.dispatchEvent(new CustomEvent("boyoyoy:rebond"));
    burstUntil = performance.now() + 2600;
    start();
  }

  function toCell(e) {
    var rect = stage.getBoundingClientRect();
    return { x: (e.clientX - rect.left) / cell, y: (e.clientY - rect.top) / cell };
  }

  stage.addEventListener("pointermove", function (e) {
    var p = toCell(e);
    ptr.x = p.x; ptr.y = p.y; ptr.on = true;
  });
  stage.addEventListener("pointerleave", function () { ptr.on = false; });
  stage.addEventListener("pointerdown", function (e) {
    var p = toCell(e);
    poke(p.x, p.y, 1);
  });
  if (pokeBtn) {
    pokeBtn.addEventListener("click", function () {
      var g = geometry();
      poke(g.cx, g.cy - g.R * g.sy, 1);
    });
  }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      if (inView) start(); else stop();
    }).observe(stage);
  }
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop(); else start();
  });
  if (reduceMotion.addEventListener) {
    reduceMotion.addEventListener("change", function () { stop(); start(); render(); });
  }

  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(stage);
  else window.addEventListener("resize", resize);

  // Première image : une pose posée, puis (si le mouvement est permis) le blob tombe et rebondit.
  t = 3.2;
  if (!reduceMotion.matches) hop.h = 0.35;
  resize();
  start();

  if (document.fonts && document.fonts.load) {
    document.fonts.load('500 16px "JetBrains Mono"').then(function () {
      buildAtlas();
      render();
    }).catch(function () {});
  }
})();
