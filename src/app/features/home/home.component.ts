import {
  Component,
  signal,
  inject,
  PLATFORM_ID,
  AfterViewInit,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LucideAngularModule } from 'lucide-angular';
import gsap from 'gsap';

interface GuideSlide {
  id: string;
  step: string;
  title: string;
  subtitle: string;
  content: string;
  details?: string[];
  imageUrl?: string;
  codeSnippet?: { language: string; code: string };
}

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, LucideAngularModule],
  styles: [`
    .slide-content {
      opacity: 0;
    }
  `],
  template: `
    <div class="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-[#0f0f0f] transition-colors duration-300">

      <!-- Contenu de la slide active -->
      <div class="max-w-3xl mx-auto px-6 pt-8 pb-16">

        @for (slide of slides; track slide.id; let i = $index) {
          @if (i === currentIndex()) {
            <div class="slide-content">

              <!-- Label étape -->
              <div class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-6">
                <span class="w-6 h-0.5 bg-blue-600 dark:bg-blue-400"></span>
                {{ slide.step }}
              </div>

              <!-- Titre -->
              <h1 class="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
                {{ slide.title }}
              </h1>

              <!-- Sous-titre -->
              <p class="text-lg md:text-xl text-blue-600 dark:text-blue-400 font-medium mb-6">
                {{ slide.subtitle }}
              </p>

              <!-- Contenu principal -->
              <p class="text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed reading-container mb-6">
                {{ slide.content }}
              </p>

              <!-- Image d'illustration si disponible -->
              @if (slide.imageUrl) {
                <div class="my-6 rounded-2xl overflow-hidden shadow-md border border-gray-200/60 dark:border-gray-800/60 bg-white dark:bg-gray-950 flex items-center justify-center p-1">
                  <img 
                    [src]="slide.imageUrl" 
                    alt="Illustration {{ slide.title }}" 
                    referrerpolicy="no-referrer"
                    class="rounded-xl w-full max-h-[300px] object-cover transition-transform duration-500 hover:scale-102"
                  >
                </div>
              }

              <!-- Liste de détails enrichie -->
              @if (slide.details && slide.details.length > 0) {
                <div class="my-6 bg-white dark:bg-gray-950 p-6 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-sm">
                  <h3 class="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2">
                    <span class="w-1.5 h-3 bg-blue-600 dark:bg-blue-400 rounded-sm"></span>
                    Au programme de ce chapitre :
                  </h3>
                  <ul class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    @for (detail of slide.details; track detail) {
                      <li class="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                        <span class="text-blue-600 dark:text-blue-400 mt-1 font-bold">•</span>
                        <span>{{ detail }}</span>
                      </li>
                    }
                  </ul>
                </div>
              }

              <!-- Bloc de code -->
              @if (slide.codeSnippet) {
                <div class="mt-8 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-xl">
                  <div class="flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-b border-gray-700/30">
                    <div class="flex gap-1.5">
                      <span class="w-2.5 h-2.5 rounded-full bg-red-500/70"></span>
                      <span class="w-2.5 h-2.5 rounded-full bg-yellow-500/70"></span>
                      <span class="w-2.5 h-2.5 rounded-full bg-green-500/70"></span>
                    </div>
                    <span class="text-xs font-mono text-gray-400">{{ slide.codeSnippet.language }}</span>
                    <button
                      (click)="copyCode(slide.codeSnippet!.code, i)"
                      class="text-xs text-gray-400 hover:text-white transition-colors font-medium cursor-pointer"
                      aria-label="Copier le code">
                      {{ copiedIndex() === i ? '✓ Copié' : 'Copier' }}
                    </button>
                  </div>
                  <div class="p-5 overflow-x-auto bg-[#0d1117]">
                    <pre class="font-mono text-sm text-gray-300 leading-relaxed"><code [innerHTML]="getHighlightedCode(slide.codeSnippet.code, slide.codeSnippet.language)"></code></pre>
                  </div>
                </div>
              }
            </div>
          }
        }
      
        <!-- Navigation en bas du contenu — inline & sans ombres -->
        <div class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800/60 flex items-center justify-between">
          
          <!-- Indicateurs de dots -->
          <div class="flex flex-wrap gap-1.5 max-w-[70%]">
            @for (slide of slides; track slide.id; let i = $index) {
              <button
                (click)="goToSlide(i)"
                class="rounded-full transition-all duration-300 cursor-pointer"
                [class]="currentIndex() === i
                  ? 'w-6 h-2 bg-blue-600 dark:bg-blue-400'
                  : 'w-2 h-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400'"
                [attr.aria-label]="'Etape ' + (i + 1)">
              </button>
            }
          </div>

          <!-- Boutons de contrôle (Précédent / Suivant) -->
          <div class="flex items-center gap-3 shrink-0">
            <!-- Bouton Précédent -->
            <button
              (click)="prevSlide()"
              [disabled]="currentIndex() === 0"
              class="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Étape précédente">
              <lucide-icon name="chevron-left" [size]="18"></lucide-icon>
            </button>

            <!-- Bouton Suivant -->
            <button
              (click)="nextSlide()"
              [disabled]="currentIndex() === slides.length - 1"
              class="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
              aria-label="Étape suivante">
              <lucide-icon name="chevron-right" [size]="18"></lucide-icon>
            </button>
          </div>

        </div>

      </div>

    </div>
  `,
})
export class HomeComponent implements AfterViewInit, OnInit {
  private platformId = inject(PLATFORM_ID);
  private sanitizer = inject(DomSanitizer);

