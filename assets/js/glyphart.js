/*
 * Dessins des projets, rendus comme le blob de l'accueil : une forme vectorielle
 * est échantillonnée sur une grille, et chaque cellule couverte reçoit un bloc
 * coloré et un caractère. Les couleurs viennent des jetons CSS du projet
 * (--fg, --glacier, --ember), donc chaque dessin prend la teinte de son projet.
 *
 * Utilisation : <canvas class="glyph-art" data-glyph="cintre"></canvas>, puis
 * GlyphArt.mount(racine). Pour un nouveau dessin, ajoute une entrée dans FORMES.
 */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var NOISE = "<>/\\{}[]=+*^?!;:_~|";
  var EDGE = ".:+*";

  // Chaque forme dessine dans un carré de 100 × 100.
  // couche "a" : la structure (blanc vers glacier), couche "b" : l'accent (braise),
  // couche "c" : les reflets et petits détails (blanc). Une forme ignore les couches inutiles.
  var FORMES = {
    cintre: {
      texte: "robe veste jean jupe basket sac foulard manteau chemise tenue ",
      draw: function (g, t, couche) {
        g.translate(50, 10);
        g.rotate(Math.sin(t * 1.3) * 0.09);
        g.translate(-50, -10);
        g.lineCap = "round";
        g.lineJoin = "round";
        if (couche === "a") {
          g.lineWidth = 7;
          g.beginPath();
          g.arc(50, 15, 7, Math.PI * 0.95, Math.PI * 2.2);
          g.stroke();
          g.beginPath();
          g.moveTo(50, 22);
          g.lineTo(50, 33);
          g.stroke();
          g.lineWidth = 9.5;
          g.beginPath();
          g.moveTo(50, 33);
          g.lineTo(10, 64);
          g.quadraticCurveTo(6, 72, 16, 72);
          g.lineTo(84, 72);
          g.quadraticCurveTo(94, 72, 90, 64);
          g.closePath();
          g.stroke();
        } else if (couche === "b") {
          g.beginPath();
          g.arc(50, 34, 7, 0, Math.PI * 2);
          g.fill();
          // Une étiquette qui pend.
          g.lineWidth = 2;
          g.beginPath();
          g.moveTo(70, 72);
          g.lineTo(72, 82);
          g.stroke();
          g.fillRect(66, 82, 12, 9);
        }
      }
    },

    pinceau: {
      cells: 32,
      texte: "theme icones widget pastel cosmos nature neon kawaii horloge meteo ",
      draw: function (g, t, couche) {
        // La palette, en bas à gauche : rebord, trou pour le pouce, taches et reflets.
        var taches = [[16, 76, 5.5], [27, 70, 6], [40, 68, 5.5], [50, 75, 5]];
        g.save();
        g.translate(34, 80);
        g.rotate(-0.1);
        g.translate(-34, -80);
        if (couche === "a") {
          g.globalAlpha = 0.45;
          g.beginPath();
          g.ellipse(34, 80, 28, 15, 0, 0, Math.PI * 2);
          g.fill();
          g.globalAlpha = 1;
          g.lineWidth = 3.5;
          g.beginPath();
          g.ellipse(34, 80, 28, 15, 0, 0, Math.PI * 2);
          g.stroke();
          g.globalCompositeOperation = "destination-out";
          g.beginPath();
          g.arc(22, 87, 4.5, 0, Math.PI * 2);
          g.fill();
          taches.forEach(function (c) { g.beginPath(); g.arc(c[0], c[1], c[2], 0, Math.PI * 2); g.fill(); });
          g.globalCompositeOperation = "source-over";
        } else if (couche === "b") {
          taches.forEach(function (c, i) {
            var r = c[2] * (1 + 0.06 * Math.sin(t * 2 + i));
            g.beginPath(); g.arc(c[0], c[1], r, 0, Math.PI * 2); g.fill();
          });
        } else {
          taches.forEach(function (c) { g.beginPath(); g.arc(c[0] - 2, c[1] - 2.5, 1.8, 0, Math.PI * 2); g.fill(); });
        }
        g.restore();

        // Le pinceau, en haut à droite, bien séparé : il s'approche, puis remonte.
        var cycle = (t * 0.45) % 1;
        var approche = Math.sin(cycle * Math.PI) * 6;
        g.save();
        g.translate(78, 46 + approche);
        g.rotate(0.32 + Math.sin(t * 1.1) * 0.04);
        g.lineCap = "round";
        if (couche === "a") {
          g.lineWidth = 8;
          g.beginPath(); g.moveTo(0, -25); g.lineTo(0, -40); g.stroke();
          g.beginPath(); g.arc(0, -42, 4, 0, Math.PI * 2); g.fill();
          g.lineWidth = 11;
          g.beginPath(); g.moveTo(0, -14); g.lineTo(0, -25); g.stroke();
        } else if (couche === "b") {
          g.beginPath();
          g.moveTo(-6, -13);
          g.quadraticCurveTo(-8, -1, 0, 5);
          g.quadraticCurveTo(8, -1, 6, -13);
          g.closePath();
          g.fill();
        } else {
          // Deux bagues sur la virole, et un reflet sur le manche.
          g.lineWidth = 1.6;
          g.beginPath(); g.moveTo(-6, -17); g.lineTo(6, -17); g.stroke();
          g.beginPath(); g.moveTo(-6, -22); g.lineTo(6, -22); g.stroke();
          g.beginPath(); g.moveTo(-2, -29); g.lineTo(-2, -38); g.stroke();
        }
        g.restore();

        // Une goutte tombe du pinceau vers la palette.
        if (couche === "b" && cycle > 0.5) {
          var k = (cycle - 0.5) / 0.5;
          g.beginPath();
          g.arc(78, 52 + k * 18, 2.4 * (1 - k * 0.4), 0, Math.PI * 2);
          g.fill();
        }
      }
    },

    pousse: {
      texte: "mkdir prochain projet idee claude construire partager ",
      draw: function (g, t, couche) {
        if (couche === "a") {
          g.fillRect(26, 64, 48, 8);
          g.beginPath();
          g.moveTo(31, 72);
          g.lineTo(69, 72);
          g.lineTo(63, 94);
          g.lineTo(37, 94);
          g.closePath();
          g.fill();
          return;
        }
        if (couche !== "b") return;
        var grandit = 0.88 + 0.12 * Math.sin(t * 0.9);
        g.translate(50, 64);
        g.rotate(Math.sin(t * 1.1) * 0.07);
        g.scale(grandit, grandit);
        g.translate(-50, -64);
        g.lineCap = "round";
        g.lineWidth = 6;
        g.beginPath();
        g.moveTo(50, 64);
        g.quadraticCurveTo(45, 44, 50, 26);
        g.stroke();
        g.beginPath();
        g.ellipse(38, 42, 12, 5.5, -0.5, 0, Math.PI * 2);
        g.fill();
        g.beginPath();
        g.ellipse(62, 34, 13, 5.5, 0.5, 0, Math.PI * 2);
        g.fill();
        g.beginPath();
        g.arc(50, 24, 4.5, 0, Math.PI * 2);
        g.fill();
      }
    }
  };

  var CELLS = 26;          // cellules par côté
  var SS = 4;              // échantillons par cellule et par axe
  var arts = [];
  var raf = 0, last = 0;

  function Art(canvas) {
    this.c = canvas;
    this.ctx = canvas.getContext("2d");
    this.forme = FORMES[canvas.getAttribute("data-glyph")];
    this.n = (this.forme && this.forme.cells) || CELLS;
    this.mask = document.createElement("canvas");
    this.mask.width = this.mask.height = this.n * SS;
    this.mctx = this.mask.getContext("2d", { willReadFrequently: true });
    this.heat = new Float32Array(this.n * this.n);
    this.ptr = null;
    this.visible = true;
    this.t = Math.random() * 10;
    this.colors();
    this.size();
    var self = this;
    canvas.addEventListener("pointermove", function (e) {
      var r = canvas.getBoundingClientRect();
      self.ptr = { x: (e.clientX - r.left) / r.width * self.n, y: (e.clientY - r.top) / r.height * self.n };
    });
    canvas.addEventListener("pointerleave", function () { self.ptr = null; });
  }

  Art.prototype.colors = function () {
    var cs = getComputedStyle(this.c);
    function v(n, d) { return (cs.getPropertyValue(n) || "").trim() || d; }
    this.fg = v("--fg", "#e7eef2");
    this.glacier = v("--glacier", "#86d4e8");
    this.ember = v("--ember", "#ff8a3d");
  };

  Art.prototype.size = function () {
    var w = this.c.clientWidth || 200;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.c.width = Math.round(w * dpr);
    this.c.height = Math.round(w * dpr);
    this.cell = this.c.width / this.n;
  };

  // Couverture de chaque couche, cellule par cellule.
  Art.prototype.sample = function (couche) {
    var m = this.mctx, n = this.n * SS;
    m.setTransform(1, 0, 0, 1, 0, 0);
    m.clearRect(0, 0, n, n);
    m.setTransform(n / 100, 0, 0, n / 100, 0, 0);
    m.fillStyle = m.strokeStyle = "#fff";
    m.save();
    this.forme.draw(m, this.t, couche);
    m.restore();
    var d = m.getImageData(0, 0, n, n).data;
    var out = new Float32Array(this.n * this.n);
    for (var y = 0; y < n; y++) {
      for (var x = 0; x < n; x++) {
        out[((y / SS) | 0) * this.n + ((x / SS) | 0)] += d[(y * n + x) * 4 + 3];
      }
    }
    var k = 255 * SS * SS;
    for (var i = 0; i < out.length; i++) out[i] /= k;
    return out;
  };

  Art.prototype.render = function () {
    if (!this.forme) return;
    var A = this.sample("a"), B = this.sample("b"), C = this.sample("c");
    var g = this.ctx, cs = this.cell, txt = this.forme.texte;
    var scroll = Math.floor(this.t * 5);
    g.clearRect(0, 0, this.c.width, this.c.height);
    g.font = "500 " + Math.round(cs * 0.82) + 'px "JetBrains Mono", ui-monospace, monospace';
    g.textAlign = "center";
    g.textBaseline = "middle";
    var gap = Math.max(1, cs * 0.08);
    for (var j = 0; j < this.n; j++) {
      for (var i = 0; i < this.n; i++) {
        var id = j * this.n + i, a = A[id], b = B[id], c = C[id], cov = Math.min(1, a + b + c);
        if (cov < 0.08) continue;
        var col = c > 0.25 ? this.fg : (b > a ? this.ember : (j < this.n * 0.45 ? this.fg : this.glacier));
        g.fillStyle = col;
        g.globalAlpha = 0.1 + 0.28 * cov;
        g.fillRect(i * cs + gap / 2, j * cs + gap / 2, cs - gap, cs - gap);
        var ch;
        if (this.heat[id] > 0.05 && Math.random() < this.heat[id]) ch = NOISE[(Math.random() * NOISE.length) | 0];
        else if (cov > 0.55) {
          ch = txt[(i + j * this.n + scroll) % txt.length];
          if (ch === " ") ch = "·";
        } else ch = EDGE[Math.min(EDGE.length - 1, (cov * EDGE.length * 1.6) | 0)];
        g.globalAlpha = 0.45 + 0.55 * cov;
        g.fillText(ch, i * cs + cs / 2, j * cs + cs / 2 + cs * 0.04);
      }
    }
    g.globalAlpha = 1;
  };

  Art.prototype.step = function (dt) {
    this.t += dt;
    var h = this.heat;
    for (var q = 0; q < h.length; q++) if (h[q] > 0) h[q] = Math.max(0, h[q] - dt * 2.2);
    if (this.ptr) {
      for (var y = 0; y < this.n; y++) {
        for (var x = 0; x < this.n; x++) {
          var d = Math.hypot(x + 0.5 - this.ptr.x, y + 0.5 - this.ptr.y);
          if (d < 3) h[y * this.n + x] = Math.max(h[y * this.n + x], 1 - d / 3);
        }
      }
    }
  };

  function frame(now) {
    raf = 0;
    var dt = Math.min(0.1, (now - last) / 1000 || 0.033);
    if (dt < 1 / 32) { raf = requestAnimationFrame(frame); return; } // ~30 images/s
    last = now;
    var any = false;
    arts = arts.filter(function (a) { return a.c.isConnected; });
    arts.forEach(function (a) {
      if (!a.visible) return;
      any = true;
      a.step(dt);
      a.render();
    });
    if (any && !document.hidden && !reduceMotion.matches) raf = requestAnimationFrame(frame);
  }

  function kick() {
    if (!raf && !reduceMotion.matches) { last = performance.now(); raf = requestAnimationFrame(frame); }
  }

  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var a = e.target._art;
      if (a) a.visible = e.isIntersecting;
    });
    kick();
  }) : null;

  var ro = "ResizeObserver" in window ? new ResizeObserver(function (entries) {
    entries.forEach(function (e) { var a = e.target._art; if (a) { a.size(); a.render(); } });
  }) : null;

  function mount(root) {
    (root || document).querySelectorAll("canvas[data-glyph]").forEach(function (c) {
      if (c._art || !FORMES[c.getAttribute("data-glyph")]) return;
      var a = new Art(c);
      c._art = a;
      arts.push(a);
      a.render();
      if (io) io.observe(c);
      if (ro) ro.observe(c);
    });
    kick();
  }

  document.addEventListener("visibilitychange", function () { if (!document.hidden) kick(); });
  if (document.fonts && document.fonts.load) {
    document.fonts.load('500 12px "JetBrains Mono"').then(function () {
      arts.forEach(function (a) { a.render(); });
    }).catch(function () {});
  }

  window.GlyphArt = { mount: mount, formes: FORMES };
})();
