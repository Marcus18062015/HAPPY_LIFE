# Tester Happy Life sur l'iPhone sans l'ordinateur

Ce guide met une copie de l'application en ligne (hébergement **gratuit** chez [Render](https://render.com)), accessible depuis n'importe quel réseau (Wi-Fi, 4G/5G) sur votre iPhone, **sans que l'ordinateur reste allumé**.

⚠️ **À savoir avant de commencer** — c'est une version pour **tester**, pas la version finale :

- Le service gratuit s'endort après 15 minutes sans visite, et met environ 1 minute à se réveiller à la prochaine ouverture (vous verrez une page de chargement).
- À chaque redémarrage (réveil ou nouvelle mise en ligne), les données reviennent à l'état de démonstration de départ : tout ce que vous avez créé pendant une session de test (nouvelle fiche, nouveau compte, avis...) peut disparaître au réveil suivant.
- Pour une vraie mise en ligne durable (données qui ne se réinitialisent jamais), il faudra passer à une offre payante chez Render — je peux vous accompagner le moment venu, aucune urgence.

Rien à installer sur l'iPhone au-delà de Safari. Comptez environ 15-20 minutes la première fois.

## Étape 1 — Mettre le code sur GitHub

GitHub est l'endroit où Render va récupérer le code de l'application. C'est gratuit.

1. Si vous n'avez pas de compte : allez sur [github.com](https://github.com/signup) et créez-en un (email + mot de passe).
2. Téléchargez **[GitHub Desktop](https://desktop.github.com/)** (application gratuite, uniquement des clics — pas de ligne de commande) et connectez-vous avec votre compte GitHub.
3. Dans GitHub Desktop : **File → Add local repository**, puis choisissez le dossier `happy-life` (celui que vous avez dézippé sur votre ordinateur).
4. GitHub Desktop propose de créer un dépôt (repository) à partir de ce dossier : cliquez sur **Create a repository**, laissez le nom `happy-life`, cliquez sur **Create Repository**.
5. Cliquez sur **Publish repository** en haut. Décochez « Keep this code private » si vous n'avez pas d'abonnement GitHub payant (un dépôt public est nécessaire sur un compte gratuit pour la suite — le code source n'a rien de confidentiel). Cliquez sur **Publish Repository**.

Votre code est maintenant sur GitHub, à l'adresse `https://github.com/VOTRE-NOM/happy-life`.

## Étape 2 — Créer le compte Render et déployer

1. Allez sur [render.com](https://render.com) et créez un compte — le plus simple est de cliquer sur **Sign up with GitHub** (aucune carte bancaire demandée pour l'offre gratuite).
2. Une fois connecté, cliquez sur **New +** (en haut à droite) → **Blueprint**.
3. Sélectionnez le dépôt `happy-life` que vous venez de publier (autorisez Render à accéder à vos dépôts GitHub si demandé).
4. Render détecte automatiquement le fichier `render.yaml` inclus dans le projet et propose de créer le service **happy-life** sur l'offre **Free**. Vérifiez que le plan affiché est bien "Free", puis cliquez sur **Deploy** / **Apply**.
5. Patientez 3 à 5 minutes pendant la première installation (vous verrez défiler les mêmes étapes que `1-Installer.bat` : `npm install`, création de la base de démonstration, puis `npm run build`).
6. Une fois le statut passé à **Live**, Render affiche l'adresse de votre application, du type :
   `https://happy-life-xxxx.onrender.com`

C'est cette adresse qui fonctionne depuis n'importe où — plus besoin du Wi-Fi de la maison.

## Étape 3 — Ouvrir l'app sur l'iPhone et l'installer

1. Sur l'iPhone, ouvrez **Safari** et allez sur l'adresse `https://happy-life-xxxx.onrender.com` donnée par Render.
2. Si la page met une minute à s'afficher, c'est normal (le service se réveille) — patientez.
3. Appuyez sur l'icône de partage (le carré avec la flèche vers le haut), puis **Sur l'écran d'accueil**.
4. L'icône Happy Life apparaît sur l'écran d'accueil, comme une vraie application — désormais accessible en 4G/5G, sans PC ni Wi-Fi local.

## Comptes de démonstration

Identiques à la version locale (voir le `README.md`) :

| Rôle | Email | Mot de passe |
| --- | --- | --- |
| Administrateur | admin@happylife.ga | admin1234 |
| Propriétaire (actif) | sarah.ondo@happylife.ga | proprio1234 |

## Mettre à jour la version en ligne après une modification

Si je vous envoie une nouvelle version du code plus tard : remplacez le contenu du dossier local `happy-life`, ouvrez GitHub Desktop, vous verrez les fichiers modifiés listés — écrivez une courte description en bas à gauche et cliquez sur **Commit to main**, puis **Push origin** en haut. Render redéploie automatiquement la nouvelle version en 2-3 minutes.
