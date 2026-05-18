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
import { DomSanitizer, SafeHtml, Title, Meta } from '@angular/platform-browser';
import { LucideAngularModule } from 'lucide-angular';
import gsap from 'gsap';
import { HOME_SLIDES_CONTENT } from '../../core/constants/content.constants';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, LucideAngularModule],
  styles: [`
    .slide-content {
      opacity: 0;
    }
  `],
  templateUrl: `./home.component.html`,
})
export class HomeComponent implements AfterViewInit, OnInit {
  private platformId = inject(PLATFORM_ID);
  private sanitizer = inject(DomSanitizer);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  slides = HOME_SLIDES_CONTENT;

  currentIndex = signal(0);
  copiedIndex = signal<number | null>(null);

  ngOnInit(): void {
    // SEO
    this.titleService.setTitle('Modern Developer Guide — Apprendre, Partager, Grandir');
    this.metaService.updateTag({ name: 'description', content: 'Découvrez le guide des développeurs modernes : astuces, snippets et bonnes pratiques partagés par la communauté.' });
    this.metaService.updateTag({ property: 'og:title', content: 'Modern Developer Guide — Apprendre, Partager, Grandir' });
    this.metaService.updateTag({ property: 'og:description', content: 'Découvrez le guide des développeurs modernes : astuces, snippets et bonnes pratiques partagés par la communauté.' });
    this.metaService.updateTag({ property: 'og:url', content: 'https://modern-developer-guide.vercel.app/' });
    this.metaService.updateTag({ name: 'twitter:title', content: 'Modern Developer Guide — Apprendre, Partager, Grandir' });
    this.metaService.updateTag({ name: 'twitter:description', content: 'Découvrez le guide des développeurs modernes : astuces, snippets et bonnes pratiques partagés par la communauté.' });

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
