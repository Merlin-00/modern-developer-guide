import {
  Component,
  ElementRef,
  ViewChild,
  inject,
  signal,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { IaChatbotService } from '../../core/services/ia-chatbot.service';
import { ChatMessage } from '../../core/models/common.model';

/**
 * ChatbotComponent — Widget flottant d'assistance IA.
 * Accessible via un bouton fixe en bas à droite.
 * Connecté à Google Gemini via IaChatbotService.
 */
@Component({
  selector: 'app-chatbot',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <!-- Bouton d'ouverture flottant -->
    @if (!isOpen()) {
      @if (isMinimized()) {
        <!-- Version réduite (icône "inférieure" < très discrète) -->
        <button
          (click)="isMinimized.set(false)"
          class="fixed right-0 top-1/2 -translate-y-1/2 w-4 h-12 bg-blue-600/10 hover:bg-blue-600/80 text-blue-600/50 hover:text-white rounded-l-md flex items-center justify-center transition-all duration-300 hover:w-6 z-50 focus:outline-none cursor-pointer group"
          title="Développer l'assistant IA"
          aria-label="Développer l'assistant IA">
          <lucide-icon name="chevron-left" [size]="12" class="transition-transform group-hover:scale-110"></lucide-icon>
        </button>
      } @else {
        <!-- Version standard (sans shadow, avec bouton de fermeture discret) -->
        <div class="fixed right-0 top-1/2 -translate-y-1/2 flex items-center z-50 group">
          <!-- Bouton principal -->
          <button
            (click)="open()"
            class="w-12 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-l-2xl flex items-center justify-center transition-all duration-300 hover:w-14 hover:scale-102 focus:outline-none focus:ring-4 focus:ring-blue-500/30 cursor-pointer"
            aria-label="Ouvrir le Chatbot IA">
            <lucide-icon name="message-circle" [size]="24"></lucide-icon>
          </button>
          
          <!-- Bouton de réduction discret (masqué par défaut, apparaît au survol) -->
          <button
            (click)="isMinimized.set(true)"
            class="absolute -top-3 right-1 w-5 h-5 bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full flex items-center justify-center border border-gray-200 dark:border-gray-700 transition-all shadow-sm opacity-0 group-hover:opacity-100 hover:scale-110 cursor-pointer"
            title="Réduire le bouton"
            aria-label="Réduire le bouton">
            <lucide-icon name="x" [size]="10"></lucide-icon>
          </button>
        </div>
      }
    }

    <!-- Fenêtre de chat -->
    @if (isOpen()) {
      <div class="fixed z-50 bg-white dark:bg-[#121212] border-l border-gray-200 dark:border-gray-800 md:border md:border-gray-200 md:dark:border-gray-800 flex flex-col overflow-hidden shadow-2xl transition-all duration-300 md:inset-auto md:right-6 md:top-1/2 md:-translate-y-1/2 md:w-96 md:h-[520px] md:max-h-[calc(100vh-5rem)] md:rounded-2xl inset-0 w-full h-[100dvh]"
           role="dialog" aria-label="Chat avec le Mentor IA">

        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 bg-blue-600 text-white shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <lucide-icon name="bot" [size]="18"></lucide-icon>
            </div>
            <div>
              <p class="font-semibold text-sm">Mentor IA</p>
              <p class="text-xs text-blue-100">Gemini 2.5 Flash</p>
            </div>
          </div>
          <button (click)="close()" class="text-white/70 hover:text-white transition-colors cursor-pointer" aria-label="Fermer">
            <lucide-icon name="x" [size]="20"></lucide-icon>
          </button>
        </div>

        <!-- Messages -->
        <div #scrollArea class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-[#0f0f0f]">

          <!-- Message de bienvenue -->
          <div class="flex gap-3">
            <div class="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shrink-0 flex items-center justify-center mt-0.5">
              <lucide-icon name="bot" [size]="15"></lucide-icon>
            </div>
            <div class="bg-white dark:bg-gray-900 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-700 dark:text-gray-300 shadow-sm border border-gray-100 dark:border-gray-800 max-w-[85%]">
              Bonjour ! 👋 Je suis votre Mentor IA. Posez-moi vos questions sur Angular, TypeScript, Git ou n'importe quel concept de développement.
            </div>
          </div>

          <!-- Historique -->
          @for (msg of messages(); track $index) {
            @if (msg.role === 'user') {
              <div class="flex gap-3 flex-row-reverse">
                <div class="w-7 h-7 rounded-full bg-blue-600 text-white shrink-0 flex items-center justify-center mt-0.5">
                  <lucide-icon name="user" [size]="15"></lucide-icon>
                </div>
                <div class="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm max-w-[85%] shadow-sm">
                  {{ msg.content }}
                </div>
              </div>
            } @else {
              <div class="flex gap-3">
                <div class="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shrink-0 flex items-center justify-center mt-0.5">
                  <lucide-icon name="bot" [size]="15"></lucide-icon>
                </div>
                <div class="bg-white dark:bg-gray-900 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-700 dark:text-gray-300 shadow-sm border border-gray-100 dark:border-gray-800 max-w-[85%] whitespace-pre-wrap">
                  {{ msg.content }}
                </div>
              </div>
            }
          }

          <!-- Indicateur de frappe -->
          @if (isLoading()) {
            <div class="flex gap-3">
              <div class="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shrink-0 flex items-center justify-center">
                <lucide-icon name="bot" [size]="15"></lucide-icon>
              </div>
              <div class="bg-white dark:bg-gray-900 rounded-2xl rounded-tl-sm px-4 py-3 border border-gray-100 dark:border-gray-800 flex items-center gap-1.5">
                <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay:0s"></span>
                <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay:0.15s"></span>
                <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay:0.3s"></span>
              </div>
            </div>
          }
        </div>

        <!-- Zone de saisie -->
        <form (ngSubmit)="send()" class="flex gap-2 p-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#121212] shrink-0">
          <input
            type="text"
            [(ngModel)]="inputText"
            name="msg"
            autocomplete="off"
            placeholder="Posez votre question…"
            [disabled]="isLoading()"
            class="flex-1 bg-gray-100 dark:bg-gray-900 border-transparent rounded-xl px-4 py-2.5 text-sm dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all disabled:opacity-50">
          <button
            type="submit"
            [disabled]="!inputText.trim() || isLoading()"
            class="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
            aria-label="Envoyer">
            <lucide-icon name="send" [size]="18"></lucide-icon>
          </button>
        </form>

      </div>
    }
  `,
})
export class ChatbotComponent {
  private chatbotService = inject(IaChatbotService);
  private cdr = inject(ChangeDetectorRef);
  private document = inject(DOCUMENT);

  @ViewChild('scrollArea') private scrollArea!: ElementRef<HTMLDivElement>;

  isOpen = signal(false);
  isLoading = signal(false);
  messages = signal<ChatMessage[]>([]);
  inputText = '';
  isMinimized = signal(false);

  open(): void {
    this.isOpen.set(true);
    if (this.document) this.document.body.classList.add('overflow-hidden');
    this.cdr.markForCheck();
  }

  close(): void {
    this.isOpen.set(false);
    if (this.document) this.document.body.classList.remove('overflow-hidden');
    this.cdr.markForCheck();
  }

  send(): void {
    const text = this.inputText.trim();
    if (!text || this.isLoading()) return;

    // Ajouter le message utilisateur
    this.messages.update((msgs) => [...msgs, { role: 'user', content: text }]);
    this.inputText = '';
    this.isLoading.set(true);
    this.cdr.markForCheck();
    this.scrollToBottom();

    // Appel à l'API Gemini
    this.chatbotService.sendMessage(this.messages(), text).subscribe({
      next: (response) => {
        this.messages.update((msgs) => [
          ...msgs,
          { role: 'model', content: response },
        ]);
        this.isLoading.set(false);
        this.cdr.markForCheck();
        // On ne scrolle pas vers le bas pour laisser l'utilisateur lire le début du message
      },
      error: () => {
        this.messages.update((msgs) => [
          ...msgs,
          { role: 'model', content: "Désolé, une erreur s'est produite. Veuillez réessayer." },
        ]);
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.scrollArea?.nativeElement) {
        this.scrollArea.nativeElement.scrollTop = this.scrollArea.nativeElement.scrollHeight;
      }
    }, 50);
  }
}
