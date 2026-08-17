# Happy Life

Plateforme numérique facilitant l'accès aux espaces de détente au Gabon : piscines ouvertes au public et appartements meublés pour séjours courts. Découverte des lieux, informations essentielles, envoi de demandes de réservation, mise en relation client/propriétaire **sans jamais afficher les contacts directs**.

Réalisée à partir du *Cahier des charges complet — Happy Life (MVP)*, version professionnelle sans chiffres, rédigé par Joseph Mbeng Yannick (Fondateur & Concepteur, Libreville) et Juste Cléona Ntoutoume (Fondateur), puis enrichie d'un habillage « application mobile » et de fonctions complémentaires (avis, favoris, promotions, événements) demandées explicitement au-delà du périmètre initial du cahier des charges — voir la section *Fonctions ajoutées au-delà du MVP* ci-dessous.

## Stack technique

Application **web responsive** (utilisable sur mobile et ordinateur, sans passer par un store), conformément à l'option recommandée du cahier des charges (section 7).

- **Next.js 16** (React 19, App Router) — un seul framework pour le site public, l'espace propriétaire et l'administration.
- **Base de données intégrée (SQLite via `node:sqlite`)** — aucun compte cloud à créer, aucune clé d'API à configurer : le fichier `data/happy-life.db` contient toutes les données et se déplace avec le projet, dans l'esprit « simplicité de maintenance » du cahier des charges.
- **Tailwind CSS 4** pour le style (palette bleu-turquoise inspirée de l'univers piscine/détente, cohérente avec la maquette de référence fournie).
- **Authentification maison** (email + mot de passe, sessions par cookie signé) pour les espaces propriétaire et administrateur — pas de dépendance externe.
- Aucune bibliothèque de paiement, de chat ou de réservation automatique : conforme à la section 5 du cahier des charges (*Ce que le MVP ne fera pas*).

## Démarrage rapide

Prérequis : **Node.js 22 ou plus récent** (le module `node:sqlite` utilisé pour la base de données y est intégré nativement).

```bash
npm install          # installe les dépendances
npm run seed          # crée la base de données avec des comptes et fiches de démonstration
npm run dev            # démarre le site sur http://localhost:3000
```

Pour une build de production :

```bash
npm run build
npm run start
```

Avant une mise en ligne réelle, copiez `.env.example` vers `.env.local` et remplacez `AUTH_SECRET` par une valeur aléatoire (voir la commande indiquée dans le fichier).

### Accès mobile (PWA)

L'application inclut un manifeste web (`src/app/manifest.ts`) et les icônes associées (`public/icon-*.png`, `public/apple-touch-icon.png`, générées par `scripts/generate-app-icons.mjs`). `next start` écoute par défaut sur `0.0.0.0`, donc tout appareil connecté au même réseau local que le serveur peut ouvrir `http://<IP-locale-du-PC>:3000` dans son navigateur, puis utiliser « Ajouter à l'écran d'accueil » (Safari iOS) ou « Installer l'application » / « Ajouter à l'écran d'accueil » (Chrome Android) pour obtenir une icône dédiée. Voir `LISEZ-MOI-DABORD.txt` pour les instructions destinées à l'utilisateur final. Sur Android, un lancement en plein écran total nécessite HTTPS, indisponible en local sans configuration supplémentaire (certificat auto-signé) — l'icône reste néanmoins fonctionnelle en accès direct.

Pour tester sur téléphone **sans que l'ordinateur reste allumé** (ex. iPhone, accès depuis n'importe quel réseau), voir `DEPLOIEMENT-CLOUD.md` : hébergement gratuit chez Render à partir du même code, avec `render.yaml` déjà configuré dans ce dépôt. Cette option est pensée pour les tests (données de démonstration réinitialisées à chaque réveil du service après une période d'inactivité) et s'écarte donc volontairement du principe « tout en local, sans cloud » qui reste la cible pour l'usage réel.

## Comptes de démonstration

Créés par `npm run seed` (à ne pas utiliser tels quels en production) :

| Rôle | Email | Mot de passe |
| --- | --- | --- |
| Administrateur | admin@happylife.ga | admin1234 |
| Propriétaire (actif — mêmes droits que l'admin) | sarah.ondo@happylife.ga | proprio1234 |
| Propriétaire (actif — mêmes droits que l'admin) | jp.mba@happylife.ga | proprio1234 |
| Propriétaire (actif — mêmes droits que l'admin) | contact@residences-owendo.ga | proprio1234 |

Le jeu de données inclut des fiches piscines et appartements dans plusieurs zones de Libreville, à différents statuts (validée, en attente, refusée) et quelques demandes de réservation, pour visualiser tous les parcours dès le premier lancement.

Les photos affichées sont des visuels de démonstration générés localement (aucune photo externe) : les propriétaires remplacent ces visuels par leurs propres photos lors de la création ou modification d'une fiche.

## Correspondance avec le cahier des charges

### 4.1 — Fonctions utilisateurs (visiteurs, sans compte)
- Page d'accueil avec recherche par zone, pages *Piscines* et *Appartements meublés*.
- Recherche et filtrage par zone / quartier / type de service (`/recherche`).
- Fiche détaillée : photos, description, zone, équipements, tarif indicatif, disponibilités.
- Bouton unique **« Demande de réservation / Contacter via Happy Life »** — formulaire (nom, téléphone, email optionnel, message) qui crée une demande transmise au propriétaire. **Les numéros des propriétaires ne sont jamais affichés publiquement.**

### 4.2 — Fonctions propriétaires (`/proprietaire`)
- Création de compte et connexion dédiées.
- Création et gestion de fiches (piscine ou appartement) : photos, description, zone/quartier, tarif indicatif, équipements, disponibilités en texte libre.
- Réception des demandes envoyées par les visiteurs, avec suivi *nouvelle / traitée*.
- Activation / désactivation de chaque fiche à tout moment.
- Toute modification d'une fiche déjà validée la repasse automatiquement en attente de validation (contrôle éditorial systématique).
- **Un propriétaire actif a en plus, à la demande explicite de l'utilisateur, les mêmes droits que l'administrateur** — voir *Droits identiques administrateur / propriétaire* ci-dessous.

### 4.3 — Fonctions admin (`/admin`)
- Validation, refus (avec motif visible par le propriétaire) ou remise en attente de chaque fiche : c'est la **modération obligatoire avant publication** exigée en section 10.
- Gestion des comptes propriétaires (validation des inscriptions, suspension / réactivation, suppression).
- Suivi de toutes les demandes, tous propriétaires confondus.
- Tableau de bord : nombre de fiches, nombre de demandes, état des contenus publiés (validées / en attente / refusées).

### Droits identiques administrateur / propriétaire

À la demande explicite de l'utilisateur (*« l'administrateur et le propriétaire ont les mêmes droits »*), un compte propriétaire **actif** a désormais accès à l'intégralité de l'espace `/admin` (lien *Administration* dans son propre tableau de bord) : validation/refus de **toutes** les fiches (pas seulement les siennes), suivi de toutes les demandes, modération des avis, gestion des promotions et des événements, et gestion des comptes propriétaires (y compris validation des nouvelles inscriptions et suppression des comptes non conformes).

Pour que cet accès élargi reste maîtrisé, une nouvelle étape a été introduite : **tout compte propriétaire créé par auto-inscription démarre au statut « en attente »** et ne peut ni se connecter ni agir tant qu'il n'a pas été validé par l'administrateur ou par un propriétaire déjà actif (bouton *Valider* dans `/admin/comptes`). Ce garde-fou évite qu'un compte tout juste créé, potentiellement frauduleux, obtienne immédiatement des droits d'administration.

⚠️ **Note de sécurité** : cette évolution supprime, pour les propriétaires actifs, la séparation stricte entre l'espace propriétaire et l'espace admin prévue à l'origine par le cahier des charges (section 10 — *« Accès administrateur strictement séparé de l'espace propriétaire »*), ainsi que le principe qu'un propriétaire ne modère que son propre contenu. Sur une plateforme réellement mise en ligne avec plusieurs propriétaires indépendants, cela signifie que chacun peut valider, refuser ou supprimer les fiches, avis, comptes et demandes des autres. Ce choix a été fait sciemment par l'utilisateur, qui a été informé de cet arbitrage avant de le confirmer ; il peut être révisé plus tard si un modèle plus restrictif (ex. propriétaires limités à leur propre contenu) s'avère préférable en production.

### 5 — Ce que l'application ne fait toujours pas
Aucun paiement intégré, aucune réservation automatisée avec disponibilité en temps réel, aucun chat en direct, aucun agenda synchronisé, aucun compte visiteur (favoris/réservations restent liés à l'appareil via cookie, sans mot de passe). Les disponibilités des fiches sont saisies en texte libre par le propriétaire, exactement comme prévu pour cette phase du cahier des charges.

## Fonctions ajoutées au-delà du MVP

À la demande explicite de l'utilisateur, ces fonctions réelles (données en base, modération admin) ont été ajoutées au-delà du périmètre du cahier des charges initial :

- **Avis & notes** (`avis`) : tout visiteur peut laisser une note (1 à 5) et un commentaire sur une fiche ; publication après modération admin (`/admin/avis`), comme les fiches.
- **Favoris** (`favoris`) : bouton cœur sur chaque fiche, sans compte requis — lié à un identifiant anonyme stocké dans un cookie (`hp_visiteur`, posé par `src/proxy.ts`). Consultable sur `/favoris`.
- **Promotions** (`promotions`) : l'admin peut mettre en avant une offre limitée sur une fiche validée (badge, réduction %, prix barré/promo), affichée en page d'accueil (`/admin/promotions`).
- **Événements** (`evenements`) : l'admin publie des événements (concerts, festivals, marchés) affichés en page d'accueil ; les visiteurs envoient une demande de place centralisée par Happy Life, comme pour les fiches (`/admin/evenements`).
- **Mes réservations** (`/mes-reservations`) : historique des demandes envoyées depuis cet appareil (fiches et événements), également lié au cookie visiteur.
- **Écran d'accueil façon application** (`Commencer` / `Se connecter`) et **installation sur l'écran d'accueil du téléphone** (PWA) — voir la section *Accès mobile* ci-dessus.
- **Droits identiques administrateur / propriétaire** : un propriétaire dont le compte est actif a accès à `/admin` avec les mêmes droits que l'administrateur (validation des fiches, avis, promotions, événements, comptes). Voir la section *Droits identiques administrateur / propriétaire* ci-dessus.
- **Validation des nouveaux comptes propriétaires** : toute nouvelle inscription (`/proprietaire/inscription`) démarre au statut « en attente » et ne peut se connecter qu'après validation par l'administrateur ou par un propriétaire déjà actif (`/admin/comptes`, bouton « Valider »).
- **Vitrine propriétaire publique** (`/proprietaires/[id]`) : page de profil présentant un propriétaire (nom, badge vérifié, nombre de fiches, note moyenne) et la liste de ses fiches publiées — sans jamais exposer téléphone/email (voir *Sécurité & confidentialité*). Accessible depuis chaque fiche détail.
- **Favoris propriétaires** : en plus des favoris sur une fiche, un visiteur peut suivre un propriétaire entier (bouton « ♥ Favoris » sur sa vitrine), consultable sur `/favoris`.
- **Partage** : bouton de partage (API native du téléphone, ou lien copié) sur la page d'accueil, une fiche et une vitrine propriétaire.
- **Espace visiteur — alertes** (`abonnes`) : formulaire en page d'accueil pour s'inscrire (email et/ou téléphone) aux alertes sur les nouveaux événements, promotions et fiches publiées. Aucun envoi automatique n'est configuré dans ce MVP (pas de service d'email/SMS tiers) ; les inscriptions sont consultables par l'administrateur sur `/admin/abonnes` pour un envoi manuel ou un branchement futur.
- **Encart publicitaire** (`publicites`) : véritable système d'administration (créer / activer-désactiver / supprimer une publicité avec image, annonceur et lien), affiché en page d'accueil, sur le modèle des Promotions (`/admin/publicites`).
- **Réseaux sociaux & WhatsApp** : bouton flottant WhatsApp sur tout le site public et icônes Facebook / TikTok / WhatsApp en pied de page. Le numéro WhatsApp (`+241 77 00 00 00`) est confirmé ; les adresses Facebook et TikTok sont pour l'instant des liens génériques à remplacer par les vraies pages dans `src/lib/social.ts` (marqué `⚠️ À COMPLÉTER` dans le code).
- **Idées inspirées de Booking.com** (à la demande explicite de l'utilisateur, après analyse d'une page Booking.com fournie) : filtres avancés par équipements et note minimale sur `/recherche` ; recherche enrichie en page d'accueil (zone + type en une étape) ; « Zones tendance » en page d'accueil (zones les plus demandées, calculées sur les vraies données, jamais une liste inventée) ; section « Ajoutées récemment » ; score qualitatif en mot (« Superbe », « Très bien », « Exceptionnel »...) à côté de la note chiffrée, sur les fiches, la fiche détail et la vitrine propriétaire. Volontairement écartées : programme de fidélité façon Genius, sélecteur de devise/langue (une seule devise FCFA, un seul public francophone), badges d'urgence type « il ne reste que X chambres » (message de rareté non vérifiable, contraire à la logique de confiance de la plateforme).

Ces ajouts restent volontairement simples (pas de compte visiteur avec mot de passe, pas de paiement) pour ne pas réintroduire la complexité que le cahier des charges cherchait justement à éviter en phase 1.

### 10 — Sécurité & confidentialité
- Les numéros de téléphone des propriétaires ne transitent jamais vers le public : seules les demandes (contenant les coordonnées du *client*) sont visibles par le propriétaire concerné.
- Mots de passe hachés (bcrypt), sessions signées (cookies httpOnly).
- Accès administrateur strictement séparé de l'espace propriétaire.
- Modération obligatoire : une fiche n'apparaît publiquement qu'après validation par l'administrateur, et redevient invisible si le propriétaire la désactive ou si l'administrateur la refuse/désactive.

## Structure du projet

```
src/app/(public)/          Accueil, recherche, fiche détail (visiteurs, sans compte)
src/app/proprietaire/       Connexion, inscription, puis espace protégé (fiches, demandes)
src/app/admin/               Connexion, puis espace protégé (validation, comptes, demandes, stats)
src/lib/db.ts, data.ts       Accès à la base SQLite embarquée
src/lib/actions/             Server Actions (créer/modifier une fiche, se connecter, valider...)
src/components/              Composants d'interface réutilisables
scripts/seed.mjs             Génère la base de démonstration (fiches, avis, favoris, promotions, événements)
scripts/generate-photo-cards.mjs  Génère les visuels « photo-style » de démonstration (piscines/appartements/événements)
scripts/generate-hero-image.mjs   Génère l'image de fond de l'écran d'accueil
scripts/generate-app-icons.mjs    Génère les icônes PWA (écran d'accueil du téléphone)
```

## Prochaines étapes (Phase 2, hors périmètre MVP)

Comme indiqué en section 6 du cahier des charges : paiement mobile money & carte bancaire, réservation automatique, commissions intégrées, chat interne, statistiques avancées, Happy Nights / Happy Weekends, programme de fidélité, notifications push, back-office avancé, espaces partenaires, publicités sponsorisées.

## Propriété

Conformément à la section 11 du cahier des charges, le nom et le logo *Happy Life* ainsi que le concept restent la propriété des fondateurs du projet, Joseph Mbeng Yannick et Juste Cléona Ntoutoume.
