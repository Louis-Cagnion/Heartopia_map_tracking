# Reste à faire — chantier UI/UX (branche `ui-ux-refresh`)

## Fait
- Recherche de la palette officielle Heartopia (captures Google Play, palette communautaire lospec) : bleu ciel/turquoise dominant, corail, or chaud, vert nature.
- Nouvelle palette appliquée dans `css/main.css` (`:root` + `body.light-mode`) : bleu comme couleur dominante (`--color-accent`, `--bg-tab-active`), rouge vif comme couleur de contraste secondaire (`--color-danger`, `--color-profit-neg`), or réservé aux pièces/monnaie (`--color-gold`).
- Couleurs des marqueurs de carte alignées dans `css/map.css` (poisson/oiseau/insecte).
- Vérifié visuellement : carte, faune obtenue, recettes (infos + classement profit), panneau admin (ajouter/import-export) dans les deux thèmes — rendu cohérent.

## À faire ensuite
- Vérifier visuellement le bouton de suppression rouge (admin) et une valeur de profit négative en rouge, dans les deux thèmes, avec la nouvelle teinte de rouge (pas encore contrôlé à l'écran).
- Vérifier les marqueurs de carte (couleurs mises à jour) directement sur l'image de la carte, dans les deux thèmes.
- Décider si on va plus loin sur le rafraîchissement : typographie plus ronde/cozy (ex. Google Font "Baloo 2" ou "Fredoka" pour les titres, en gardant une police lisible pour le corps), arrondis (`border-radius`) plus généreux, ombres douces sur les cartes — rien fait sur ce point pour l'instant, périmètre encore à valider.
- Repasser sur `css/admin.css`, `css/admin-ui.css`, `css/filters.css`, `css/panels.css`, `css/recipes.css`, `css/wildlife.css` pour confirmer qu'aucune couleur codée en dur ne contourne les tokens (l'audit initial n'en a trouvé aucune, mais pas revérifié après ce changement de palette).
- Ne fusionner `ui-ux-refresh` dans `main` qu'après validation visuelle complète des deux thèmes sur toutes les vues.
