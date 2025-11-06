# Lomener Port d'Attache – Site

Ce dépôt contient le site de l'association **Lomener Port d'Attache**, construit avec Eleventy (11ty). Ce README explique de manière simple et directe comment lancer le site en local pour du développement ou pour prévisualiser la version statique.

---

## Prérequis

- Node.js 18+ (recommandé)
- `npm` (fourni avec Node.js)

**Optionnel** :
- `netlify-cli` si tu veux tester les fonctions Netlify (formulaire) en local :

```bash
npm i -g netlify-cli
# puis
netlify dev
```

---

## Démarrer le projet en local (pas à pas)

1. Récupère le dépôt (si pas déjà fait):

```bash
git clone <url-du-repo>
cd lomener-site
```

2. Installe les dépendances :

```bash
npm install
```

3. Lance le serveur de développement (Eleventy avec auto-reload) :

```bash
npm run start
```

Eleventy sert par défaut sur http://localhost:8080 (il affiche l'URL dans le terminal). Toute modification dans `src/` est régénérée automatiquement.

Astuce pour changer de port :

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

Les fichiers statiques sont écrits dans `public/`. Pour visualiser localement le résultat statique, tu peux servir ce dossier avec `http-server`, `serve`, ou le serveur Python :

```bash
npx http-server public -p 8080
# ou
python3 -m http.server 8080 --directory public
```

---

## Accéder depuis un autre appareil sur le réseau local

Si tu veux prévisualiser le site depuis un téléphone ou une autre machine du réseau :

1. Trouve ton IP locale (exemple Linux) :

```bash
ip a
# repère l'IP sur ton interface réseau (ex: 192.168.1.23)
```

ou pour Windows :
``` bash
ipconfig
# repère l'IP sur ton interface réseau (ex: 192.168.1.23)
```

2. Ouvre dans le navigateur de l'autre appareil :

``` bash
http://<ton_ip_locale>:8080
# ex : http://192.168.1.23:8080
```

(Remplace 8080 par le port que tu utilises si tu l'as changé.)

---

## Tester la fonction contact (Netlify Functions)

Le formulaire de contact utilise une fonction serverless située dans `netlify/functions/send-contact.js` (et `nodemailer`). Pour tester l'envoi en local :

- Option A (rapide) : déployer sur Netlify (branch + build) et tester depuis l'URL de preview.

- Option B (local) : utiliser `netlify-cli` :

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

- Si `npm run start` refuse de démarrer : vérifie la version de Node (`node -v`) et supprime `node_modules` puis réinstalle :

```bash
rm -rf node_modules package-lock.json
npm install
```

- Si la page ne se recharge pas après modification : relance `npm run start`. Eleventy peut parfois garder un processus ou watcher bloqué.

- Si le PDF ou les médias ne s'affichent pas : vérifie que `public/` a bien été régénéré (`npm run build`) et que les chemins (`/media/...`) existent.