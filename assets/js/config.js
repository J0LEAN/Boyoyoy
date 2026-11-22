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
      // Ce qui défile sur l'écran du téléphone dessiné en caractères.
      ecranAgent: "pépouze",
      ecranLegende: "Exemple : une phrase devient une macro",
      ecran: [
        { demande: "en voiture, monte le volume", reponse: "macro prête" },
        { demande: "à 23\u00a0h, active Ne pas déranger", reponse: "macro prête" },
        { demande: "écouteurs branchés\u00a0: musique à 60\u00a0%", reponse: "macro prête" }
      ]
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
      depot: { url: "https://github.com/J0LEAN/Le-vestiaire-", public: false }
    }
  ]
};
