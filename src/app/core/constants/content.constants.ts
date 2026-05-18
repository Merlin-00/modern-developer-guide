import { GuideSlide, Tip } from "../models/common.model";
//contenu du guide
export const HOME_SLIDES_CONTENT: GuideSlide[] = [
    {
        id: 'intro',
        step: 'Introduction',
        title: 'Guide du Développeur Moderne',
        subtitle: 'De l’achat d’un PC à la mise en production d’un logiciel.',
        content: 'Ce guide interactif est conçu pour vous accompagner pas à pas vers la maîtrise complète du développement moderne. De la sélection de votre première machine de travail jusqu\'à l\'automatisation de votre mise en production sur le Cloud, découvrez un parcours complet structuré en 10 chapitres enrichis de cas pratiques et d\'outils professionnels.',
        imageUrl: 'https://images.openai.com/static-rsc-4/uOGtKCFgyKpFH8HsrE4ufu89Leyl3rsH_MxTGPUSY10ZYX7haKQbHXG6Mzmu3scDCnZEksSWfU7lHmg-nvy91ToGtfycbWavxg92HS8yWuVci-MGyMxFTBAWvujv_K9gX3F7x5X9_erXtA9JS8pKQiKvst5z0MzKWViWanYbKDUBLQ2jd5FUpc5JmC93h_lu?purpose=fullsize',
        details: [
            'Comprendre le métier en 2026',
            'Sélectionner et configurer son PC',
            'Installer sa suite de logiciels',
            'Bases fondamentales du code',
            'Codage productif assisté par l\'IA',
            'APIs, Bases de données et Git',
            'Projet fil rouge de A à Z (Ce site !)',
            'Mise en production automatisée'
        ]
    },
    {
        id: 'job',
        step: 'Chapitre 01',
        title: 'Le Métier de Développeur',
        subtitle: 'Comprendre l\'écosystème et choisir sa spécialité.',
        content: 'Le développement moderne est un écosystème vaste et passionnant. Avant de commencer à programmer, il est crucial d\'avoir une vue d\'ensemble des différentes branches du métier et des compétences requises pour collaborer efficacement en entreprise.',
        details: [
            'Frontend : Créer l\'interface visuelle utilisateur (React, Angular, Vue)',
            'Backend : Concevoir la logique, la sécurité et les bases de données',
            'Mobile : Développer des applications Android & iOS (Flutter, Kotlin)',
            'DevOps : Automatiser l\'infrastructure et les déploiements cloud',
            'IA & Cybersécurité : Concevoir des modèles intelligents et sécurisés',
            'Soft Skills : Communication, gestion du temps et agilité Scrum'
        ]
    },
    {
        id: 'pc',
        step: 'Chapitre 02',
        title: 'Choisir son Ordinateur',
        subtitle: 'Les clés pour acheter le bon outil de travail.',
        content: 'Votre ordinateur est votre outil principal. Un choix inadapté peut freiner considérablement votre apprentissage. Comprenez comment chaque composant influe sur votre rapidité de développement afin de faire le meilleur investissement selon vos besoins.',
        imageUrl: 'https://images.openai.com/static-rsc-4/kKvynqUeCL7OHBaXExERLU6Di0Pj4I3qqZKB9HBTVQEdmfnLyhtGvj7krntdQP8RiHE6v7Ycu3qMfTki_hxDz3quRyfQvNpw5qQXgqAufcVkD_McIcUIJIYEIpNegdgAcB-tIBUAxW_m5u615R_7YzR9onGnbjppGFjCy9A0DDIXbCNFdMSJie1QRF_Pbt0H?purpose=fullsize',
        details: [
            'CPU : Coeur de la machine. Visez Intel Core i5/i7, Ryzen 5/7 ou Apple Silicon',
            'RAM Débutant : 8 Go à 16 Go de mémoire vive pour travailler à l\'aise',
            'RAM Avancée : 16 Go à 32 Go (indispensable pour Docker, IA, Android Studio)',
            'SSD : Stockage ultra-rapide NVMe de 512 Go à 1 To (évitez les disques HDD)',
            'OS Windows : Polyvalent, accessible et idéal pour débuter',
            'OS macOS & Linux : Les chouchous des environnements professionnels Unix'
        ]
    },
    {
        id: 'system',
        step: 'Chapitre 03',
        title: 'Installer son Système',
        subtitle: 'Préparer et sécuriser son poste de travail.',
        content: 'Une machine bien configurée évite 80% des tracas techniques futurs. Apprenez à structurer vos répertoires, à configurer vos sauvegardes, à optimiser les pilotes matériels et à maintenir la sécurité de vos fichiers à un niveau professionnel.',
        imageUrl: 'https://images.openai.com/static-rsc-4/8rgNwJ9scgBCIq4F0kx-RvHrOeyMDJGEQ75nn6e6dovd2VXnX-g9RV41XqRsaSFPrj68WBPw8B7QnP9KYZukciAgT91aXJ4miPA7cxtAki7_up3VFu836WFbmwgWt1ptdpEvPpaBPdtrX7qaLB05fXkedHk_YfDCUJnuWraeTJH9WyK7zHHojg8qPurXTv_O?purpose=fullsize',
        details: [
            'Mises à jour : Maintenir son OS et sa carte graphique (GPU) à jour',
            'Organisation : Créer un dossier racine dédié aux projets (ex: C:/projects/)',
            'Sauvegardes : Outils automatiques intégrés (OneDrive, iCloud, Time Machine)',
            'Terminal : Installer un interpréteur moderne (Git Bash, PowerShell 7)',
            'Drivers & Pilotes : Vérifier le gestionnaire de périphériques',
            'Antivirus : Utiliser des configurations de protection résidentielles légères'
        ]
    },
    {
        id: 'software',
        step: 'Chapitre 04',
        title: 'Logiciels Indispensables',
        subtitle: 'La boîte à outils quotidienne du développeur pro.',
        content: 'Chaque artisan a ses outils. En tant que développeur, vous utiliserez quotidiennement un éditeur de code avancé, un terminal configuré et des utilitaires de test réseau pour concevoir vos programmes de A à Z.',
        details: [
            'Éditeurs : Visual Studio Code (le roi de la flexibilité) ou WebStorm',
            'Terminaux : Windows Terminal (PowerShell) ou Oh My Zsh (Linux/macOS)',
            'Navigateurs : Chrome et Firefox Developer Edition pour inspecter le DOM',
            'Conteneurs : Docker pour encapsuler et cloner des bases de données',
            'API : Postman ou Insomnia pour exécuter et déboguer vos requêtes HTTP',
            'Maquettes : Figma pour lire et extraire les chartes graphiques de l\'UI'
        ],
        codeSnippet: {
            language: 'json',
            code: `# Extensions VS Code recommandées
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "eamodio.gitlens",
    "angular.ng-template"
  ]
}`
        }
    },
    {
        id: 'basics',
        step: 'Chapitre 05',
        title: 'Les Bases du Code',
        subtitle: 'Comprendre le Web et maîtriser les algorithmes.',
        content: 'Avant de créer des designs complexes, il faut maîtriser la plomberie d\'Internet (DNS, HTTP, relations client-serveur) et les structures logiques communes à tous les langages de programmation informatiques.',
        details: [
            'Architecture Web : Routeurs, serveurs web, requêtes HTTP et réponses JSON',
            'Variables & Types : Stocker et typé des données (String, Number, Array)',
            'Logique Conditionnelle : Décider des flux d\'exécution (if, else, switch)',
            'Boucles & Itérations : Répéter des traitements de masse (for, while, map)',
            'Fonctions : Découper le code en modules réutilisables et testables',
            'Bonnes Pratiques : Clean Code, lisibilité, et documentation utile'
        ],
        codeSnippet: {
            language: 'javascript',
            code: `// Exemple d'algorithme simple de calcul de remise
function calculerRemise(prixTotal, codePromo) {
  let reduction = 0;
  
  if (codePromo === 'BIENVENUE') {
    reduction = 0.15; // 15% de réduction
  } else if (codePromo === 'VIP') {
    reduction = 0.30; // 30% de réduction
  }
  
  return prixTotal * (1 - reduction);
}

const prixFinal = calculerRemise(120, 'BIENVENUE');
console.log("Prix avec remise :", prixFinal); // 102`
        }
    },
    {
        id: 'ai',
        step: 'Chapitre 06',
        title: 'Coder avec l\'IA',
        subtitle: 'L\'art du prompting au service du développement.',
        content: 'L\'Intelligence Artificielle est un multiplicateur de vitesse de travail exceptionnel. En tant que développeur moderne, vous devez apprendre à rédiger des invites structurées pour concevoir, déboguer et documenter vos applications.',
        imageUrl: 'https://images.openai.com/static-rsc-4/KSWA6lJlBKDipdJ5_ytM7OIg-3j9UY0M8Y0SsqRauw41G2CaO5gL9ilJVNuPy1W_DvE-p1VoKJIiNNFxh4YuBS-9g-PCtsHIaipFKqnrB-M7x1Sk1cJCBlNuVNOIXIYuHept8vZDkuyqJd65R67dLXaG3QYw_3lpGUsxkQ4STJflxiI27Hk3gtu1je6qhNEG?purpose=fullsize',
        details: [
            'ChatGPT, Gemini & Claude : Vos meilleurs tuteurs pour conceptualiser un algorithme',
            'GitHub Copilot, Antigravity & Cursor : Des éditeurs intelligents qui écrivent à votre place',
            'Prompting Structuré : Indiquez le rôle, le contexte et le format attendu',
            'Résolution de Bugs : Copier l\'erreur de la console pour obtenir un correctif',
            'Refactoring : Demander à l\'IA d\'optimiser la lisibilité ou les performances',
            'Vigilance : Toujours relire et tester le code proposé par l\'IA'
        ],
        codeSnippet: {
            language: 'markdown',
            code: `# Exemple de Prompt de Développeur Moderne
Agis en tant qu'architecte expert Angular 21.
Génère un composant standalone réactif gérant un panier d'achat.
Utilise des Signals pour suivre la quantité totale et le prix calculé.
Applique des classes Tailwind CSS épurées et modernes.`
        }
    },
    {
        id: 'git',
        step: 'Chapitre 07',
        title: 'Git & Collaboration',
        subtitle: 'Sauvegarder son historique et collaborer en équipe.',
        content: 'Git est la clé de voûte de la collaboration technique en entreprise. Il vous permet de voyager dans le temps de votre projet, de proposer des contributions sécurisées et de travailler en équipe via les méthodes Scrum.',
        details: [
            'Versionning : Initialiser un projet avec git init et suivre les versions',
            'Branches : Travailler dans des environnements isolés sans casser la branche main',
            'GitHub / GitLab : Héberger ses dépôts et collaborer via des Pull Requests',
            'Gestion des Conflits : Fusionner proprement son code avec celui de ses collègues',
            'Méthodes Agiles : Comprendre les cycles Scrum, sprints et tickets Jira',
            'Outils d\'équipe : Discord/Slack (communication) et Notion/Jira (organisation)'
        ],
        codeSnippet: {
            language: 'bash',
            code: `# Créer une nouvelle branche de fonctionnalité
git checkout -b feature/chat-minimized

# Ajouter et commiter ses modifications
git add .
git commit -m "feat: ajouter l'option de réduction du chatbot"

# Envoyer le code sur GitHub
git push origin feature/chat-minimized`
        }
    },
    {
        id: 'backend',
        step: 'Chapitre 08',
        title: 'Bases de Données & APIs',
        subtitle: 'Modéliser les données et les transmettre de manière sécurisée.',
        content: 'Pour rendre vos applications dynamiques, vous devez connecter votre frontend à des serveurs d\'API capables de lire et stocker des informations de manière sécurisée et persistance dans des bases de données SQL ou NoSQL.',
        details: [
            'Bases Relationnelles (SQL) : Stockage strict et robuste (MySQL, PostgreSQL)',
            'Bases Document (NoSQL) : Données flexibles en JSON (MongoDB, Firestore)',
            'APIs RESTful : Communiquer via des requêtes HTTP (GET, POST, PUT, DELETE)',
            'JSON : Le format universel d\'échange de données textuelles',
            'Sécurité : Authentification moderne avec tokens JWT et chiffrement HTTPS',
            'Architecture API : Diviser son backend en contrôleurs, modèles et routes'
        ],
        codeSnippet: {
            language: 'javascript',
            code: `// Route Express.js pour récupérer une astuce par son ID
app.get('/api/tips/:id', async (req, res) => {
  try {
    const tip = await Firestore.collection('tips').doc(req.params.id).get();
    if (!tip.exists) {
      return res.status(404).json({ error: 'Astuce introuvable' });
    }
    res.json(tip.data());
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});`
        }
    },
    {
        id: 'project',
        step: 'Chapitre 09',
        title: 'Projet Fil Rouge : Ce Site !',
        subtitle: 'De la maquette au produit final interactif.',
        content: 'Cette plateforme est l\'illustration parfaite de toutes les compétences d\'un développeur moderne. Pour créer "Modern Developer Guide", nous avons assemblé les technologies les plus demandées en entreprise aujourd\'hui :',
        imageUrl: 'https://images.openai.com/static-rsc-4/zDEAwVB6FeTlC1VwgBUHOTwOJm3jAHPx31D0x322EZS6ljFReCHnz4Xx505qwYls4xFyLuW_3B-aQnBwZjkcYjzhvoWnWxNPodTKVgkHTRzOuzwm27n4nRLJ5q6e27rXb_qLGkQToEYa1tq-462-7j2eJF_8XzDNFLefekjREhScTX5xP6CRwGN6pcIoET2n?purpose=fullsize',
        details: [
            'Figma : Création d\'une maquette minimaliste premium, responsive et aérée',
            'Angular 21 : Architecture moderne à base de Standalone Components',
            'Tailwind CSS & Animations GSAP : Un design fluide et des transitions premium',
            'Angular Signals : Suivi dynamique des j\'aime, de la page active et du chatbot',
            'Firestore Firestore : Base NoSQL pour stocker et synchroniser les astuces',
            'Gemini API : Intégration de l\'IA 2.5 Flash pour dialoguer avec notre mentor'
        ]
    },
    {
        id: 'deploy',
        step: 'Chapitre 10',
        title: 'Mise en Production & Cloud',
        subtitle: 'Rendre son travail accessible au monde entier.',
        content: 'Félicitations ! Vous possédez maintenant les compétences pour concevoir, coder, sécuriser et tester vos projets. La dernière étape est le déploiement sur le Cloud, la mise en place de CI/CD et la promotion de votre portfolio.',
        details: [
            'Docker : Créer des images légères pour reproduire son projet partout',
            'Cloud Hosting : Déployer sur Vercel (frontend) et Firebase (données)',
            'CI/CD GitHub Actions : Déploiement automatique à chaque git push',
            'Portfolio : Valoriser ses dépôts open-source sur un site personnel',
            'Carrière : Configurer un profil LinkedIn, créer des propositions Freelance',
            'Apprentissage Continu : Pratiquer la veille technique quotidienne'
        ],
        codeSnippet: {
            language: 'dockerfile',
            code: `# Dockerfile optimisé pour notre guide Angular
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build --configuration=production

FROM nginx:alpine
COPY --from=build /app/dist/modern-developer-guide/browser /usr/share/nginx/html
EXPOSE 80`
        }
    }
];

