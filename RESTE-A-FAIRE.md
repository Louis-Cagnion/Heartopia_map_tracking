# Reste à faire — chantier UI/UX (branche `ui-ux-refresh`)

## Fait
- Recherche de la palette officielle Heartopia (captures Google Play, palette communautaire lospec) : bleu ciel/turquoise dominant, corail, or chaud, vert nature.
- Nouvelle palette appliquée dans `css/main.css` (`:root` + `body.light-mode`) : bleu comme couleur dominante (`--color-accent`, `--bg-tab-active`), rouge vif comme couleur de contraste secondaire (`--color-danger`, `--color-profit-neg`), or réservé aux pièces/monnaie (`--color-gold`).
- Couleurs des marqueurs de carte alignées dans `css/map.css` (poisson/oiseau/insecte).
- Vérifié visuellement : carte, faune obtenue, recettes (infos + classement profit), panneau admin (ajouter/import-export) dans les deux thèmes. Rendu cohérent.
- Marqueurs de carte revérifiés à l'écran dans les deux thèmes (dark/light) : bleu/rouge/or bien distincts.
- Audit `admin.css`/`admin-ui.css`/`filters.css`/`panels.css`/`recipes.css`/`wildlife.css` : aucune couleur codée en dur hors tokens.
- Titres de section (`Filtres`, `Météo actuelle`, `Horaires`, `Niveau de passion`) passés en bleu accent (`--color-accent`) en mode clair : ils héritaient du gris/noir de `--color-text`, incohérent avec la palette bleu dominant.

## À faire ensuite
- Vérifier visuellement le bouton de suppression rouge (admin) : bloqué par la boîte de dialogue native du mot de passe admin, qui gèle le rendu pendant qu'elle est ouverte (le mot de passe en dur est un risque déjà accepté, cf. mémoire). À refaire manuellement ou en gardant la session ouverte après saisie.
- Vérifier une valeur de profit négatif en rouge : câblage CSS confirmé (`.profit-negatif` → `--color-profit-neg`/`--color-profit-neg-bg`, correct dans les deux thèmes), mais aucune recette du jeu de données actuel n'a de profit négatif (`#50` s'arrête à `+0`) donc impossible à vérifier à l'écran en conditions réelles.
- Décider si on va plus loin sur le rafraîchissement : typographie plus ronde/cozy (ex. Google Font "Baloo 2" ou "Fredoka" pour les titres, en gardant une police lisible pour le corps), arrondis (`border-radius`) plus généreux, ombres douces sur les cartes. Rien fait sur ce point pour l'instant, périmètre encore à valider.
- Ne fusionner `ui-ux-refresh` dans `main` qu'après validation visuelle complète des deux thèmes sur toutes les vues.
