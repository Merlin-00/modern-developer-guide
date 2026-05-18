import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
  PLATFORM_ID,
  OnInit,
  OnDestroy,
  effect,
  untracked
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LucideAngularModule } from 'lucide-angular';
import { TipService } from '../../core/services/firebases/tip.service';
import { AuthService } from '../../core/services/firebases/auth.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Tip } from '../../core/models/common.model';
import { DEFAULT_TIPS } from '../../core/constants/content.constants';


@Component({
  selector: 'app-tips',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './tips.component.html',
})
export class TipsComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  private tipService = inject(TipService);
  private platformId = inject(PLATFORM_ID);
  private sanitizer = inject(DomSanitizer);

  copiedId = signal<string | null>(null);
  likedTipIds = signal<string[]>([]);
  showDefaultTipTooltip = signal<string | null>(null);
  showAuthTooltip = signal<string | null>(null);
  toastMessage = signal<string | null>(null);
  isLoading = signal<boolean>(true);

  private tipSubscriptions: (() => void)[] = [];



  loadedImages = signal<Record<string, boolean>>({});
  imageErrors = signal<Record<string, boolean>>({});

  onImageLoad(tipId: string) {
    this.loadedImages.update(prev => ({ ...prev, [tipId]: true }));
  }

  onImageError(tipId: string) {
    this.imageErrors.update(prev => ({ ...prev, [tipId]: true }));
  }

  // Signaux réactifs pour la pagination serveur-side (performances industrielles)
  currentPage = signal<number>(1);
  pageSize = 5; // Nombre d'astuces à afficher par page
  sortBy = signal<'likes' | 'createdAt'>('likes');
  searchQuery = signal<string>('');
  totalPages = signal<number>(1);
  paginatedTips = signal<Tip[]>([]);

  private cursors: any[] = [];
  private searchSubject = new Subject<string>();

  constructor() {
    effect(() => {
      // S'abonner aux changements de l'utilisateur pour recharger les likes
      const user = this.authService.currentUser();
      untracked(() => {
        this.loadLikedTipsFromLocalStorage();
      });
    });
  }

  ngOnInit() {
    this.loadLikedTipsFromLocalStorage();

    // S'abonner aux changements de recherche debouncés à 300ms
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((query) => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
      this.cursors = [];
      this.loadTips();
    });

    // Chargement initial
    this.loadTips();
  }

  async loadTips() {
    this.isLoading.set(true);
    try {
      const page = this.currentPage();
      const startAfterDoc = page > 1 ? this.cursors[page - 1] : null;

      const result = await this.tipService.getTipsPaginated({
        pageSize: this.pageSize,
        startAfterDoc,
        sortBy: this.sortBy(),
        searchQuery: this.searchQuery()
      });

      let tips = result.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tip));

      const totalDatabaseCount = result.totalCount;
      const totalCount = totalDatabaseCount + (this.searchQuery().trim() ? 0 : DEFAULT_TIPS.length);
      this.totalPages.set(Math.max(1, Math.ceil(totalCount / this.pageSize)));

      // Si nous ne sommes pas en train de faire une recherche, on applique la pagination virtuelle combinée
      if (!this.searchQuery().trim()) {
        const startIndex = (page - 1) * this.pageSize;
        const endIndex = page * this.pageSize;

        const getTimestamp = (dateStr: any): number => {
          if (!dateStr) return 0;
          if (typeof dateStr.toMillis === 'function') return dateStr.toMillis();
          if (dateStr.seconds !== undefined) return dateStr.seconds * 1000;
          return new Date(dateStr).getTime() || 0;
        };

        if (startIndex < totalDatabaseCount) {
          // Cette page contient au moins quelques astuces de la base de données
          const dbTipsOnPage = tips.filter(t => !t.id?.startsWith('default-'));

          // Trier d'abord les astuces de la base de données selon le tri sélectionné
          if (this.sortBy() === 'likes') {
            dbTipsOnPage.sort((a, b) => {
              if ((b.likes || 0) !== (a.likes || 0)) {
                return (b.likes || 0) - (a.likes || 0);
              }
              return getTimestamp(b.createdAt) - getTimestamp(a.createdAt);
            });
          } else {
            dbTipsOnPage.sort((a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt));
          }

          if (endIndex > totalDatabaseCount) {
            // C'est la page de transition : on complète avec les premières astuces par défaut
            const neededDefaultCount = endIndex - totalDatabaseCount;
            const defaultsToAppend = DEFAULT_TIPS.slice(0, neededDefaultCount);
            tips = [...dbTipsOnPage, ...defaultsToAppend];
          } else {
            // La page est entièrement remplie par les astuces de la base de données
            tips = dbTipsOnPage;
          }
        } else {
          // Cette page est entièrement composée d'astuces par défaut
          const defaultStartIndex = startIndex - totalDatabaseCount;
          const defaultEndIndex = endIndex - totalDatabaseCount;
          tips = DEFAULT_TIPS.slice(defaultStartIndex, defaultEndIndex);
        }
      }

      // Stocker le curseur pour la page suivante
      if (result.docs.length > 0) {
        this.cursors[page] = result.docs[result.docs.length - 1];
      }

      // Filtrer les astuces supprimées logiquement
      tips = tips.filter(tip => tip.isDeleted !== true);

      // Nettoyer les écouteurs précédents
      this.tipSubscriptions.forEach((unsub) => unsub());
      this.tipSubscriptions = [];

      this.paginatedTips.set(tips);

      // S'abonner en temps réel aux changements de chaque astuce de la page (excluant les astuces par défaut)
      tips.forEach((tip) => {
        if (tip.id && !tip.id.startsWith('default-')) {
          const unsub = this.tipService.listenToTip(tip.id, (updatedTip) => {
            if (updatedTip.isDeleted === true) {
              // Si l'astuce est supprimée, on la retire de l'affichage en temps réel
              this.paginatedTips.update((all) => all.filter((t) => t.id !== updatedTip.id));
              return;
            }
            this.paginatedTips.update((all) =>
              all.map((t) =>
                t.id === updatedTip.id
                  ? {
                      ...t,
                      likes: updatedTip.likes,
                      likedByProfiles: updatedTip.likedByProfiles,
                      isDeleted: updatedTip.isDeleted
                    }
                  : t
              )
            );
          });
          this.tipSubscriptions.push(unsub);
        }
      });
    } catch (error) {
      console.error("Erreur de chargement des astuces :", error);
    } finally {
      this.isLoading.set(false);
    }
  }

  setSortBy(sort: 'likes' | 'createdAt') {
    if (this.sortBy() !== sort) {
      this.sortBy.set(sort);
      this.currentPage.set(1);
      this.cursors = [];
      this.loadTips();
    }
  }

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
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

  private getStorageKey(): string {
    const user = this.authService.currentUser();
    return user ? `mdg_liked_tips_${user.uid}` : 'mdg_liked_tips_guest';
  }

  ngOnDestroy(): void {
    this.tipSubscriptions.forEach((unsub) => unsub());
  }

  isLiked(tipId: string): boolean {
    const currentUserId = this.authService.currentUser()?.uid;
    if (currentUserId) {
      // Rechercher le tip dans nos astuces paginées pour lire son état en temps réel
      const tip = this.paginatedTips().find(t => t.id === tipId);
      if (tip) {
        return !!(tip.likedByProfiles && Array.isArray(tip.likedByProfiles) && tip.likedByProfiles.some(p => p.uid === currentUserId));
      }
    }
    return this.likedTipIds().includes(tipId);
  }

  async likeTip(tip: Tip): Promise<void> {
    if (tip.id?.startsWith('default-')) {
      this.showDefaultTipTooltip.set(tip.id);
      setTimeout(() => this.showDefaultTipTooltip.set(null), 3000);
      return;
    }
    if (!tip.id) return;

    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      // Afficher le tooltip invitant l'utilisateur sans compte à se connecter/créer un compte
      this.showAuthTooltip.set(tip.id);
      setTimeout(() => this.showAuthTooltip.set(null), 3000);
      return;
    }

    const currentUserId = currentUser.uid;
    const isAlreadyLiked = this.isLiked(tip.id);

    // 1. Mise à jour optimiste et réactive locale
    this.likedTipIds.update((ids) =>
      isAlreadyLiked ? ids.filter((id) => id !== tip.id) : [...ids, tip.id!]
    );

    // 2. Mise à jour optimiste et réactive de likedByProfiles et du count de likes dans paginatedTips
    this.paginatedTips.update((all) =>
      all.map((t) => {
        if (t.id === tip.id) {
          let updatedLikedByProfiles = t.likedByProfiles ? [...t.likedByProfiles] : [];
          if (currentUser) {
            if (isAlreadyLiked) {
              updatedLikedByProfiles = updatedLikedByProfiles.filter(p => p.uid !== currentUserId);
            } else {
              if (!updatedLikedByProfiles.some(p => p.uid === currentUserId)) {
                updatedLikedByProfiles.push({
                  uid: currentUser.uid,
                  displayName: currentUser.displayName || 'Anonyme',
                  photoURL: currentUser.photoURL || ''
                });
              }
            }
          }
          return {
            ...t,
            likes: Math.max(0, (t.likes || 0) + (isAlreadyLiked ? -1 : 1)),
            likedByProfiles: updatedLikedByProfiles
          };
        }
        return t;
      })
    );

    // 3. Sauvegarder dans localStorage sous la clé spécifique à l'utilisateur
    if (isPlatformBrowser(this.platformId)) {
      const key = this.getStorageKey();
      localStorage.setItem(key, JSON.stringify(this.likedTipIds()));
    }

    // 4. Sauvegarde concurrente-safe sur Firestore
    await this.tipService.likeTip(tip.id, !isAlreadyLiked, {
      uid: currentUser.uid,
      displayName: currentUser.displayName,
      photoURL: currentUser.photoURL
    }).catch(() => {
      // Rollback en cas d'échec
      this.likedTipIds.update((ids) =>
        isAlreadyLiked ? [...ids, tip.id!] : ids.filter((id) => id !== tip.id)
      );
      this.paginatedTips.update((all) =>
        all.map((t) => t.id === tip.id ? { ...t, likes: tip.likes, likedByProfiles: tip.likedByProfiles } : t)
      );
    });
  }

  private loadLikedTipsFromLocalStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const key = this.getStorageKey();
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          this.likedTipIds.set(JSON.parse(saved));
        } catch (e) {
          this.likedTipIds.set([]);
        }
      } else {
        this.likedTipIds.set([]);
      }
    }
  }

  shareTip(tip: Tip): void {
    const tipUrl = `${window.location.origin}/tips/${tip.id}`;
    if (navigator.share) {
      navigator.share({
        title: tip.title,
        text: tip.description,
        url: tipUrl,
      }).catch(() => { });
    } else {
      navigator.clipboard.writeText(tipUrl).then(() => {
        this.toastMessage.set('Lien de l\'astuce copié dans le presse-papiers !');
        setTimeout(() => this.toastMessage.set(null), 3000);
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



  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
      this.loadTips();
      this.scrollToTop();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1);
      this.loadTips();
      this.scrollToTop();
    }
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
