import {
  Component,
  signal,
  inject,
  PLATFORM_ID,
  AfterViewInit,
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
    <div class="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-[#0f0f0f]">

      <!-- Contenu de la slide active -->
      <div class="max-w-3xl mx-auto px-6 pt-8 pb-16">

        @for (slide of slides; track slide.id; let i = $index) {
          @if (i === currentIndex()) {
            <div class="slide-content">

              <!-- Label étape -->
              <div class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-8">
                <span class="w-6 h-0.5 bg-blue-600 dark:bg-blue-400"></span>
                {{ slide.step }}
              </div>

              <!-- Titre -->
              <h1 class="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
                {{ slide.title }}
              </h1>

              <!-- Sous-titre -->
              <p class="text-xl text-blue-600 dark:text-blue-400 font-medium mb-8">
                {{ slide.subtitle }}
              </p>

              <!-- Contenu -->
              <p class="text-lg text-gray-600 dark:text-gray-400 leading-relaxed reading-container">
                {{ slide.content }}
              </p>

              <!-- Bloc de code -->
              @if (slide.codeSnippet) {
                <div class="mt-10 rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
                  <div class="flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-b border-gray-700/50">
                    <div class="flex gap-1.5">
                      <span class="w-3 h-3 rounded-full bg-red-500/70"></span>
                      <span class="w-3 h-3 rounded-full bg-yellow-500/70"></span>
                      <span class="w-3 h-3 rounded-full bg-green-500/70"></span>
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
        <div class="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between">
          
          <!-- Indicateurs de dots -->
          <div class="flex gap-1.5">
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
          <div class="flex items-center gap-3">
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
export class HomeComponent implements AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  private sanitizer = inject(DomSanitizer);

  currentIndex = signal(0);
  copiedIndex = signal<number | null>(null);

  slides: GuideSlide[] = [
    {
      id: 'intro',
      step: 'Introduction',
      title: 'Devenir un Développeur Moderne',
      subtitle: 'Le guide interactif ultime pour 2025.',
      content:
        "L'écosystème du développement web évolue à une vitesse fulgurante. Ce guide est conçu pour vous accompagner pas à pas vers la maîtrise des outils modernes : TypeScript, les frameworks, l'IA, le déploiement et les bonnes pratiques d'architecture. Fini les tutoriels dépassés — ici on se concentre sur ce qui est réellement utilisé en entreprise aujourd'hui.",
    },
    {
      id: 'tools',
      step: 'Étape 01 — Environnement',
      title: 'Préparer son Poste de Travail',
      subtitle: 'Les bons outils font les bons développeurs.',
      content:
        "Avant d'écrire une seule ligne de code, il vous faut un environnement solide. Node.js pour exécuter JavaScript côté serveur, Git pour versionner votre code, et VS Code comme éditeur avec les bonnes extensions. Un bon setup évite 80% des problèmes avant même qu'ils apparaissent.",
      codeSnippet: {
        language: 'bash',
        code: `# Vérifier Node.js (LTS recommandé)
node --version  # v22.x ou supérieur

# Installer Angular CLI globalement
npm install -g @angular/cli

# Créer un nouveau projet Angular
ng new mon-projet --style tailwind

# Lancer le serveur de développement
cd mon-projet && ng serve`,
      },
    },
    {
      id: 'framework',
      step: 'Étape 02 — Framework',
      title: 'Angular avec les Standalone Components',
      subtitle: 'La révolution des Signals et du Zoneless.',
      content:
        "Angular v20+ a radicalement simplifié son architecture : fini les NgModules complexes. Les Standalone Components sont légers, auto-suffisants et faciles à tester. Combinés aux Signals (qui remplacent RxJS pour la gestion d'état local), ils offrent une expérience de développement ultra moderne et des performances remarquables.",
      codeSnippet: {
        language: 'typescript',
        code: `import { Component, signal, computed } from '@angular/core';

// Composant standalone minimal — pas de NgModule nécessaire
@Component({
  selector: 'app-counter',
  standalone: true,
  template: \`
    <div class="flex gap-4 items-center">
      <button (click)="count.update(c => c - 1)">-</button>
      <span class="font-bold text-2xl">{{ count() }}</span>
      <button (click)="count.update(c => c + 1)">+</button>
    </div>
    <p>Double : {{ double() }}</p>
  \`
})
export class CounterComponent {
  // Signal : source de vérité réactive
  count = signal(0);

  // Computed : valeur dérivée, recalculée automatiquement
  double = computed(() => this.count() * 2);
}`,
      },
    },
    {
      id: 'git',
      step: 'Étape 03 — Git & GitHub',
      title: 'Versionner son Code comme un Pro',
      subtitle: 'Git est indispensable, pas optionnel.',
      content:
        "Git est la compétence n°1 qui sépare les débutants des professionnels. Il vous permet de travailler en équipe, de revenir en arrière en cas d'erreur, et de collaborer sur des projets open-source. La maîtrise des branches, des commits et des Pull Requests ouvre la porte à tous les projets du monde.",
      codeSnippet: {
        language: 'bash',
        code: `# Workflow quotidien d'un développeur
git status              # Voir les fichiers modifiés
git add .               # Préparer les changements
git commit -m "feat: ajouter le composant navbar"

# Travailler sur une nouvelle fonctionnalité
git checkout -b feature/chatbot-integration
# ... travail, commits ...
git push origin feature/chatbot-integration

# Créer une Pull Request sur GitHub
# (via l'interface web ou GitHub CLI)
gh pr create --title "Add chatbot" --body "Closes #42"`,
      },
    },
    {
      id: 'ai',
      step: 'Étape 04 — IA pour Développeurs',
      title: "L'IA, votre Co-Pilote de Code",
      subtitle: "Travailler avec l'IA, pas contre elle.",
      content:
        "En 2025, un développeur qui n'utilise pas l'IA travaille deux fois plus lentement. GitHub Copilot, Gemini, et Claude sont vos meilleurs alliés pour générer du code boilerplate, déboguer, rédiger des tests, et comprendre des concepts complexes. L'art est de savoir poser les bonnes questions et de vérifier le code généré.",
    },
    {
      id: 'deploy',
      step: 'Étape 05 — Déploiement',
      title: 'Mettre son Application en Production',
      subtitle: 'De localhost à internet en moins de 5 minutes.',
      content:
        "Vercel et Netlify ont révolutionné le déploiement web : en connectant votre dépôt GitHub, chaque push sur main déploie automatiquement votre application. Firebase Hosting est idéal pour les projets Angular avec backend Firebase. Vos utilisateurs peuvent accéder à votre travail en quelques secondes après votre commit.",
      codeSnippet: {
        language: 'bash',
        code: `# Déployer sur Vercel (zéro configuration)
npm install -g vercel
vercel deploy

# Ou directement via GitHub
# 1. Connectez vercel.com à votre dépôt GitHub
# 2. Chaque push = nouveau déploiement automatique
# 3. Chaque PR = prévisualisation unique (preview URL)

# Build de production Angular
ng build --configuration production
# Output dans dist/votre-projet/browser/`,
      },
    },
  ];

  private direction: 'left' | 'right' = 'right';

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.animateSlide();
    }
  }

  nextSlide(): void {
    if (this.currentIndex() < this.slides.length - 1) {
      this.direction = 'right';
      this.currentIndex.update((i) => i + 1);
      this.animateSlide();
      this.scrollToTop();
    }
  }

  prevSlide(): void {
    if (this.currentIndex() > 0) {
      this.direction = 'left';
      this.currentIndex.update((i) => i - 1);
      this.animateSlide();
      this.scrollToTop();
    }
  }

  goToSlide(index: number): void {
    this.direction = index > this.currentIndex() ? 'right' : 'left';
    this.currentIndex.set(index);
    this.animateSlide();
    this.scrollToTop();
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
    const stringRegex = /(['"`])(.*?)\1/g;
    const numberRegex = /\b(\d+)\b/g;
    const isHashComment = ['python', 'bash', 'sh', 'shell', 'yaml', 'yml', 'ruby', 'perl', 'dockerfile'].includes(lang);
    const commentRegex = isHashComment 
      ? /(#.*)/g 
      : /(\/\/.*|\/\*[\s\S]*?\*\/)/g;

    if (['html', 'xml', 'vue', 'svg'].includes(lang)) {
      return escaped
        .replace(/(&lt;\/?)(\w+)(.*?)(&gt;)/g, (match, p1, p2, p3, p4) => {
          const attrs = p3.replace(/(\b\w+)(=)(['"].*?['"])/g, '<span class="text-amber-400">$1</span>$2<span class="text-emerald-400">$3</span>');
          return `${p1}<span class="text-rose-400 font-semibold">${p2}</span>${attrs}${p4}`;
        })
        .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="text-gray-500 italic">$1</span>');
    }

    if (lang === 'css' || lang === 'scss' || lang === 'less') {
      return escaped
        .replace(/(\b[-\w]+)(?=\s*:)/g, '<span class="text-sky-400">$1</span>')
        .replace(/(:\s*)([^;]+)(;)/g, '$1<span class="text-emerald-400">$2</span>$3')
        .replace(/([^{]+)(?=\s*\{)/g, '<span class="text-amber-400 font-bold">$1</span>')
        .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-gray-500 italic">$1</span>');
    }

    const keywords = /\b(const|let|var|function|return|export|import|from|class|interface|extends|implements|new|async|await|if|else|for|while|switch|case|break|try|catch|finally|throw|default|of|in|as|def|fn|pub|impl|struct|enum|type|package|import|func|go|defer|select|chan|map|range|public|private|protected|static|final|void|int|double|float|char|bool|boolean|string|any|unknown|never|list|dict|tuple|set|import|from|print|self|this|null|nil|true|false|and|or|not|elif|lambda|yield|with|as|try|except|raise)\b/g;
    const types = /\b(String|Number|Boolean|Object|Array|Promise|Observable|Signal|WritableSignal|Integer|List|Map|Set|Dict|NoneType|Option|Result|Vec|str|num)\b/g;

    return escaped
      .replace(keywords, '<span class="text-amber-500 font-bold">$1</span>')
      .replace(types, '<span class="text-sky-400">$1</span>')
      .replace(stringRegex, '<span class="text-emerald-400">$1$2$1</span>')
      .replace(numberRegex, '<span class="text-purple-400">$1</span>')
      .replace(commentRegex, '<span class="text-gray-500 italic">$1</span>')
      .replace(/\b(\w+)(?=\()/g, '<span class="text-blue-400">$1</span>');
  }
}
