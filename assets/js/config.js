/*
 * Boyoyoy : la configuration du site.
 *
 * C'est le seul fichier à modifier pour changer les liens ou ajouter un projet.
 * Pour ajouter un projet : copie le bloc de Pépouze dans `projets`, change le `slug`
 * (il devient l'adresse de la page : /#mon-projet) et remplis les champs.
 */
window.BOYOYOY = {
  site: {
    nom: "Boyoyoy",
    createur: "Jolean",
    github: "https://github.com/J0LEAN",
    depot: "https://github.com/J0LEAN/Boyoyoy",

    // Adresse de ta page Tipeee, par exemple "https://fr.tipeee.com/ton-pseudo".
    // Tant qu'elle est vide, le bouton affiche « Tipeee arrive bientôt ».
    tipeee: "",

    // Optionnel : une adresse e-mail ajoute une carte dans la section Contact.
    email: ""
  },

  projets: [
    {
      slug: "pepouze",
      nom: "Pépouze",
      resume: "Des macros et des routines pour Android, écrites en une phrase\u00a0: «\u00a0Quand… Faire…\u00a0».",
      description: [
        "Pépouze automatise un téléphone Android avec des règles simples. Quand le Bluetooth de la voiture se connecte, monter le volume et reprendre la musique. À 23\u00a0h, activer Ne pas déranger et baisser la luminosité.",
        "On peut aussi le dire en une phrase\u00a0: Pépouze prépare la macro sur le téléphone, et peut passer la main à Claude pour les demandes plus complexes. Rien ne s'active avant d'avoir relu la macro.",
        "11 déclencheurs, 29 actions, 58 exemples prêts à l'emploi, en 13 langues. Gratuite pendant le lancement."
      ],
      // "en-developpement", "bientot", "en-ligne", "en-pause" ou "idee"
      statut: "bientot",
      plateforme: "Android 8 ou plus",
      ia: "Sur le téléphone, Claude en renfort",
      tags: ["android", "automatisation", "claude"],
      // Le site du projet, s'il en a un. Un projet web peut aussi vivre dans
      // ce dépôt, par exemple "projets/mon-projet/".
      lien: "https://pepouzeapp.com",
      lienTexte: "Voir le site de Pépouze",
      // Facultatif : { url: "https://github.com/J0LEAN/...", public: true }
      depot: null,
      // Couleurs du site Pépouze (son thème sombre, bleu).
      theme: {
        "--ink": "#090c12",
        "--ink-raise": "#10141c",
        "--fg": "#eef2f8",
        "--fg-dim": "#8792a6",
        "--fg-faint": "#5a6578",
        "--line": "rgba(111, 168, 255, 0.16)",
        "--line-strong": "rgba(111, 168, 255, 0.34)",
        "--dot": "rgba(111, 168, 255, 0.09)",
        "--glacier": "#6fa8ff",
        "--glacier-glow": "rgba(141, 180, 250, 0.3)",
        "--ember": "#0866ff",
        "--ember-glow": "rgba(8, 102, 255, 0.45)",
        "--ember-ink": "#ffffff",
        "--glass-hi": "rgba(220, 232, 255, 0.075)",
        "--glass-lo": "rgba(220, 232, 255, 0.018)"
      },
      // Le petit téléphone : une phrase tapée, et la macro « Quand… Faire… » que Pépouze en tire.
      ecranAgent: "pépouze",
      ecranLegende: "Une phrase devient une macro « Quand… Faire… »",
      ecran: [
        { demande: "en voiture, monte le volume", quand: "bluetooth auto", faire: "volume +" },
        { demande: "à 23\u00a0h, active Ne pas déranger", quand: "23:00", faire: "ne pas déranger" },
        { demande: "écouteurs branchés\u00a0: musique à 60\u00a0%", quand: "écouteurs", faire: "média 60 %" }
      ],
    },
    {
      slug: "le-vestiaire",
      nom: "Le Vestiaire",
      resume: "Un magazine en ligne de tenues complètes, prêtes à copier, avec un lien pour acheter chaque pièce.",
      description: [
        "Chaque tenue réunit plusieurs articles (haut, bas, chaussures, accessoires), avec un lien pour acheter chacun d'eux, un conseil «\u00a0pourquoi ça marche\u00a0» et un visuel créé automatiquement à partir des photos des produits.",
        "On filtre par occasion, style, saison et budget, on met des tenues de côté dans «\u00a0Mon portant\u00a0», et on coche «\u00a0Je l'ai déjà\u00a0?\u00a0» pour les pièces qu'on possède. Le tout dans un design «\u00a0verre liquide, rose & cerise\u00a0», avec les tenues suspendues sur des cintres."
      ],
      statut: "en-developpement",
      plateforme: "Web",
      ia: "Construit avec Claude",
      tags: ["mode", "web", "nextjs"],
      lien: "",
      depot: { url: "https://github.com/J0LEAN/Le-vestiaire-", public: false },
      // Dessin en caractères sur la carte et la page ("cintre", ou un nom ajouté dans DESSINS, main.js).
      dessin: "cintre",
      dessinLegende: "Un cintre, pour des tenues prêtes à copier",
      // Couleurs propres au projet (reprises du site Le Vestiaire : rose & cerise).
      // Chaque clé remplace un jeton de couleur de Boyoyoy sur sa carte et sa page.
      theme: {
        "--ink": "#0e0610",
        "--ink-raise": "#1a0d17",
        "--fg": "#fff5fa",
        "--fg-dim": "#c9a9bd",
        "--fg-faint": "#7d5f73",
        "--line": "rgba(255, 155, 196, 0.16)",
        "--line-strong": "rgba(255, 155, 196, 0.34)",
        "--dot": "rgba(255, 155, 196, 0.09)",
        "--glacier": "#ff9bc4",
        "--glacier-glow": "rgba(185, 160, 255, 0.35)",
        "--ember": "#f06aa0",
        "--ember-glow": "rgba(209, 31, 90, 0.45)",
        "--ember-ink": "#26121f",
        "--glass-hi": "rgba(255, 210, 230, 0.08)",
        "--glass-lo": "rgba(255, 210, 230, 0.02)"
      }
    },
    {
      slug: "pimpr",
      nom: "Pimpr",
      resume: "Une app Android pour habiller son téléphone : thèmes, packs d'icônes et widgets réglables.",
      description: [
        "25 thèmes en six catégories (Pastel, Cosmos, Nature, Minimal, Néon et rétro, Kawaii). Chaque thème réunit un fond d'accueil, un fond de verrouillage, un pack d'icônes et trois widgets assortis.",
        "11 packs d'icônes à poser sur l'écran d'accueil, et un atelier de widgets (horloge, météo, photo, vidéo, calendrier) : formats, formes, fonds, polices et couleurs se règlent librement, avec un aperçu fidèle de l'écran."
      ],
      statut: "en-developpement",
      plateforme: "Android 8 ou plus",
      ia: "Construit avec Claude",
      tags: ["android", "personnalisation", "kotlin"],
      lien: "",
      depot: { url: "https://github.com/J0LEAN/Pimpr", public: true },
      dessin: "accueil",
      dessinLegende: "Un écran d'accueil habillé : widget et icônes",
      // Couleurs de l'app Pimpr (indigo et rose), sur fond sombre.
      theme: {
        "--ink": "#0b0a1a",
        "--ink-raise": "#15132e",
        "--fg": "#f1efff",
        "--fg-dim": "#a8a3d0",
        "--fg-faint": "#6c6898",
        "--line": "rgba(176, 171, 255, 0.16)",
        "--line-strong": "rgba(176, 171, 255, 0.34)",
        "--dot": "rgba(176, 171, 255, 0.09)",
        "--glacier": "#b0abff",
        "--glacier-glow": "rgba(91, 84, 232, 0.4)",
        "--ember": "#ff9ccb",
        "--ember-glow": "rgba(224, 103, 156, 0.4)",
        "--ember-ink": "#1a1750",
        "--glass-hi": "rgba(228, 225, 255, 0.075)",
        "--glass-lo": "rgba(228, 225, 255, 0.018)"
      }
    }
  ]
};
