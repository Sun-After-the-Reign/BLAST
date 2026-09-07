# B.L.A.S.T — Bot Discord

B.L.A.S.T : Beyblade Logging & Anti-Scalping Technology

Surveille toutes les heures la recherche "beyblade x" sur Amazon Japan et notifie sur Discord dès qu'un nouveau produit (nouvel ASIN) apparaît.

## Installation

```bash
npm install
```

Remplis `config.json` :
- `token` : token de ton bot (portail développeur Discord)
- `channel` : ID du salon où envoyer les notifications
- `ping` : ID de la personne à ping

Le bot n'a besoin d'aucune permission particulière côté Gateway Intents (pas de contenu de message à lire), juste du droit d'envoyer des messages dans le salon cible.

## Lancement

```bash
npm run start
```

Au premier lancement, le bot enregistre l'état actuel des produits sans notifier (pour éviter de spammer avec tout l'historique existant). Les lancements suivants ne notifient que les nouveautés.

## Fonctionnement

- `scraper.js` : récupère et parse la page de résultats Amazon.co.jp
- `sstorage.js` : garde la liste des ASIN déjà vus dans `seen-products.json`
- `blast.js` : orchestre le tout, cron horaire (`0 * * * *`), envoi Discord

## Limites connues et pistes d'évolution

- **Sélecteurs CSS fragiles** : Amazon modifie régulièrement le HTML de ses   pages de résultats. Si le bot arrête de détecter des produits, c'est probablement `scraper.js` qu'il faut ajuster (inspecter la page avec les devtools pour retrouver les nouvelles classes).
- **Détection anti-bot** : en cas de CAPTCHA récurrent ou de blocage, il faudra soit espacer les requêtes, soit passer par un rendu type Playwright (simule un vrai navigateur), soit utiliser un proxy résidentiel.
- **Pas d'API officielle adaptée** : la Product Advertising API d'Amazon nécessite un compte Associates avec des ventes qualifiantes, donc pas utilisable ici pour un simple monitoring personnel.
- **Process persistant** : pour tourner en continu, prévoir un gestionnaire de process (`pm2`, service systemd, etc.) plutôt que de laisser le terminal ouvert.
