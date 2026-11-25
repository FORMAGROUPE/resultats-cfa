# Page « Nos résultats » – CFA E-FORMA CAMPUS

L'objectif de ce document est de décrire la mise en ligne et la mise à jour de la page publique des indicateurs de résultats du CFA, alimentée par Notion et hébergée sur GitHub Pages.

## Fonctionnement

1. Les chiffres sont saisis dans deux bases Notion :
   - « Résultats CFA E-FORMA CAMPUS – page publique » : formations en apprentissage, une ligne par formation et par session ;
   - « Résultats E-FORMA CAMPUS – formations non diplômantes » : formations qualifiantes et certifiantes (RS, RNCP), une ligne par formation et par année.
2. GitHub lit la base Notion, calcule les taux et régénère la page : immédiatement après une modification (si le relais n8n est en place, étape 5) et, dans tous les cas, toutes les heures.
3. La page reprend l'en-tête, le pied de page, les polices et les couleurs du site www.eformacampus.fr en chargeant directement ses feuilles de style : une évolution de la charte du site s'y répercute sans intervention.

Seules les lignes dont la case **Publier** est cochée apparaissent en ligne.

## Mise en place (une seule fois)

### 1. Connecter Notion

1. Aller sur https://www.notion.so/profile/integrations, créer une intégration **interne** nommée « Page résultats CFA », droits : *lecture du contenu* uniquement.
2. Copier le **secret** de l'intégration (commence par `ntn_`).
3. Ouvrir la page Notion « Page Résultats E-FORMA CAMPUS – données publiées », qui contient les deux bases : menu `•••` en haut à droite > **Connexions** > ajouter « Page résultats CFA ». Les deux bases héritent de cet accès.
4. Copier l'identifiant de chaque base : c'est la suite de 32 caractères dans son adresse.
   - apprentissage : `423c698e54248125a0c2dfd09d40b4f9`
   - non diplômantes : `423c698e5424811ea199c10fb06dec06`

### 2. Créer le dépôt GitHub

