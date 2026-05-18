import {
  Component,
  inject,
  signal,
  input,
  effect,
  untracked,
  computed,
  OnDestroy,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Title, Meta, DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LucideAngularModule } from 'lucide-angular';
import { TipService } from '../../../core/services/firebases/tip.service';
import { AuthService } from '../../../core/services/firebases/auth.service';
import { Tip } from '../../../core/models/common.model';
import { DEFAULT_TIPS } from '../../../core/constants/content.constants';

@Component({
  selector: 'app-tip-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './tip-detail.component.html',
})
export class TipDetailComponent implements OnDestroy {
  // Input signal recevant l'ID depuis le routeur dynamique d'Angular (withComponentInputBinding)
  id = input.required<string>();

  authService = inject(AuthService);
  private tipService = inject(TipService);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private sanitizer = inject(DomSanitizer);

  tip = signal<Tip | null>(null);
  isLoading = signal<boolean>(true);
  notFound = signal<boolean>(false);
  copied = signal<boolean>(false);
  toastMessage = signal<string | null>(null);
  showDefaultTipTooltip = signal<boolean>(false);
  showAuthTooltip = signal<boolean>(false);

  private unsubscriber: (() => void) | null = null;

  loadedImages = signal<Record<string, boolean>>({});
  imageErrors = signal<Record<string, boolean>>({});

  onImageLoad(uid: string) {
    this.loadedImages.update(prev => ({ ...prev, [uid]: true }));
  }

  onImageError(uid: string) {
    this.imageErrors.update(prev => ({ ...prev, [uid]: true }));
  }

  // Pagination pour la liste des likes
  currentPageLikes = signal<number>(1);
  pageSizeLikes = 8;

  paginatedLikes = computed(() => {
    const tipVal = this.tip();
    if (!tipVal || !tipVal.likedByProfiles || !Array.isArray(tipVal.likedByProfiles)) {
      return [];
    }
    const startIndex = (this.currentPageLikes() - 1) * this.pageSizeLikes;
    return tipVal.likedByProfiles.slice(startIndex, startIndex + this.pageSizeLikes);
  });

  totalLikesPages = computed(() => {
    const tipVal = this.tip();
    if (!tipVal || !tipVal.likedByProfiles || !Array.isArray(tipVal.likedByProfiles)) {
      return 1;
    }
    return Math.ceil(tipVal.likedByProfiles.length / this.pageSizeLikes) || 1;
  });

  nextPageLikes(): void {
    if (this.currentPageLikes() < this.totalLikesPages()) {
      this.currentPageLikes.update(p => p + 1);
    }
  }

  prevPageLikes(): void {
    if (this.currentPageLikes() > 1) {
      this.currentPageLikes.update(p => p - 1);
    }
  }

  getMin(a: number, b: number): number {
    return Math.min(a, b);
  }

  constructor() {
    // S'abonner réactivement aux changements de l'input signal id
    effect(() => {
      const tipId = this.id();
      untracked(() => {
        this.loadTip(tipId);
      });
    });
  }

  loadTip(tipId: string) {
    this.isLoading.set(true);
    this.notFound.set(false);
    this.currentPageLikes.set(1);

    if (this.unsubscriber) {
      this.unsubscriber();
      this.unsubscriber = null;
    }

    if (tipId.startsWith('default-')) {
      const foundDefault = DEFAULT_TIPS.find((t) => t.id === tipId);
      if (foundDefault) {
        this.tip.set(foundDefault);
        this.updateSEO(foundDefault);
        this.isLoading.set(false);
      } else {
        this.notFound.set(true);
        this.isLoading.set(false);
      }
    } else {
      this.unsubscriber = this.tipService.listenToTip(tipId, (updatedTip) => {
        if (!updatedTip || updatedTip.isDeleted) {
          this.notFound.set(true);
          this.tip.set(null);
        } else {
          this.tip.set(updatedTip);
          this.updateSEO(updatedTip);
        }
        this.isLoading.set(false);
      });
    }
  }

  updateSEO(tip: Tip) {
    const pageTitle = `${tip.title} - Modern Developer Guide`;
    this.titleService.setTitle(pageTitle);

    this.metaService.updateTag({ name: 'description', content: tip.description });
    this.metaService.updateTag({ property: 'og:title', content: tip.title });
    this.metaService.updateTag({ property: 'og:description', content: tip.description });
    this.metaService.updateTag({ property: 'og:image', content: tip.authorAvatar || '/public/icons/icon-192x192.png' });
    this.metaService.updateTag({ property: 'og:type', content: 'article' });
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
  }