// Astuces statiques par défaut — affichées tant que Firestore n'est pas disponible
// Astuces statiques par défaut — servent de guide pour apprendre à utiliser le site
export const DEFAULT_TIPS: Tip[] = [
    {
        id: 'default-1',
        title: 'Bienvenue sur Modern Developer Guide (MDG) !',
        description: 'Découvrez notre plateforme d\'apprentissage et de partage pour les développeurs modernes ! Vous êtes ici dans l\'espace communautaire. Lisez le Guide théorique pour acquérir les bases, aimez les astuces de vos confrères ou publiez vos propres snippets !',
        codeSnippet: `# Bienvenue sur MDG !
# 1. Parcourez l'onglet "Le Guide" pour maîtriser les bases d'Angular
# 2. Visitez l'onglet "Profil" pour vous connecter avec votre compte Google
# 3. Publiez des astuces claires et utiles pour aider la communauté !`,
        language: 'bash',
        authorId: 'system',
        authorName: 'MDG Team',
        authorAvatar: '',
        likes: 0,
        createdAt: '2026-05-01T10:00:00Z',
    },
    {
        id: 'default-2',
        title: 'Comment partager une astuce efficace et populaire',
        description: 'Pour que votre astuce soit populaire et reçoive un maximum de likes, donnez-lui un titre descriptif court et expliquez clairement le problème résolu. Ajoutez un snippet de code propre et choisissez le bon langage dans le sélecteur pour activer la coloration syntaxique automatique.',
        codeSnippet: `// Exemple d'astuce propre et structurée
export interface DevTip {
  title: string;       // Titre concis (ex: Centrer en CSS)
  description: string; // Explication claire du concept
  codeSnippet: string; // Bloc de code prêt à l'emploi
  language: string;    // TypeScript, HTML, CSS, Bash...
}`,
        language: 'typescript',
        authorId: 'system',
        authorName: 'MDG Team',
        authorAvatar: '',
        likes: 0,
        createdAt: '2026-05-02T11:00:00Z',
    },
    {
        id: 'default-3',
        title: 'Gérer et modifier vos astuces partagées en un clin d\'œil',
        description: 'Vous avez fait une erreur dans une de vos publications ? Aucun problème ! Rendez-vous sur votre onglet "Profil". En bas de la page, vous retrouverez toutes vos astuces publiées. Cliquez sur l\'icône de crayon (Modifier) pour charger le formulaire, ajuster le contenu, puis cliquez sur "Enregistrer".',
        codeSnippet: `# Comment gérer une astuce :
# 1. Connectez-vous sur votre espace "Profil"
# 2. Repérez l'icône "Crayon" pour modifier en un clic (scroll automatique)
# 3. Utilisez l'icône "Corbeille" pour supprimer définitivement`,
        language: 'bash',
        authorId: 'system',
        authorName: 'MDG Team',
        authorAvatar: '',
        likes: 0,
        createdAt: '2026-05-03T12:00:00Z',
    },
    {
        id: 'default-4',
        title: 'Interagir avec la communauté : Likes et partages',
        description: 'La communauté MDG grandit grâce à vos interactions ! Si vous trouvez une astuce utile, cliquez sur l\'icône de cœur pour lui attribuer un like. Vous pouvez aussi copier le code snippet en un clic avec le bouton "Copier" ou utiliser "Partager" pour envoyer le lien de la page !',
        codeSnippet: `// Comment interagir avec la communauté MDG
function reactToTip(tip) {
  if (tip.isAwesome) {
    likeTip(tip.id); // Ajoute un like instantané
    shareWithFriends(tip); // Partage avec vos collaborateurs
  }
}`,
        language: 'javascript',
        authorId: 'system',
        authorName: 'MDG Team',
        authorAvatar: '',
        likes: 0,
        createdAt: '2026-05-04T13:00:00Z',
    },
];
