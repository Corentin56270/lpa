# Lomener Port d'Attache – Site

Ce dépôt contient le site statique de l'association **Lomener Port d'Attache**, construit avec [Eleventy](https://www.11ty.dev/). Le site met en avant l'actualité, la présentation de l'association et propose désormais un formulaire de contact sécurisé.

## Prérequis

- [Node.js](https://nodejs.org/) 18 ou plus récent
- Gestionnaire de paquets `npm` (fourni avec Node.js)

## Démarrer le projet en local

```powershell
npm install
npm run start
```

Le site sera accessible via l'URL indiquée par Eleventy (par défaut http://localhost:8080). Toute modification dans `src/` est régénérée automatiquement.

Pour générer la version statique prête à être déployée :

```powershell
npm run build
```

Le build est exporté dans le dossier `public/`.

## Formulaire de contact sécurisé

Le formulaire de contact (page `src/contact.njk`) envoie les messages vers une fonction serverless située dans `netlify/functions/send-contact.js`. Aucun courriel n'est stocké en clair dans le code : la fonction s'appuie sur des variables d'environnement.

### Variables d'environnement à définir

| Nom | Description |
| --- | --- |
| `CONTACT_EMAIL` | Adresse destinataire finale (ex. `loremipsum@laposte.net`). |
| `SMTP_HOST` | Hôte SMTP de votre fournisseur de messagerie. |
| `SMTP_PORT` | Port SMTP (généralement `587` ou `465`). |
| `SMTP_USER` | Identifiant/compte SMTP utilisé pour l'envoi. |
| `SMTP_PASS` | Mot de passe ou token SMTP. |
| `SMTP_SECURE` *(optionnel)* | Mettre `true` pour forcer TLS explicite (port 465). |
| `CONTACT_ALLOWED_ORIGINS` *(optionnel)* | Liste d'origines autorisées séparées par des virgules pour la protection CORS (ex. `https://www.monsite.fr,https://admin.monsite.fr`). |

> Sur Netlify, rendez-vous dans **Site settings ➜ Build & deploy ➜ Environment** pour définir ces variables. Sur une autre plateforme (Vercel, Render, etc.), créez l'équivalent de la fonction serverless et mappez les mêmes variables.

### Flux côté client

- Le formulaire empêche les robots simples via un champ « honeypot ».
- Les données sont validées côté client et côté serveur.
- Les messages de succès/erreur sont affichés immédiatement sous le bouton d'envoi.

## Sécurité & bonnes pratiques

- Aucun e-mail n'apparaît dans le HTML rendu.
- Les champs sont nettoyés et testés côté serveur avant l'envoi SMTP.
- Adaptez les règles CORS via `CONTACT_ALLOWED_ORIGINS` si vous déployez sur plusieurs domaines.
- Activez l'authentification SMTP via un mot de passe spécifique à l'application quand le fournisseur le propose.

## Structure clé

```
src/
├── _includes/           # Layouts et composants Nunjucks
├── styles/              # Feuilles de style (CSS principal : home.css)
├── contact.njk          # Page contact avec formulaire sécurisé
└── ...
netlify/
└── functions/
    └── send-contact.js  # Fonction d'envoi d'e-mails via nodemailer
```
