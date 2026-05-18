# Modern Developer Guide 🚀

Bienvenue dans le dépôt du **Modern Developer Guide**. Ce projet open-source a pour vocation d'accompagner les développeurs débutants vers la maîtrise des outils modernes à travers une plateforme web interactive, minimaliste et très performante.

## 🎯 Présentation du Projet
Le **Modern Developer Guide** n'est pas qu'un simple tutoriel. C'est une plateforme éducative qui regroupe :
- 📖 **Un guide interactif** sous forme de slides pour apprendre les bases (Terminal, Git, Frameworks).
- 💡 **Une communauté d'astuces** permettant de partager des snippets et des bonnes pratiques, avec un système de likes en temps réel (Firebase Firestore).
- 🤖 **Un Chatbot IA** alimenté par Google Gemini 2.5 Flash pour répondre à vos questions techniques H24, entièrement optimisé pour mobile.

L'interface s'inspire des produits modernes (approche minimaliste, thèmes fluides) pour garantir une expérience de lecture et d'apprentissage optimale.

---

## 🛠 Stack Technique & Architecture
Nous utilisons les technologies les plus modernes du web :
- **Framework Frontend :** Angular v21+ (Standalone Components, Zoneless Change Detection, Signals pour la gestion d'état réactive).
- **Styles :** Tailwind CSS v4 pour un design rapide, responsive et modulaire, couplé avec les icônes `lucide-angular`.
- **Backend-as-a-Service :** Firebase (Authentification Google, Base de données NoSQL Firestore avec dé-normalisation pour de hautes performances).
- **Intelligence Artificielle :** API Google Gemini 2.5.
- **PWA (Progressive Web App) :** Support du mode hors-ligne, Service Worker (`@angular/pwa`), cache statique/dynamique et installable sur mobile/desktop.
- **SEO & Performances :** Génération de métadonnées OpenGraph dynamiques par page, `sitemap.xml`, `robots.txt` et indicateurs d'état de réseau.

---

## 🚀 Installation & Lancement Local

Pour contribuer ou lancer le projet sur votre machine, suivez ces étapes :

### 1. Prérequis
- Node.js installé (v20+ recommandé)
- Angular CLI installé globalement (`npm install -g @angular/cli`)

### 2. Cloner le dépôt
```bash
git clone https://github.com/votre-nom/modern-developer-guide.git
cd modern-developer-guide
```

### 3. Installer les dépendances
```bash
npm install
```

### 4. Configuration des variables d'environnement
Pour que la base de données et le Chatbot fonctionnent, les clés d'API doivent être configurées. 
Au premier lancement, le script `set-env.js` (lancé via `npm start`) générera automatiquement les fichiers d'environnement locaux (`src/environments/environment.ts`) avec des clés par défaut.
Si vous souhaitez utiliser vos propres environnements (recommandé) :
1. Créez un projet sur la [Console Firebase](https://console.firebase.google.com).
2. Activez l'authentification Google et Firestore.
3. Allez sur [Google AI Studio](https://aistudio.google.com/) pour récupérer une clé API Gemini.
4. Exportez-les dans votre terminal ou configurez-les directement :
```bash
export FIREBASE_API_KEY="votre_cle_firebase"
export GEMINI_API_KEY="votre_cle_gemini"
```

### 5. Lancer le serveur de développement
```bash
npm start
```
Ouvrez votre navigateur sur `http://localhost:4200/`. Le hot-reload est activé.

---

## ☁️ Déploiement sur Vercel
Ce projet est optimisé pour être déployé très facilement sur Vercel, avec un support complet du PWA et du SEO.

1. Connectez-vous sur [Vercel](https://vercel.com/).
2. Importez ce dépôt GitHub.
3. **Important :** Allez dans les paramètres (*Settings -> Environment Variables*) de votre projet Vercel et ajoutez obligatoirement les clés suivantes pour éviter que Firebase ne plante à la compilation :
   - `FIREBASE_API_KEY`
   - `GEMINI_API_KEY`
4. Cliquez sur **Deploy** (ou faites un *Redeploy* si le premier a échoué). Angular sera compilé automatiquement (`ng build`) et mis en ligne avec son Service Worker.

### 🔧 Dépannage & Erreurs Fréquentes au Déploiement

Il est très courant de rencontrer quelques frustrations de configuration lors du premier déploiement en tant que collaborateur. Voici comment les résoudre :

1. **Erreur : "The current domain is not authorized for OAuth operations"**
   - **Cause :** Firebase Auth bloque les connexions Google depuis des domaines inconnus (comme votre URL Vercel).
   - **Solution :** Allez dans la [Console Firebase](https://console.firebase.google.com/) > *Authentication* > *Settings* > *Authorized domains*. Cliquez sur *Add domain* et ajoutez exactement votre domaine Vercel (ex: `votre-app.vercel.app`).

2. **Erreur : "Firebase: Error (auth/invalid-api-key)"**
   - **Cause :** L'application a été compilée avec des clés d'API vides. Vous avez probablement ajouté les variables d'environnement dans Vercel *après* que l'application ait été déployée une première fois.
   - **Solution :** Sur Vercel, allez dans l'onglet *Deployments*, cliquez sur les 3 petits points à droite du dernier déploiement et choisissez **Redeploy**. Vercel relancera la compilation en injectant cette fois-ci les bonnes clés.

3. **Erreur : "API Gemini 403 (Forbidden)" dans la console**
   - **Cause :** Soit votre clé Gemini a des restrictions (ex: bloque les requêtes serveurs Vercel), soit l'accès n'est pas autorisé.
   - **Solution :** Sur [Google AI Studio](https://aistudio.google.com/app/apikey), générez une *nouvelle* clé API sans aucune restriction, mettez à jour la variable `GEMINI_API_KEY` dans Vercel, et faites un "Redeploy".

---

## 🤝 Contribution & Conventions
Nous accueillons toutes les contributions, même (et surtout !) celles des débutants.
- **TypeScript Strict :** Pas de type `any`. Utilisez toujours des interfaces explicites (`models/`).
- **Signals :** Utilisez toujours `signal()`, `computed()` et `effect()` pour la gestion d'état réactive (fini les observables RxJS complexes pour la vue).
- **Base de données :** Pour les listes imbriquées, utilisez les mises à jour atomiques Firestore (`arrayUnion`, `arrayRemove`).

**Comment contribuer :**
1. Forkez le projet.
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/ma-fonctionnalite`).
3. Codez, testez, puis commitez avec un message clair.
4. Ouvrez une Pull Request.

---

## 🗺 Roadmap Future
- [x] Refonte UI / UX (LosingTech style)
- [x] Migration vers Angular 21 et Signals
- [x] PWA et Mode Hors-ligne complet
- [x] SEO avancé et OpenGraph dynamiques par page
- [x] Pagination des listes Firestore
- [ ] Ajout d'un système de commentaires sous les astuces
- [ ] Profil utilisateur complet avec badges d'apprentissage
- [ ] Outil de quiz interactif pour tester ses connaissances
- [ ] **[IA]** Mise en place d'une architecture RAG (Retrieval-Augmented Generation) pour que l'IA puisse lire le contenu dynamique de Firestore.
- [ ] **[IA]** Persistance de l'historique de conversation (via `localStorage` ou Firestore) pour éviter la perte du chat au rafraîchissement.
- [ ] **[IA]** Optimisation de l'envoi de l'historique (pagination/troncature) pour économiser les tokens envoyés à Gemini.

Bon code à tous ! 💙
