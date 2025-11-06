# Lomener Port d'Attache – Site

Ce dépôt contient le site de l'association **Lomener Port d'Attache**, construit avec [Eleventy](https://www.11ty.dev/). Le site met en avant l'actualité, la présentation de l'association et propose un formulaire de contact sécurisé.

## Prérequis

- [Node.js](https://nodejs.org/) 18 ou plus récent (installer via le site en hyperlien)
- Gestionnaire de paquets `npm` (fourni avec Node.js, rien à faire)

## Démarrer le projet en local

```powershell
npm install
npm run start
```

Le site sera accessible via l'URL indiquée par Eleventy (par défaut http://localhost:8080). Toute modification dans `src/` est régénérée automatiquement.

Pour y accéder à partir d'un autre appareil sur un réseau local :

Linux :
```
ip a
```

Windows :
```
ipconfig
```

MacOS
```
Menu pomme > préférences système > réseau > sélectionner le réseau actif > ip locale
```

L'addresse IP locale devrait ressembler à 192.168.1.x si vous êtes sur un réseau local (avec x entre 2 et 254)

L'addresse du site sur le réseau local est la suivante :
http://{ip_locale}:8080 (par défaut 8080)

exemple :
http://192.168.1.30:8080

---

Pour générer la version statique prête à être déployée :

```powershell
npm run build
```

---

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
