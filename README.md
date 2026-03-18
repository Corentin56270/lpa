# Lomener Port d'Attache – Site

Ce dépôt contient le site de l'association **Lomener Port d'Attache**, construit avec Eleventy. Ce README explique comment lancer le site en local pour du développement ou pour prévisualiser une version statique.

---

## Prérequis

- Node.js 18+ (recommandé)
- `npm` (fourni avec Node.js)

**Optionnel** :
- `netlify-cli` pour tester les fonctions Netlify en local :

```bash
npm i -g netlify-cli
# puis
netlify dev
```

---

## Démarrer le projet en local

1. Récupérer le dépôt (si pas déjà fait):

```bash
git clone <https://github.com/Corentin56270/lpa.git>
cd lpa
```

2. Installer les dépendances :

```bash
npm install
```

3. Lance le serveur de développement (Eleventy avec auto-reload) :

```bash
npm run start
```

Eleventy sert par défaut sur http://localhost:8080 (il affiche l'URL dans le terminal). Toute modification dans `src/` est régénérée automatiquement.

Pour changer de port :

```bash
npm run start -- --port=3000
# ou
npx eleventy --serve --port=3000
```

---

## Raccourci : commandes essentielles

-> aller à la racine du site puis exécuter ceci :

- Installer les dépendances:

```bash
npm install
```

- Lancer le serveur de développement (auto-reload) :

```bash
npm run start
```

- **Optionnel** - Générer la version statique (dossier `public/`) :

```bash
npm run build
```


---

## Générer la version statique (prête à déployer)

```bash
npm run build
```

Les fichiers statiques sont écrits dans `public/`. Pour visualiser localement le résultat statique, servir ce dossier avec `http-server`, `serve`, ou le serveur Python :

```bash
npx http-server public -p 8080
# ou
python3 -m http.server 8080 --directory public
```

---

## Accéder depuis un autre appareil sur le réseau local

Pour prévisualiser le site depuis un téléphone ou une autre machine du réseau :

1. Trouver l'IP locale (host) :

Linux :
```bash
ip a
# repère l'IP sur ton interface réseau (ex: 192.168.1.23)
```

Windows :
``` bash
ipconfig
# repère l'IP sur ton interface réseau (ex: 192.168.1.23)
```

2. Ouvrir dans le navigateur de l'autre appareil (client) :

``` bash
http://<ton_ip_locale>:8080
# ex : http://192.168.1.23:8080
```

(Remplacer 8080 par le port utilisé si changement intentionnel, et par défaut si 8080 est déjà pris il sera sur 8081)

---

## Tester la fonction contact (Netlify Functions)

Le formulaire de contact utilise une fonction serverless située dans `netlify/functions/send-contact.js` (et `nodemailer`). Pour tester l'envoi en local :

- en local : utiliser `netlify-cli` :
OU
- déployer sur Netlify (branch + build) et tester depuis l'URL de preview.

```bash
npm i -g netlify-cli
netlify dev
```


---

## Emplacement des fichiers importants

- Contenu source : `src/` (templates Nunjucks, contenus, styles)
- Styles globaux : `src/styles/home.css`
- Fichiers générés : `public/` (version statique déployable)
- Functions Netlify (serverless) : `netlify/functions/`
- Script de démarrage (package.json) :
  - `npm run start` → eleventy --serve
  - `npm run build` → eleventy

---

## Dépannage rapide

- Si `npm run start` refuse de démarrer : vérifier la version de Node (`node -v`) et supprimer `node_modules` puis réinstalle :

```bash
rm -rf node_modules package-lock.json
npm install
```

- Si la page ne se recharge pas après modification : relancer `npm run start`. Eleventy peut parfois garder un processus ou watcher bloqué.

- Si le PDF ou les médias ne s'affichent pas : vérifier que `public/` a bien été régénéré (`npm run build`) et que les chemins (`/media/...`) existent.