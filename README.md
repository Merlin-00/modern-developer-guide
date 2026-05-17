# Modern Developer Guide 🚀

Bienvenue dans le dépôt du **Modern Developer Guide**. Ce projet open-source a pour vocation d'accompagner les développeurs débutants vers la maîtrise des outils modernes à travers une plateforme web interactive, minimaliste et très performante.

## 🎯 Présentation du Projet
Le **Modern Developer Guide** n'est pas qu'un simple tutoriel. C'est une plateforme éducative qui regroupe :
- 📖 **Un guide interactif** sous forme de slides pour apprendre les bases (Terminal, Git, Frameworks).
- 💡 **Une communauté d'astuces** permettant de partager des snippets et des bonnes pratiques.
- 🤖 **Un Chatbot IA** alimenté par Google Gemini pour répondre à vos questions techniques H24.

L'interface s'inspire des produits modernes tels que Notion, Vercel, et Google Docs, pour garantir une expérience de lecture optimale et agréable.

---

## 🛠 Stack Technique
Nous utilisons les technologies les plus modernes du web :
- **Framework Frontend :** Angular (v20+) avec les Standalone Components et les Signals (plus besoin de RxJS complexe pour le state local).
- **Styles :** Tailwind CSS (v4) pour un design rapide, responsive et modulaire, couplé avec Angular Material (léger).
- **Backend-as-a-Service :** Firebase (Authentification Google, Base de données Firestore).
- **Intelligence Artificielle :** Google Gemini API.
- **Animations :** GSAP (GreenSock) et les transitions natives Tailwind.

---

## 📁 Architecture du Projet
L'architecture a été pensée pour être propre, scalable et facilement maintenable :

```text
src/app/
├── core/                  # Cœur de l'application (Services globaux, Auth, Thème, IA)
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── ia-chatbot.service.ts
│   │   ├── theme.service.ts
│   │   └── tip.service.ts
├── shared/                # Composants réutilisables (Navbar, Footer, Boutons)
│   └── ui/
└── features/              # Fonctionnalités principales (Modules métier)
    ├── home/              # Guide interactif (carrousel GSAP)
    ├── tips/              # Mur d'astuces communautaires
    └── chatbot/           # Fenêtre modale du Chatbot IA
```

---

## 🚀 Installation & Lancement Local

Pour contribuer ou lancer le projet sur votre machine, suivez ces étapes :

### 1. Prérequis
- Node.js installé (v18+)
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

### 4. Configuration Firebase & API (Clés secrètes)
Pour que la base de données et le Chatbot fonctionnent, vous devez configurer `src/environments/environment.development.ts` :
1. Créez un projet sur la [Console Firebase](https://console.firebase.google.com).
2. Activez l'authentification Google et Firestore.
3. Allez sur [Google AI Studio](https://aistudio.google.com/) pour récupérer une clé API Gemini.
4. Insérez vos clés dans l'objet `environment`.

### 5. Lancer le serveur de développement
```bash
ng serve
```
Ouvrez votre navigateur sur `http://localhost:4200/`.

---

## ☁️ Déploiement sur Vercel
Ce projet est optimisé pour être déployé très facilement sur Vercel.
1. Connectez-vous sur [Vercel](https://vercel.com/).
2. Importez ce dépôt GitHub.
3. Configurez les variables d'environnement si nécessaire.
4. Cliquez sur **Deploy**. Angular sera compilé automatiquement et mis en ligne.

---

## 🤝 Contribution & Conventions
Nous accueillons toutes les contributions, même (et surtout !) celles des débutants.
- **TypeScript Strict :** Pas de type `any`. Utilisez toujours des interfaces explicites.
- **Signals :** Utilisez toujours `signal()` au lieu des anciens comportements asynchrones dans les composants.
- **Tailwind :** Utilisez les classes globales définies dans `styles.css` (comme `.btn-primary`) pour éviter la répétition de classes.

**Comment contribuer :**
1. Forkez le projet.
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/ma-fonctionnalite`).
3. Codez, testez, puis commitez avec un message clair.
4. Ouvrez une Pull Request.

---

## 🗺 Roadmap Future
- [ ] Ajout d'un système de commentaires sous les astuces.
- [ ] Profil utilisateur complet avec les badges d'apprentissage.
- [ ] Outil de quiz interactif pour tester ses connaissances.
- [ ] Support multilingue (i18n).

Bon code à tous ! 💙
