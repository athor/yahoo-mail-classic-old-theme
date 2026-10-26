# Yahoo Classique

Extension Firefox indépendante développée pour **athor**. Elle habille la nouvelle interface Yahoo Mail dans un style violet inspiré de l’ancienne présentation. Elle ne rétablit pas les anciennes versions du service Yahoo.

## Version 1.0.0

- Bandeau violet et logo blanc.
- Bouton de rédaction bleu et rectangulaire.
- Volet gauche de 280 px sur les fenêtres d’au moins 1 000 px, avec davantage de place pour les dossiers.
- Bord gauche de la recherche aligné sur celui de la liste des messages sur ces fenêtres ; l’alignement suit les redimensionnements.
- Panneaux aux coins droits et séparateurs discrets.
- Interrupteur dans le panneau de l’extension, appliqué aux onglets Yahoo ouverts sans rechargement.
- Aucun changement de police ni des dimensions des lignes virtualisées de Yahoo.

L’habillage cible les éléments de l’application. Il ne modifie pas les corps des mails ni les fonctions d’envoi, de sélection ou de suppression. Le volet droit conserve ses commandes.

## Installation pour essai

1. Désactivez BetterYahoo pour éviter le chevauchement des habillages.
2. Dans Firefox, ouvrez `about:debugging#/runtime/this-firefox`.
3. Cliquez sur **Charger un module complémentaire temporaire…**.
4. Sélectionnez `extension/manifest.json` dans ce projet.
5. Retournez sur Yahoo Mail et rechargez la page une fois.
6. Cliquez sur le puzzle de Firefox puis sur **Yahoo Classique** pour accéder à l’interrupteur.

L’extension temporaire est retirée au redémarrage de Firefox. Une installation permanente dans Firefox standard nécessite la signature Mozilla, y compris pour une distribution privée non répertoriée. La publication GitHub du code ne constitue pas une signature. Voir la [documentation Mozilla](https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/).

## Données et permissions

Le code ne lit pas le contenu des mails, n’accède pas aux cookies et ne transmet aucune donnée. Il mesure uniquement la position de deux éléments de présentation pour aligner la recherche. L’unique préférence est stockée localement dans Firefox. Le script s’exécute uniquement sur `https://mail.yahoo.com/*` et charge une feuille CSS locale fournie avec l’extension.

## Développement

Aucune dépendance ni compilation n’est nécessaire pour charger les sources dans Firefox.

Tests : `node --test tests/*.test.mjs` (Node.js 20 ou plus récent).

Paquet non signé : `python tools/package.py` (Python 3). Le ZIP généré dans `dist/` contient le manifeste à sa racine et peut être fourni à Mozilla pour signature. Le script conserve une sauvegarde des archives existantes avant de les remplacer.

Les tests couvrent l’activation, la désactivation, les changements de réglage concurrents, le nettoyage des observateurs, le chargement tardif de Yahoo et l’alignement sans dérive après redimensionnement. Le rendu de l’aperçu initial a été contrôlé sur une capture réelle ; l’élargissement final et l’alignement automatique nécessitent encore une vérification dans Firefox.

## Compatibilité et retrait

Firefox 140 ou plus récent. Les sélecteurs correspondent à la nouvelle interface Yahoo observée en octobre 2026. Des changements ultérieurs du site peuvent nécessiter une adaptation. La palette correspond au thème clair utilisé pour le développement ; le rendu avec d’autres thèmes reste à vérifier.

Décochez **Activer l’habillage classique** pour retrouver immédiatement le rendu natif. Retirez le module dans Firefox pour le désinstaller. Aucun mail n’est modifié.

## Licence

MIT — copyright 2026 athor.
