# Lomener Port d'Attache – Site

Ce dépôt contient le site de l'association **Lomener Port d'Attache**, construit avec [Eleventy](https://www.11ty.dev/). Le site met en avant l'actualité, la présentation de l'association et propose un formulaire de contact sécurisé.

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
