import {
  Component,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  PLATFORM_ID,
  OnInit,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LucideAngularModule } from 'lucide-angular';
import { TipService, Tip } from '../../core/services/tip.service';
import { AuthService } from '../../core/services/auth.service';
import { catchError, startWith, map } from 'rxjs/operators';
import { of } from 'rxjs';

// Astuces statiques par défaut — affichées tant que Firestore n'est pas disponible
// Astuces statiques par défaut — servent de guide pour apprendre à utiliser le site
const DEFAULT_TIPS: Tip[] = [
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

@Component({
  selector: 'app-tips',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="max-w-3xl mx-auto px-6 pt-8 pb-16">

      <!-- En-tête de page -->
      <div class="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-gray-100 dark:border-gray-800/60 pb-6">
        <div>
          <div class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-4">
            <span class="w-6 h-0.5 bg-blue-600 dark:bg-blue-400"></span>
            Communauté
          </div>
          <h1 class="text-4xl font-extrabold text-gray-900 dark:text-white mb-3 leading-tight">
            Astuces de Développeurs
          </h1>
          <p class="text-base text-gray-500 dark:text-gray-400">
            Découvrez les snippets, astuces et bonnes pratiques partagés par la communauté.
          </p>
        </div>

        <div class="shrink-0">
          <a routerLink="/profile" class="btn-primary cursor-pointer">
            <lucide-icon name="message-square" [size]="16"></lucide-icon>
            Partager une astuce
          </a>
        </div>
      </div>

      <!-- Liste des astuces -->
      @if (isLoading()) {
        <!-- Squelette de chargement -->
        <div class="flex flex-col gap-8">
          @for (i of [1,2,3]; track i) {
            <div class="py-10 animate-pulse">
              <div class="h-3 bg-gray-200 dark:bg-gray-800 rounded w-24 mb-4"></div>
              <div class="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-3"></div>
              <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full mb-2"></div>
              <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
            </div>
          }
        </div>
      } @else {
        @if (paginatedTips().length > 0) {
          <div class="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
            @for (tip of paginatedTips(); track tip.id) {
              <article class="py-6 group">

                <!-- Auteur -->
                <div class="flex items-center gap-3 mb-4">
                  <!-- Avatar du créateur avec placeholder -->
                  <div class="relative w-8 h-8 rounded-full overflow-hidden bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shrink-0">
                    <!-- Affiche la lettre en cas de chargement, d'erreur ou d'absence d'avatar -->
                    @if (!tip.authorAvatar || !loadedImages()[tip.id!] || imageErrors()[tip.id!]) {
                      <span class="absolute text-xs">{{ tip.authorName.charAt(0).toUpperCase() }}</span>
                    }
                    
                    @if (tip.authorAvatar && !imageErrors()[tip.id!]) {
                      <img 
                        [src]="tip.authorAvatar" 
                        [alt]="tip.authorName" 
                        referrerpolicy="no-referrer"
                        class="absolute inset-0 w-full h-full object-cover rounded-full transition-opacity duration-300"
                        [class.opacity-0]="!loadedImages()[tip.id!]"
                        [class.opacity-100]="loadedImages()[tip.id!]"
                        (load)="onImageLoad(tip.id!)"
                        (error)="onImageError(tip.id!)"
                      >
                    }
                  </div>
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ tip.authorName }}</span>
                  <span class="text-xs text-gray-400 dark:text-gray-500 ml-2">
                    • {{ formatDate(tip.createdAt) | date:'dd MMM yyyy' }}
                  </span>
                  @if (tip.isEdited) {
                    <span class="ml-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-50/70 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold text-[10px]">
                      Modifié
                    </span>
                  }
                </div>

                <!-- Titre & description -->
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">{{ tip.title }}</h3>
                <p class="text-gray-600 dark:text-gray-400 leading-relaxed mb-5 whitespace-pre-wrap">{{ tip.description }}</p>

                <!-- Bloc de code -->
                @if (tip.codeSnippet) {
                  <div class="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800/80 mb-6">
                    <div class="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-gray-200/5 dark:border-gray-800/20">
                      <span class="text-xs font-mono text-gray-400">{{ tip.language || 'code' }}</span>
                      <button (click)="copyCode(tip.codeSnippet!, tip.id!)" class="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer">
                        {{ copiedId() === tip.id ? '✓ Copié' : 'Copier' }}
                      </button>
                    </div>
                    <div class="overflow-x-auto bg-[#0d1117] p-4">
                      <pre class="font-mono text-sm text-gray-300 leading-relaxed"><code [innerHTML]="getHighlightedCode(tip.codeSnippet!, tip.language!)"></code></pre>
                    </div>
                  </div>
                }

                <!-- Actions -->
                <div class="flex items-center gap-5">
                  <div class="relative">
                    <button
                      (click)="likeTip(tip)"
                      class="flex items-center gap-1.5 text-sm transition-colors cursor-pointer"
                      [class.text-red-500]="isLiked(tip.id!)"
                      [class.text-gray-400]="!isLiked(tip.id!)"
                      [class.hover:text-red-500]="true">
                      <lucide-icon name="heart" [size]="16" [style.fill]="isLiked(tip.id!) ? 'currentColor' : 'none'"></lucide-icon>
                      {{ tip.likes || 0 }}
                    </button>
                    
                    <!-- Tooltip pour les astuces par défaut -->
                    @if (showDefaultTipTooltip() === tip.id) {
                      <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-800 text-white text-xs font-semibold rounded-lg shadow-lg whitespace-nowrap z-10 animate-fade-in border border-gray-800/20">
                        Astuce guide de base (non modifiable)
                      </div>
                    }
                  </div>

                  <button (click)="shareTip(tip)" class="flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer">
                    <lucide-icon name="share-2" [size]="16"></lucide-icon>
                    Partager
                  </button>
                </div>
              </article>
            }
          </div>

          <!-- Contrôles de pagination -->
          @if (totalPages() > 1) {
            <div class="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between">
              <button
                (click)="prevPage()"
                [disabled]="currentPage() === 1"
                class="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 text-sm font-medium cursor-pointer">
                <lucide-icon name="chevron-left" [size]="16"></lucide-icon>
                Précédent
              </button>
              
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">
                Page {{ currentPage() }} sur {{ totalPages() }}
              </span>

              <button
                (click)="nextPage()"
                [disabled]="currentPage() === totalPages()"
                class="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 text-sm font-medium cursor-pointer">
                Suivant
                <lucide-icon name="chevron-right" [size]="16"></lucide-icon>
              </button>
            </div>
          }
        } @else {
          <!-- Aucun résultat -->
          <div class="text-center py-16 px-6 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl animate-fade-in">
            <lucide-icon name="terminal" [size]="48" class="text-gray-300 dark:text-gray-700 mx-auto mb-4"></lucide-icon>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Aucune astuce trouvée</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              Soyez le premier à partager une astuce avec la communauté dans votre onglet Profil !
            </p>
          </div>
        }
      }

    </div>
  `,
})
export class TipsComponent implements OnInit {
  authService = inject(AuthService);
  private tipService = inject(TipService);
  private platformId = inject(PLATFORM_ID);
  private sanitizer = inject(DomSanitizer);

  copiedId = signal<string | null>(null);
  likedTipIds = signal<string[]>([]);
  showDefaultTipTooltip = signal<string | null>(null);
  isLoading = signal<boolean>(true);

  loadedImages = signal<Record<string, boolean>>({});
  imageErrors = signal<Record<string, boolean>>({});

  onImageLoad(tipId: string) {
    this.loadedImages.update(prev => ({ ...prev, [tipId]: true }));
  }

  onImageError(tipId: string) {
    this.imageErrors.update(prev => ({ ...prev, [tipId]: true }));
  }

  // Signaux réactifs pour la pagination client-side (performances idéales)
  allTips = signal<Tip[]>([]);
  currentPage = signal<number>(1);
  pageSize = 5; // Nombre d'astuces à afficher par page

  // Computed signal : renvoie uniquement les astuces de la page courante
  paginatedTips = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.pageSize;
    return this.allTips().slice(startIndex, startIndex + this.pageSize);
  });

  // Computed signal : nombre total de pages
  totalPages = computed(() => Math.ceil(this.allTips().length / this.pageSize));

  // Fusionner les astuces de la base de données et celles par défaut, puis trier par likes et par date
  tips$ = this.tipService.getTips().pipe(
    map((firestoreTips) => {
      // Filtrer les doublons potentiels
      const uniqueFirestore = firestoreTips.filter(ft => !ft.id?.startsWith('default-'));
      const combined = [...DEFAULT_TIPS, ...uniqueFirestore];

      // Trier par Likes (décroissant), puis par Date (décroissant)
      return combined.sort((a, b) => {
        if ((b.likes || 0) !== (a.likes || 0)) {
          return (b.likes || 0) - (a.likes || 0);
        }
        const dateA = this.getTimestamp(a.createdAt);
        const dateB = this.getTimestamp(b.createdAt);
        return dateB - dateA;
      });
    }),
    catchError(() => of(DEFAULT_TIPS.sort((a, b) => (b.likes || 0) - (a.likes || 0))))
  );

  constructor() {
    // Initialiser avec les astuces par défaut pendant le chargement
    this.allTips.set(DEFAULT_TIPS.sort((a, b) => (b.likes || 0) - (a.likes || 0)));

    this.tips$.subscribe((tips) => {
      this.allTips.set(tips);
      this.isLoading.set(false); // Chargement terminé (Firestore a répondu !)
    });
  }

  formatDate(createdAt: any): Date | string {
    if (!createdAt) return new Date();
    if (createdAt.seconds) {
      return new Date(createdAt.seconds * 1000);
    }
    return createdAt;
  }

  getTimestamp(dateVal: any): number {
    if (!dateVal) return 0;
    if (dateVal.seconds) {
      return dateVal.seconds * 1000;
    }
    if (typeof dateVal === 'string' || typeof dateVal === 'number') {
      return new Date(dateVal).getTime();
    }
    if (dateVal instanceof Date) {
      return dateVal.getTime();
    }
    return 0;
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('mdg_liked_tips');
      if (saved) {
        try {
          this.likedTipIds.set(JSON.parse(saved));
        } catch (e) {}
      }
    }
  }

  isLiked(tipId: string): boolean {
    return this.likedTipIds().includes(tipId);
  }

  async likeTip(tip: Tip): Promise<void> {
    if (tip.id?.startsWith('default-')) {
      this.showDefaultTipTooltip.set(tip.id);
      setTimeout(() => this.showDefaultTipTooltip.set(null), 3000);
      return;
    }
    if (!tip.id) return;

    const isAlreadyLiked = this.isLiked(tip.id);
    let newLikes = tip.likes || 0;

    if (isAlreadyLiked) {
      // Dé-like
      newLikes = Math.max(0, newLikes - 1);
      this.likedTipIds.update((ids) => ids.filter((id) => id !== tip.id));
    } else {
      // Like
      newLikes += 1;
      this.likedTipIds.update((ids) => [...ids, tip.id!]);
    }

    // Sauvegarder dans localStorage
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('mdg_liked_tips', JSON.stringify(this.likedTipIds()));
    }

    // Mettre à jour dans Firestore
    await this.tipService.updateTip(tip.id, { likes: newLikes }).catch(() => { });
  }

  shareTip(tip: Tip): void {
    if (navigator.share) {
      navigator.share({
        title: tip.title,
        text: tip.description,
        url: window.location.href,
      }).catch(() => { });
    } else {
      navigator.clipboard.writeText(`${tip.title}\n\n${tip.description}`).then(() => {
        alert('Contenu de l\'astuce copié dans le presse-papiers !');
      });
    }
  }

  copyCode(code: string, id: string): void {
    const formatted = this.formatCodeSnippet(code);
    navigator.clipboard.writeText(formatted).then(() => {
      this.copiedId.set(id);
      setTimeout(() => this.copiedId.set(null), 2000);
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

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
      this.scrollToTop();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1);
      this.scrollToTop();
    }
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