  isLiked(): boolean {
    const currentUserId = this.authService.currentUser()?.uid;
    const tipVal = this.tip();
    if (currentUserId && tipVal && tipVal.likedByProfiles && Array.isArray(tipVal.likedByProfiles)) {
      return tipVal.likedByProfiles.some((p) => p.uid === currentUserId);
    }
    return false;
  }

  async toggleLike(): Promise<void> {
    const tipVal = this.tip();
    if (!tipVal) return;

    if (tipVal.id?.startsWith('default-')) {
      this.showDefaultTipTooltip.set(true);
      setTimeout(() => this.showDefaultTipTooltip.set(false), 3000);
      return;
    }

    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      this.showAuthTooltip.set(true);
      setTimeout(() => this.showAuthTooltip.set(false), 3000);
      return;
    }

    const isAlreadyLiked = this.isLiked();

    await this.tipService.likeTip(tipVal.id!, !isAlreadyLiked, {
      uid: currentUser.uid,
      displayName: currentUser.displayName,
      photoURL: currentUser.photoURL
    }).catch((err) => {
      console.error("Erreur lors de la mise à jour du like :", err);
    });
  }

  shareTip(): void {
    const tipVal = this.tip();
    if (!tipVal) return;

    const shareUrl = window.location.href;
    const shareTitle = tipVal.title;
    const shareText = tipVal.description;

    if (navigator.share) {
      navigator.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl
      }).catch((err) => console.log('Erreur de partage native:', err));
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        this.toastMessage.set('Lien de l\'astuce copié dans le presse-papiers !');
        setTimeout(() => this.toastMessage.set(null), 3000);
      });
    }
  }

  copyCode(): void {
    const tipVal = this.tip();
    if (!tipVal || !tipVal.codeSnippet) return;

    const formatted = this.formatCodeSnippet(tipVal.codeSnippet);
    navigator.clipboard.writeText(formatted).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  formatDate(createdAt: any): Date | string {
    if (!createdAt) return new Date();
    if (createdAt.seconds) {
      return new Date(createdAt.seconds * 1000);
    }
    return createdAt;
  }

  // --- Helpers Coloration Syntaxique ---
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
      .filter((line) => line.trim() !== '')
      .map((line) => {
        const match = line.match(/^([ \t]*)/);
        return match ? match[1].length : 0;
      });
    const minIndent = indents.length > 0 ? Math.min(...indents) : 0;
    if (minIndent > 0) {
      lines = lines.map((line) => (line.trim() === '' ? '' : line.substring(minIndent)));
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

    const comments: string[] = [];
    const isHashComment = ['python', 'bash', 'sh', 'shell', 'yaml', 'yml', 'ruby', 'perl', 'dockerfile'].includes(lang);
    const commentRegex = isHashComment ? /(#.*)/g : /(\/\/.*|\/\*[\s\S]*?\*\/)/g;

    escaped = escaped.replace(commentRegex, (match) => {
      const id = `___COMMENT_PLACEHOLDER_${comments.length}___`;
      comments.push(match);
      return id;
    });

    const strings: string[] = [];
    const stringRegex = /(['"`])(.*?)\1/g;
    escaped = escaped.replace(stringRegex, (match) => {
      const id = `___STRING_PLACEHOLDER_${strings.length}___`;
      strings.push(match);
      return id;
    });

    if (['html', 'xml', 'vue', 'svg'].includes(lang)) {
      escaped = escaped.replace(/(&lt;\/?)(\w+)(.*?)(&gt;)/g, (match, p1, p2, p3, p4) => {
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

      spans.forEach((span, index) => {
        const placeholder = `___SPAN_PLACEHOLDER_${index}___`;
        escaped = escaped.replace(placeholder, span);
      });
    }

    strings.forEach((str, index) => {
      const placeholder = `___STRING_PLACEHOLDER_${index}___`;
      const highlighted = `<span class="text-emerald-400">${str}</span>`;
      escaped = escaped.replace(placeholder, highlighted);
    });

    comments.forEach((com, index) => {
      const placeholder = `___COMMENT_PLACEHOLDER_${index}___`;
      const highlighted = `<span class="text-gray-500 italic">${com}</span>`;
      escaped = escaped.replace(placeholder, highlighted);
    });

    return escaped;
  }

  ngOnDestroy(): void {
    if (this.unsubscriber) {
      this.unsubscriber();
    }
  }
}
