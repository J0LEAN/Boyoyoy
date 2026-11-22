# Boyoyoy

Le site qui rassemble les projets de **Jolean**.
Chaque projet a sa propre page (`/#nom-du-projet`), donc pas besoin d'acheter un nom de domaine par projet.

Adresse une fois GitHub Pages activé : **https://j0lean.github.io/Boyoyoy/**

## Ce qu'il y a dedans

- **Accueil** : le nom, et un blob fait de caractères de code qui ondule, esquive le curseur et rebondit quand on clique dessus.
- **Projets** : une carte par projet, et une page détaillée pour chacun (statut, plateforme, lien vers le code ou la démo).
- **Soutenir** : le bouton de dons Ko-fi.
- **Contact** : le profil GitHub et un lien pour ouvrir une issue sur ce dépôt.

Le site est 100 % statique (HTML, CSS, JavaScript), sans étape de build.

```
index.html              la page
assets/css/style.css    le style
assets/js/config.js     ← liens et projets : le seul fichier à modifier au quotidien
assets/js/blob.js       le blob animé de l'accueil
assets/js/main.js       cartes, pages projet, petits effets
assets/favicon.svg      l'icône de l'onglet
```

## Ajouter un projet

Ouvre `assets/js/config.js`, copie le bloc de Pépouze dans `projets` et modifie-le :

| Champ | Rôle |
| --- | --- |
| `slug` | l'adresse de la page : `pepouze` donne `/#pepouze` |
| `nom`, `resume`, `description` | le texte affiché |
| `statut` | `en-developpement`, `bientot`, `en-ligne`, `en-pause` ou `idee` |
| `depot` | l'adresse du dépôt, et `public: true` quand le code est visible par tous |
| `lien`, `lienTexte` | le site, la démo ou l'app en ligne, et le texte du bouton ; un projet web peut vivre dans ce dépôt, par exemple `projets/mon-projet/` |
| `ecran`, `ecranAgent` | facultatif : les phrases qui défilent sur le petit téléphone en caractères, et qui y répond |

## Régler Ko-fi et l'e-mail

Dans `assets/js/config.js`, `site.kofi` contient l'adresse de ta page Ko-fi (https://ko-fi.com/j0lean).
Si tu le vides, le bouton affiche « Les dons arrivent bientôt ».
Le champ `site.email` est facultatif : rempli, il ajoute une carte e-mail dans Contact.

## Mettre le site en ligne (gratuit)

1. Fusionne cette branche dans `main`.
2. Sur GitHub : **Settings → Pages → Build and deployment → Source : Deploy from a branch**, puis `main` et `/ (root)`.
3. Après une minute, le site est sur https://j0lean.github.io/Boyoyoy/.

## Voir le site en local

```bash
python3 -m http.server 8000
```

Puis ouvre http://localhost:8000.
