import { Component, ElementRef, ViewChildren, QueryList, AfterViewInit, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { LucideAngularModule, ChevronRight, ChevronLeft, CheckCircle, Terminal } from 'lucide-angular';
import gsap from 'gsap';

interface GuideSlide {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  codeSnippet?: {
    language: string;
    code: string;
  };
  icon: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-gray-50 dark:bg-[#121212] flex items-center justify-center">
      
      <!-- Progress Bar -->
      <div class="absolute top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-800 z-10">
        <div 
          class="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300 ease-out"
          [style.width.%]="((currentSlideIndex() + 1) / slides.length) * 100">
        </div>
      </div>

      <!-- Main Container -->
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl w-full py-12">
        <div class="relative">
          
          <!-- Slides Wrapper -->
          <div class="overflow-hidden rounded-3xl bg-white dark:bg-gray-900 shadow-xl ring-1 ring-gray-900/5 dark:ring-white/10 min-h-[500px] flex">
            
            <div #slideContainer class="flex w-full transition-transform duration-500 ease-in-out">
              @for (slide of slides; track slide.id; let i = $index) {
                <div class="w-full flex-shrink-0 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                  
                  <div class="max-w-3xl mx-auto w-full">
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-sm font-medium mb-6">
                      <lucide-icon [name]="slide.icon" [size]="16"></lucide-icon>
                      Étape {{ i + 1 }} sur {{ slides.length }}
                    </div>
                    
                    <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
                      {{ slide.title }}
                    </h1>
                    
                    <h2 class="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 font-medium">
                      {{ slide.subtitle }}
                    </h2>
                    
                    <div class="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 reading-container mb-10 text-lg leading-relaxed">
                      {{ slide.content }}
                    </div>

                    @if (slide.codeSnippet) {
                      <div class="relative group mt-8 rounded-xl overflow-hidden bg-[#0d1117] border border-gray-800 shadow-2xl">
                        <div class="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-gray-800">
                          <span class="text-xs font-mono text-gray-400">{{ slide.codeSnippet.language }}</span>
                          <button (click)="copyCode(slide.codeSnippet.code, i)" class="text-gray-400 hover:text-white transition-colors p-1" aria-label="Copier le code">
                            @if (copiedIndex() === i) {
                              <lucide-icon name="check-circle" [size]="16" class="text-green-500"></lucide-icon>
                            } @else {
                              <span class="text-xs font-medium">Copier</span>
                            }
                          </button>
                        </div>
                        <div class="p-4 overflow-x-auto">
                          <pre class="font-mono text-sm text-gray-300 leading-relaxed"><code>{{ slide.codeSnippet.code }}</code></pre>
                        </div>
                      </div>
                    }
                  </div>

                </div>
              }
            </div>
            
          </div>

          <!-- Navigation Controls -->
          <div class="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-6 lg:-left-12">
            <button 
              (click)="prevSlide()" 
              [disabled]="currentSlideIndex() === 0"
              class="p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg text-gray-900 dark:text-white hover:scale-110 disabled:opacity-50 disabled:hover:scale-100 transition-all border border-gray-100 dark:border-gray-700">
              <lucide-icon name="chevron-left" [size]="24"></lucide-icon>
            </button>
          </div>
          
          <div class="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-6 lg:-right-12">
            <button 
              (click)="nextSlide()" 
              [disabled]="currentSlideIndex() === slides.length - 1"
              class="p-3 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:scale-110 disabled:opacity-50 disabled:hover:scale-100 transition-all">
              <lucide-icon name="chevron-right" [size]="24"></lucide-icon>
            </button>
          </div>

        </div>
        
        <!-- Dots indicator -->
        <div class="flex justify-center gap-2 mt-8">
          @for (slide of slides; track slide.id; let i = $index) {
            <button 
              (click)="goToSlide(i)"
              class="w-2.5 h-2.5 rounded-full transition-all duration-300"
              [class.bg-blue-600]="currentSlideIndex() === i"
              [class.w-8]="currentSlideIndex() === i"
              [class.bg-gray-300]="currentSlideIndex() !== i"
              [class.dark:bg-blue-500]="currentSlideIndex() === i"
              [class.dark:bg-gray-700]="currentSlideIndex() !== i"
              [attr.aria-label]="'Aller à la diapositive ' + (i + 1)">
            </button>
          }
        </div>
        
      </div>
    </div>
  `
})
export class HomeComponent implements AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  
  readonly ChevronRight = ChevronRight;
  readonly ChevronLeft = ChevronLeft;
  readonly CheckCircle = CheckCircle;
  readonly Terminal = Terminal;

  currentSlideIndex = signal(0);
  copiedIndex = signal<number | null>(null);

  slides: GuideSlide[] = [
    {
      id: 'intro',
      title: 'Devenir un Développeur Moderne',
      subtitle: 'Bienvenue dans le guide interactif ultime.',
      content: "L'écosystème du développement web évolue à une vitesse fulgurante. Ce guide est conçu pour vous accompagner pas à pas vers la maîtrise des outils modernes. Fini les tutoriels dépassés, ici on se concentre sur ce qui est utilisé en entreprise aujourd'hui : TypeScript, les frameworks modernes, l'IA et les bonnes pratiques d'architecture.",
      icon: 'terminal'
    },
    {
      id: 'tools',
      title: 'Préparer son Environnement',
      subtitle: 'Les fondations d\'un bon développeur',
      content: "Un artisan a besoin de bons outils. Pour commencer, vous devez installer Node.js (qui permet d'exécuter du JavaScript en dehors du navigateur) et Git (pour gérer les versions de votre code). Ensuite, configurez un éditeur de code moderne comme VS Code avec les bonnes extensions (Prettier, ESLint).",
      codeSnippet: {
        language: 'bash',
        code: '# Installer Angular CLI globalement\nnpm install -g @angular/cli\n\n# Vérifier l\'installation\nng version'
      },
      icon: 'terminal'
    },
    {
      id: 'framework',
      title: 'Adopter un Framework Moderne',
      subtitle: 'Pourquoi Angular avec Standalone Components ?',
      content: "Les frameworks modernes permettent de créer des applications robustes et maintenables. Angular a récemment introduit les 'Standalone Components' et les 'Signals', rendant l'expérience de développement beaucoup plus légère, rapide et intuitive. C'est le standard de l'industrie pour les applications complexes.",
      codeSnippet: {
        language: 'typescript',
        code: `import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-counter',
  standalone: true,
  template: \`
    <button (click)="count.update(c => c + 1)">
      Compteur : {{ count() }}
    </button>
  \`
})
export class CounterComponent {
  count = signal(0);
}`
      },
      icon: 'terminal'
    }
  ];

  @ViewChildren('slideContainer') slideContainer!: QueryList<ElementRef>;

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.animateSlideTransition(0);
    }
  }

  nextSlide() {
    if (this.currentSlideIndex() < this.slides.length - 1) {
      this.currentSlideIndex.update(i => i + 1);
      this.animateSlideTransition(this.currentSlideIndex());
    }
  }

  prevSlide() {
    if (this.currentSlideIndex() > 0) {
      this.currentSlideIndex.update(i => i - 1);
      this.animateSlideTransition(this.currentSlideIndex());
    }
  }

  goToSlide(index: number) {
    this.currentSlideIndex.set(index);
    this.animateSlideTransition(index);
  }

  private animateSlideTransition(index: number) {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const container = document.querySelector('.flex.w-full.transition-transform') as HTMLElement;
    if (container) {
      container.style.transform = `translateX(-${index * 100}%)`;
      
      // Optional GSAP animation for content inside the active slide
      gsap.fromTo(
        container.children[index].querySelectorAll('h1, h2, .prose, .group'),
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out', clearProps: 'all' }
      );
    }
  }

  copyCode(code: string, index: number) {
    navigator.clipboard.writeText(code).then(() => {
      this.copiedIndex.set(index);
      setTimeout(() => this.copiedIndex.set(null), 2000);
    });
  }
}
