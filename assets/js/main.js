/*
 * Boyoyoy : rendu des projets, pages projet (/#slug), petits effets « code ».
 */
(function () {
  "use strict";

  var data = window.BOYOYOY || { site: {}, projets: [] };
  var site = data.site || {};
  var projets = data.projets || [];
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  var STATUTS = {
    "en-developpement": "En développement",
    "en-ligne": "En ligne",
    "en-pause": "En pause",
    "idee": "Idée"
  };

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function pad2(n) { return (n < 10 ? "0" : "") + n; }

  /* ---------- Liens et textes venant de la config ---------- */

  $$('[data-link="github"]').forEach(function (a) { a.href = site.github; });
  $$('[data-link="issues"]').forEach(function (a) { a.href = site.depot + "/issues/new"; });
  $$('[data-link="tipeee"]').forEach(function (a) {
    if (site.tipeee) {
      a.href = site.tipeee;
    } else {
      a.removeAttribute("href");
      a.classList.add("is-pending");
      a.setAttribute("aria-disabled", "true");
      a.innerHTML = "Tipeee arrive bientôt";
    }
  });
  $$("[data-createur]").forEach(function (el) { el.textContent = site.createur || "Jolean"; });
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  var contactGrid = $("[data-contact]");
  if (contactGrid && site.email) {
    var mail = document.createElement("a");
    mail.className = "contact-card";
    mail.href = "mailto:" + site.email;
    mail.innerHTML =
      '<span class="contact-label">E-mail</span>' +
      '<span class="contact-value">' + esc(site.email) + "</span>" +
      "<p>Pour un message plus long, ou une proposition.</p>";
    contactGrid.appendChild(mail);
  }

  /* ---------- Le téléphone dessiné en caractères ---------- */

  var PW = 15; // largeur intérieure de l'écran

  function fit(s, n) {
    s = s.length > n ? s.slice(0, n) : s;
    return s + new Array(n - s.length + 1).join(" ");
  }

  function wrapWords(text, width) {
    var lines = [], cur = "";
    text.split(" ").forEach(function (w) {
      if (!cur) cur = w;
      else if ((cur + " " + w).length <= width) cur += " " + w;
      else { lines.push(cur); cur = w; }
    });
    if (cur) lines.push(cur);
    return lines;
  }

  function phoneHTML(lines, clock) {
    function f(s) { return '<span class="ph-f">' + s + "</span>"; }
    // Uniquement de l'ASCII : chaque caractère a la même largeur dans toutes les polices.
    var rule = new Array(PW + 1).join("-");
    var out = [];
    out.push(f("." + rule + "."));
    out.push(f("|") + " " + esc(clock) + new Array(PW - clock.length - 3).join(" ") + f("4G") + " " + f("|"));
    out.push(f("|" + rule + "|"));
    for (var i = 0; i < 7; i++) {
      var l = lines[i] || { text: "" };
      var txt = esc(fit(l.text, PW - 2));
      out.push(f("|") + " " + (l.cls ? '<span class="' + l.cls + '">' + txt + "</span>" : txt) + " " + f("|"));
    }
    out.push(f("|" + rule + "|"));
    out.push(f("|      ( )      |"));
    out.push(f("'" + rule + "'"));
    return out.join("\n");
  }

  function Phone(pre, steps) {
    this.pre = pre;
    this.steps = steps;
    this.i = 0;
    this.token = null;
  }
  Phone.prototype.clock = function () {
    var d = new Date();
    return pad2(d.getHours()) + ":" + pad2(d.getMinutes());
  };
  Phone.prototype.cmd = function (text, cursor) {
    var lines = wrapWords(text, PW - 4).map(function (w, k) {
      return { text: (k === 0 ? "> " : "  ") + w, cls: "ph-cmd" };
    });
    if (!lines.length) lines.push({ text: "> ", cls: "ph-cmd" });
    if (cursor) lines[lines.length - 1].text += "_";
    return [{ text: "" }].concat(lines);
  };
  Phone.prototype.draw = function (lines) {
    this.pre.innerHTML = phoneHTML(lines, this.clock());
  };
  Phone.prototype.still = function () {
    var st = this.steps[0];
    this.draw(this.cmd(st.demande).concat([
      { text: "" }, { text: "claude ···", cls: "ph-ai" }, { text: "[ok] " + st.reponse, cls: "ph-ok" }
    ]));
  };
  Phone.prototype.start = function () {
    if (this.token || reduceMotion.matches) return;
    var token = { alive: true };
    this.token = token;
    this.loop(token);
  };
  Phone.prototype.stop = function () {
    if (this.token) this.token.alive = false;
    this.token = null;
  };
  Phone.prototype.loop = async function (token) {
    while (token.alive) {
      var st = this.steps[this.i % this.steps.length];
      for (var n = 0; n <= st.demande.length; n++) {
        if (!token.alive) return;
        this.draw(this.cmd(st.demande.slice(0, n), true));
        await sleep(st.demande[n] === " " ? 90 : 55);
      }
      var done = this.cmd(st.demande);
      for (var d = 0; d < 6; d++) {
        if (!token.alive) return;
        this.draw(done.concat([{ text: "" }, { text: "claude " + "···".slice(0, (d % 3) + 1), cls: "ph-ai" }]));
        await sleep(230);
      }
      if (!token.alive) return;
      this.draw(done.concat([
        { text: "" }, { text: "claude ···", cls: "ph-ai" }, { text: "[ok] " + st.reponse, cls: "ph-ok" }
      ]));
      await sleep(2000);
      this.i++;
    }
  };

  var phoneObserver = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var ph = e.target._phone;
      if (!ph) return;
      if (e.isIntersecting && !document.hidden) ph.start(); else ph.stop();
    });
  }) : null;

  function mountPhones(root) {
    $$("[data-phone]", root).forEach(function (pre) {
      var p = projets.find(function (x) { return x.slug === pre.getAttribute("data-phone"); });
      if (!p || !p.ecran || !p.ecran.length) return;
      var ph = new Phone(pre, p.ecran);
      pre._phone = ph;
      ph.still();
      if (phoneObserver) phoneObserver.observe(pre); else ph.start();
    });
  }

  function unmountPhones(root) {
    $$("[data-phone]", root).forEach(function (pre) {
      if (pre._phone) pre._phone.stop();
      if (phoneObserver) phoneObserver.unobserve(pre);
    });
  }

  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) return;
    $$("[data-phone]").forEach(function (pre) { if (pre._phone) pre._phone.stop(); });
  });

  /* ---------- Cartes projets ---------- */

  function chip(statut) {
    return '<span class="chip" data-statut="' + esc(statut) + '"><i aria-hidden="true"></i>' +
      esc(STATUTS[statut] || statut) + "</span>";
  }

  function cardHTML(p) {
    var tags = (p.tags || []).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("");
    return '<a class="card card-projet" href="#' + esc(p.slug) + '">' +
      '<div class="card-body">' +
        '<div class="card-top">' + chip(p.statut) +
          '<span class="card-path">./projets/' + esc(p.slug) + "</span></div>" +
        "<h3>" + esc(p.nom) + "</h3>" +
        "<p>" + esc(p.resume) + "</p>" +
        (tags ? '<ul class="tags" aria-label="Mots-clés">' + tags + "</ul>" : "") +
        '<span class="card-cta">Ouvrir la page <span aria-hidden="true">→</span></span>' +
      "</div>" +
      (p.ecran && p.ecran.length ? '<pre class="phone" data-phone="' + esc(p.slug) + '" aria-hidden="true"></pre>' : "") +
    "</a>";
  }

  var cards = $("[data-cards]");
  if (cards) {
    cards.innerHTML = projets.map(cardHTML).join("") +
      '<div class="card card-slot">' +
        '<pre aria-hidden="true"><span class="c-prompt">$</span> mkdir projets/prochain\n' +
        '<span class="c-prompt">$</span> claude "on construit quoi ?"\n<span class="caret"></span></pre>' +
        "<div><p>Le prochain projet arrivera ici.</p>" +
        "<small>Chaque projet a sa page, sans nom de domaine à acheter.</small></div>" +
      "</div>";
    mountPhones(cards);
  }

  var count = $("[data-count]");
  if (count) {
    var n = projets.length;
    count.textContent = n + " projet" + (n > 1 ? "s" : "") + " pour l'instant, d'autres en compilation.";
  }

  // La texture derrière les cartes : les données du site, en vrai.
  var texture = $("[data-texture]");
  if (texture) {
    var src = JSON.stringify({ site: site.nom, createur: site.createur, projets: projets }) + " ";
    var txt = "";
    while (txt.length < 9000) txt += src;
    texture.textContent = txt;
  }

  /* ---------- Bannière ASCII d'un projet ---------- */

  function drawBanner(pre, text) {
    var width = pre.clientWidth;
    if (!width) return;
    var probe = document.createElement("span");
    probe.textContent = "MMMMMMMMMM";
    probe.style.cssText = "position:absolute;visibility:hidden;white-space:pre";
    pre.appendChild(probe);
    var cw = probe.getBoundingClientRect().width / 10;
    probe.remove();
    var lh = parseFloat(getComputedStyle(pre).lineHeight) || cw * 1.7;
    var colsN = Math.max(24, Math.min(150, Math.floor(width / cw)));

    var c = document.createElement("canvas");
    var g = c.getContext("2d", { willReadFrequently: true });
    var font = '120px "Gloock", Georgia, serif';
    g.font = font;
    var tw = Math.ceil(g.measureText(text).width) + 12;
    var th = 150;
    c.width = tw; c.height = th;
    g.font = font;
    g.fillStyle = "#fff";
    g.textBaseline = "alphabetic";
    g.fillText(text, 6, 116);

    var cellW = tw / colsN, cellH = cellW * (lh / cw);
    var rowsN = Math.floor(th / cellH);
    var img = g.getImageData(0, 0, tw, th).data;
    var ramp = " .:-=+*#%@";
    var lines = [];
    for (var r = 0; r < rowsN; r++) {
      var line = "";
      for (var col = 0; col < colsN; col++) {
        var sum = 0, k = 0;
        for (var sy = 0.2; sy < 1; sy += 0.3) {
          for (var sx = 0.2; sx < 1; sx += 0.3) {
            var px = Math.min(tw - 1, Math.floor((col + sx) * cellW));
            var py = Math.min(th - 1, Math.floor((r + sy) * cellH));
            sum += img[(py * tw + px) * 4 + 3];
            k++;
          }
        }
        var v = sum / k / 255;
        line += ramp[Math.min(ramp.length - 1, Math.floor(v * ramp.length))];
      }
      lines.push(line.replace(/\s+$/, ""));
    }
    while (lines.length && !lines[0].trim()) lines.shift();
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
    pre.textContent = lines.join("\n");
  }

  var bannerObserver = "ResizeObserver" in window ? new ResizeObserver(function (entries) {
    entries.forEach(function (e) {
      var pre = e.target;
      clearTimeout(pre._t);
      pre._t = setTimeout(function () { drawBanner(pre, pre.getAttribute("data-banner")); }, 80);
    });
  }) : null;

  function mountBanner(pre) {
    var text = pre.getAttribute("data-banner");
    drawBanner(pre, text);
    if (bannerObserver) bannerObserver.observe(pre);
    if (document.fonts && document.fonts.load) {
      document.fonts.load('120px "Gloock"').then(function () { drawBanner(pre, text); }).catch(function () {});
    }
  }

  /* ---------- Page projet ---------- */

  var home = $("#accueil");
  var view = $("#projet");
  var viewInner = $("[data-projet]");

  function projetHTML(p) {
    var idx = projets.indexOf(p);
    var next = projets.length > 1 ? projets[(idx + 1) % projets.length] : null;
    var desc = (p.description || []).map(function (d) { return "<p>" + esc(d) + "</p>"; }).join("");
    var code;
    if (p.depot && p.depot.url && p.depot.public) {
      code = '<a href="' + esc(p.depot.url) + '">' + esc(p.depot.url.replace("https://", "")) + "</a>";
    } else {
      code = "Dépôt privé";
    }
    var actions = "";
    if (p.lien) actions += '<a class="btn btn-primary" href="' + esc(p.lien) + '">Ouvrir ' + esc(p.nom) +
      ' <span class="arrow" aria-hidden="true">→</span></a>';
    if (p.depot && p.depot.url && p.depot.public) {
      actions += '<a class="btn btn-ghost" href="' + esc(p.depot.url) + '">Voir le code</a>';
    } else {
      actions += '<span class="note-private"><span aria-hidden="true">[privé]</span> Le code n\'est pas encore public.</span>';
    }
    actions += '<a class="btn btn-ghost" href="' + esc(site.github) + '">Suivre sur GitHub</a>';

    return '<article class="projet">' +
      '<a class="back" href="#projets" data-scramble>← cd ../projets</a>' +
      '<pre class="banner" data-banner="' + esc(p.nom) + '" aria-hidden="true"></pre>' +
      '<div class="projet-grid">' +
        '<div class="projet-main">' +
          chip(p.statut) +
          '<h1 class="projet-title" tabindex="-1">' + esc(p.nom) + "</h1>" +
          '<p class="projet-lede">' + esc(p.resume) + "</p>" +
          '<div class="projet-text">' + desc + "</div>" +
          '<div class="actions">' + actions + "</div>" +
        "</div>" +
        '<aside class="projet-side" aria-label="Fiche du projet">' +
          '<dl class="facts">' +
            "<dt>Statut</dt><dd>" + esc(STATUTS[p.statut] || p.statut) + "</dd>" +
            (p.plateforme ? "<dt>Plateforme</dt><dd>" + esc(p.plateforme) + "</dd>" : "") +
            (p.ia ? "<dt>IA</dt><dd>" + esc(p.ia) + "</dd>" : "") +
            (p.debut ? "<dt>Démarré</dt><dd>" + esc(p.debut) + "</dd>" : "") +
            "<dt>Code</dt><dd>" + code + "</dd>" +
            "<dt>Adresse</dt><dd><code>/#" + esc(p.slug) + "</code></dd>" +
          "</dl>" +
          (p.ecran && p.ecran.length
            ? '<figure class="phone-box"><pre class="phone" data-phone="' + esc(p.slug) + '" aria-hidden="true"></pre>' +
              "<figcaption>Aperçu illustratif de l'idée</figcaption></figure>"
            : "") +
        "</aside>" +
      "</div>" +
      (next ? '<a class="next" href="#' + esc(next.slug) + '">Projet suivant : ' + esc(next.nom) + ' <span aria-hidden="true">→</span></a>' : "") +
    "</article>";
  }

  function showHome(id) {
    var fromProjet = !view.hidden;
    if (fromProjet) unmountPhones(view);
    view.hidden = true;
    home.hidden = false;
    document.title = site.nom || "Boyoyoy";
    var target = id ? document.getElementById(id) : null;
    if (target) {
      requestAnimationFrame(function () {
        target.scrollIntoView({ behavior: fromProjet || reduceMotion.matches ? "auto" : "smooth" });
      });
    } else if (fromProjet) {
      window.scrollTo(0, 0);
    }
  }

  function showProjet(p) {
    unmountPhones(view);
    viewInner.innerHTML = projetHTML(p);
    home.hidden = true;
    view.hidden = false;
    document.title = p.nom + " · " + (site.nom || "Boyoyoy");
    window.scrollTo(0, 0);
    mountBanner($(".banner", viewInner));
    mountPhones(viewInner);
    bindScramble(viewInner);
    externalLinks(viewInner);
    var h = $(".projet-title", viewInner);
    if (h) h.focus({ preventScroll: true });
  }

  function route() {
    var id = decodeURIComponent(location.hash.replace(/^#/, ""));
    var p = projets.find(function (x) { return x.slug === id; });
    if (p) showProjet(p); else showHome(id);
  }

  /* ---------- Effet « décodage » au survol ---------- */

  var GL = "<>/\\{}[]=+*^?#_~";
  function scramble(el) {
    if (reduceMotion.matches) return;
    var target = el.getAttribute("data-text");
    if (!target) { target = el.textContent; el.setAttribute("data-text", target); }
    var t0 = performance.now(), dur = 380;
    cancelAnimationFrame(el._scr);
    function tick(now) {
      var p = Math.min(1, (now - t0) / dur);
      var n = Math.floor(p * target.length);
      var s = target.slice(0, n);
      for (var i = n; i < target.length; i++) {
        s += /\s/.test(target[i]) ? target[i] : GL[(Math.random() * GL.length) | 0];
      }
      el.textContent = s;
      if (p < 1) el._scr = requestAnimationFrame(tick);
      else el.textContent = target;
    }
    el._scr = requestAnimationFrame(tick);
  }

  function bindScramble(root) {
    $$("[data-scramble]", root).forEach(function (el) {
      if (el._scrBound) return;
      el._scrBound = true;
      el.addEventListener("mouseenter", function () { scramble(el); });
      el.addEventListener("focus", function () { scramble(el); });
    });
  }

  /* ---------- Le nom qui rebondit avec le blob ---------- */

  var wordmark = $(".wordmark");
  document.addEventListener("boyoyoy:rebond", function () {
    if (!wordmark || reduceMotion.matches) return;
    wordmark.classList.remove("is-boing");
    void wordmark.offsetWidth;
    wordmark.classList.add("is-boing");
  });
  if (wordmark) {
    wordmark.addEventListener("animationend", function (e) {
      if (e.target === wordmark.lastElementChild) wordmark.classList.remove("is-boing");
    });
  }

  /* ---------- Liens externes : nouvel onglet ---------- */

  function externalLinks(root) {
    $$('a[href^="http"]', root).forEach(function (a) {
      a.target = "_blank";
      a.rel = "noopener";
    });
  }

  bindScramble(document);
  externalLinks(document);
  window.addEventListener("hashchange", route);
  route();
})();