1. Créer un dépôt **public** (GitHub Pages est gratuit pour les dépôts publics), par exemple `resultats-cfa`.
2. Y déposer l'ensemble des fichiers de ce dossier, y compris le dossier caché `.github`.
3. **Settings > Secrets and variables > Actions** :
   - onglet *Secrets* : `NOTION_TOKEN` = secret de l'intégration ;
   - onglet *Variables* : `NOTION_DATABASE_ID` = identifiant de la base apprentissage, `NOTION_DATABASE_ID_NON_DIPLOMANTES` = identifiant de la base non diplômantes (si cette variable est absente, la section n'apparaît pas).
4. **Settings > Pages** > *Source* : **GitHub Actions**.
5. **Actions** > « Publication des résultats CFA » > **Run workflow**. La page est en ligne au bout d'une minute environ.

### 3. Rattacher la page au site

1. **Settings > Pages** > *Custom domain* : `resultats.eformacampus.fr`.
2. Chez le gestionnaire DNS du domaine eformacampus.fr, créer un enregistrement `CNAME` : `resultats` → `<compte-github>.github.io`.
3. Une fois le domaine vérifié, cocher **Enforce HTTPS**.
4. Faire ajouter sur www.eformacampus.fr un lien « Nos résultats » vers https://resultats.eformacampus.fr (pied de page et page « Apprentissage du BTS au Mastère »). Sans ce lien, l'auditeur peut considérer que l'information n'est pas accessible au public.

### 4. Lien InserJeunes

Dans `config.json`, remplacer `urlInserJeunes` par l'adresse de la fiche du CFA sur InserJeunes (recherche par nom ou numéro UAI sur https://www.inserjeunes.education.gouv.fr/diffusion/accueil). Le guide de lecture V10 demande au CFA d'informer de la mise à disposition de ces indicateurs.

### 5. Mise à jour immédiate depuis Notion (recommandé)

Notion ne peut pas déclencher GitHub directement : n8n sert de relais.

1. **n8n** : nouveau workflow
   - nœud *Webhook* (méthode POST), copier son URL de production ;
   - nœud *HTTP Request* :
     - méthode `POST`, URL `https://api.github.com/repos/<compte>/<dépôt>/actions/workflows/publier.yml/dispatches`
     - en-têtes : `Authorization: Bearer <jeton GitHub>`, `Accept: application/vnd.github+json`
     - corps JSON : `{"ref":"main"}`
   - jeton GitHub : *Settings > Developer settings > Fine-grained tokens*, limité à ce dépôt, permission **Actions : Read and write**.
2. **Notion** (offre Plus ou supérieure) : dans chacune des deux bases, bouton ⚡ **Automatisations** > déclencheur « Propriété modifiée » (toutes les propriétés) > action **Envoyer un webhook** vers l'URL n8n.

Plusieurs modifications rapprochées ne produisent qu'une seule publication. Sans ce relais, la page se met à jour au plus tard dans l'heure.

## Saisie dans Notion

| Règle | Pourquoi |
|---|---|
| Ne jamais renommer les colonnes | Le script les lit par leur nom exact |
| Cocher **Publier** seulement après vérification des chiffres | Aucun chiffre non justifié ne doit être publié |
| Laisser vide une donnée non encore connue (ne pas mettre 0) | La page affiche « Donnée non disponible » au lieu d'un faux 0 % |
| **Causes des abandons** : une cause par ligne, au format `Réorientation : 2` | Le nombre sert au graphique des causes |
| **Métiers visés** : un métier par ligne, repris de la fiche RNCP | Exigence de l'indicateur 3 (débouchés) |
| Nouvelle session : dupliquer les lignes et changer **Session** | Les sessions précédentes restent consultables en bas de page |
| Non diplômantes : choisir le **Type** (Qualifiante, Certifiante RS, Certifiante RNCP) | Les colonnes certification et insertion ne s'affichent que pour les certifiantes |
| Non diplômantes : **Taux insertion … fiche (%)** = valeur reprise de la fiche France compétences (saisir 72 pour 72 %) | Le guide V10 rattache les débouchés aux données de la fiche de la certification |
| Non diplômantes, e-learning asynchrone : heures réalisées = heures correspondant à la progression des stagiaires | Règle du guide V10 pour la formation asynchrone |

Les taux sont calculés par la page à partir des effectifs saisis ; la méthode de chaque taux est publiée dans la section « Méthodologie ».

## Correspondance avec les exigences

| Exigence | Où sur la page |
|---|---|
| Indicateur 2 : indicateurs de résultats et modalités de calcul transparentes (décret n° 2026-728) | Chiffres clés, fiches formation, section Méthodologie |
| Indicateur 2 (guide V10) : taux de réalisation des heures, taux de non-présentation | Fiches formation |
| Indicateur 2, obligation CFA : indicateurs de l'art. L. 6111-8 et information sur InserJeunes | Taux d'obtention, poursuite d'études, interruption, insertion, rupture ; bloc InserJeunes |
| Indicateur 3 : taux d'obtention mis en relation avec le taux de présentation ; insertion globale et dans le métier visé | Fiches formation ; tableau des formations certifiantes |
| Indicateur 2 pour les formations non diplômantes : satisfaction, réalisation des heures, abandon, non-présentation | Section « Formations qualifiantes et certifiantes » |

## Points de vigilance

- **Données personnelles** : la page ne publie que des effectifs agrégés. Sur un très petit groupe (signalé par `*` sous 10 apprentis), une cause d'abandon peut permettre d'identifier une personne : utiliser alors des libellés génériques.
- **Synchronisation horaire** : GitHub suspend les tâches planifiées d'un dépôt public sans activité pendant 60 jours. Le relais n8n (étape 5) n'est pas concerné ; sinon, réactiver le workflow dans l'onglet Actions.
- **Mesure d'audience** : désactivée par défaut. Pour l'activer, renseigner `googleTagManagerId` dans `config.json`, sous réserve du recueil du consentement.
- **Dépendance au site** : la page charge les styles depuis www.eformacampus.fr. Si le prestataire du site renomme les fichiers `assets/css/style.css` ou `assets/img/top4_2.webp`, mettre à jour `src/layout.mjs`.

## Aperçu local

```
npm run apercu      # page générée avec des données fictives (data/exemple.json)
npm run notion      # lecture réelle de Notion (NOTION_TOKEN et NOTION_DATABASE_ID requis)
npm run build
```
Ouvrir ensuite `dist/index.html` dans un navigateur. Le fichier `data/exemple.json` contient des chiffres fictifs et n'est jamais publié.
