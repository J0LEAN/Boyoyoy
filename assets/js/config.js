/*
 * Boyoyoy : la configuration du site.
 *
 * C'est le seul fichier à modifier pour changer les liens ou ajouter un projet.
 * Pour ajouter un projet : copie le bloc d'AutoTask dans `projets`, change le `slug`
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
      slug: "autotask",
      nom: "AutoTask",
      resume: "Une app mobile reliée à Claude, qui effectue des actions sur Android.",
      description: [
        "AutoTask relie un téléphone Android à Claude. L'idée : demander une tâche, et laisser l'app effectuer les actions sur le téléphone.",
        "Le projet démarre. Le dépôt vient d'être créé, et cette page suivra son avancement."
      ],
      // "en-developpement", "en-ligne", "en-pause" ou "idee"
      statut: "en-developpement",
      plateforme: "Android",
      ia: "Claude",
      debut: "Novembre 2026",
      tags: ["android", "claude", "mobile"],
      depot: { url: "https://github.com/J0LEAN/AutoTask", public: false },
      // Adresse de la démo ou de l'app quand elle existe. Un projet web peut vivre
      // dans ce site, par exemple "projets/autotask/".
      lien: "",
      // Ce qui défile sur l'écran du téléphone dessiné en caractères.
      ecran: [
        { demande: "ouvre l'appareil photo", reponse: "ouvert" },
        { demande: "active le mode avion", reponse: "activé" },
        { demande: "mets un minuteur de 10 min", reponse: "lancé" }
      ]
    }
  ]
};