  currentIndex = signal(0);
  copiedIndex = signal<number | null>(null);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const savedIndex = localStorage.getItem('mdg_home_slide_index');
      if (savedIndex !== null) {
        const index = parseInt(savedIndex, 10);
        if (!isNaN(index) && index >= 0 && index < this.slides.length) {
          this.currentIndex.set(index);
        }
      }
    }
  }

  slides: GuideSlide[] = [
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

  private direction: 'left' | 'right' = 'right';

  ngAfterViewInit(): void {
    this.animateSlide();
  }

  nextSlide(): void {
    if (this.currentIndex() < this.slides.length - 1) {
      this.direction = 'right';
      this.currentIndex.update((i) => i + 1);
      this.saveCurrentIndex();
      this.animateSlide();
      this.scrollToTop();
    }
  }

  prevSlide(): void {
    if (this.currentIndex() > 0) {
      this.direction = 'left';
      this.currentIndex.update((i) => i - 1);
      this.saveCurrentIndex();
      this.animateSlide();
      this.scrollToTop();
    }
  }

  goToSlide(index: number): void {
    this.direction = index > this.currentIndex() ? 'right' : 'left';
    this.currentIndex.set(index);
    this.saveCurrentIndex();
    this.animateSlide();
    this.scrollToTop();
  }

  private saveCurrentIndex(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('mdg_home_slide_index', this.currentIndex().toString());
    }
  }

  private scrollToTop(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  private animateSlide(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    setTimeout(() => {
      const el = document.querySelector('.slide-content');
      if (el) {
        gsap.killTweensOf(el);
        const startX = this.direction === 'right' ? 50 : -50;
        gsap.set(el, { x: startX, opacity: 0 });
        gsap.to(
          el,
          { x: 0, opacity: 1, duration: 0.45, ease: 'power2.out', clearProps: 'transform' }
        );
      }
    }, 25);
  }

  copyCode(code: string, index: number): void {
    const formatted = this.formatCodeSnippet(code);
    navigator.clipboard.writeText(formatted).then(() => {
      this.copiedIndex.set(index);
      setTimeout(() => this.copiedIndex.set(null), 2000);
    });
  }

  formatCodeSnippet(code: string): string {
    if (!code) return '';
    let lines = code.split(/\r?\n/);
    while (lines.length > 0 && lines[0].trim() === '') {
      lines.shift();
    }
    while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
      lines.pop();
    }
    if (lines.length === 0) return '';
    const indents = lines
      .filter(line => line.trim() !== '')
      .map(line => {
        const match = line.match(/^([ \t]*)/);
        return match ? match[1].length : 0;
      });
    const minIndent = indents.length > 0 ? Math.min(...indents) : 0;
    if (minIndent > 0) {
      lines = lines.map(line => (line.trim() === '' ? '' : line.substring(minIndent)));
    }
    return lines.join('\n');
  }

  getHighlightedCode(code: string, language: string): SafeHtml {
    const formatted = this.formatCodeSnippet(code);
    const html = this.highlightCode(formatted, language);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  highlightCode(code: string, language: string): string {
    if (!code) return '';
    let escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    if (!language) return escaped;
    const lang = language.toLowerCase();

    // 1. Extraire les commentaires pour les protéger
    const comments: string[] = [];
    const isHashComment = ['python', 'bash', 'sh', 'shell', 'yaml', 'yml', 'ruby', 'perl', 'dockerfile'].includes(lang);
    const commentRegex = isHashComment
      ? /(#.*)/g
      : /(\/\/.*|\/\*[\s\S]*?\*\/)/g;

    escaped = escaped.replace(commentRegex, (match) => {
      const id = `___COMMENT_PLACEHOLDER_${comments.length}___`;
      comments.push(match);
      return id;
    });

    // 2. Extraire les chaînes pour les protéger
    const strings: string[] = [];
    const stringRegex = /(['"`])(.*?)\1/g;
    escaped = escaped.replace(stringRegex, (match) => {
      const id = `___STRING_PLACEHOLDER_${strings.length}___`;
      strings.push(match);
      return id;
    });

    // 3. Colorer le reste du code
    if (['html', 'xml', 'vue', 'svg'].includes(lang)) {
      escaped = escaped
        .replace(/(&lt;\/?)(\w+)(.*?)(&gt;)/g, (match, p1, p2, p3, p4) => {
          const attrs = p3.replace(/(\b\w+)(=)(['"].*?['"])/g, '<span class="text-amber-400">$1</span>$2<span class="text-emerald-400">$3</span>');
          return `${p1}<span class="text-rose-400 font-semibold">${p2}</span>${attrs}${p4}`;
        });
    } else if (['css', 'scss', 'less'].includes(lang)) {
      escaped = escaped
        .replace(/(\b[-\w]+)(?=\s*:)/g, '<span class="text-sky-400">$1</span>')
        .replace(/(:\s*)([^;]+)(;)/g, '$1<span class="text-emerald-400">$2</span>$3')
        .replace(/([^{]+)(?=\s*\{)/g, '<span class="text-amber-400 font-bold">$1</span>');
    } else {
      const keywords = /\b(const|let|var|function|return|export|import|from|class|interface|extends|implements|new|async|await|if|else|for|while|switch|case|break|try|catch|finally|throw|default|of|in|as|def|fn|pub|impl|struct|enum|type|package|func|go|defer|select|chan|map|range|public|private|protected|static|final|void|int|double|float|char|bool|boolean|string|any|unknown|never|list|dict|tuple|set|print|self|this|null|nil|true|false|and|or|not|elif|lambda|yield|with|except|raise)\b/g;
      const types = /\b(String|Number|Boolean|Object|Array|Promise|Observable|Signal|WritableSignal|Integer|List|Map|Set|Dict|NoneType|Option|Result|Vec|str|num)\b/g;
      const numberRegex = /\b(\d+)\b/g;

      escaped = escaped
        .replace(keywords, '<span class="text-amber-500 font-bold">$1</span>')
        .replace(types, '<span class="text-sky-400">$1</span>');

      // Protéger les spans introduits pour éviter de colorer les chiffres dans les classes CSS (ex: text-amber-500)
      const spans: string[] = [];
      const spanRegex = /(<span[^>]*>|<\/span>)/g;
      escaped = escaped.replace(spanRegex, (match) => {
        const id = `___SPAN_PLACEHOLDER_${spans.length}___`;
        spans.push(match);
        return id;
      });

      escaped = escaped
        .replace(numberRegex, '<span class="text-purple-400">$1</span>')
        .replace(/\b(\w+)(?=\()/g, '<span class="text-blue-400">$1</span>');

      // Restaurer les spans
      spans.forEach((span, index) => {
        const placeholder = `___SPAN_PLACEHOLDER_${index}___`;
        escaped = escaped.replace(placeholder, span);
      });
    }

    // 4. Réinjecter les chaînes colorées
    strings.forEach((str, index) => {
      const placeholder = `___STRING_PLACEHOLDER_${index}___`;
      const highlighted = `<span class="text-emerald-400">${str}</span>`;
      escaped = escaped.replace(placeholder, highlighted);
    });

    // 5. Réinjecter les commentaires colorés
    comments.forEach((com, index) => {
      const placeholder = `___COMMENT_PLACEHOLDER_${index}___`;
      const highlighted = `<span class="text-gray-500 italic">${com}</span>`;
      escaped = escaped.replace(placeholder, highlighted);
    });

    return escaped;
  }
}
