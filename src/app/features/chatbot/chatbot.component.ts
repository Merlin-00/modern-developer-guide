import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, MessageCircle, X, Send, Bot, User } from 'lucide-angular';
import { IaChatbotService, ChatMessage } from '../../core/services/ia-chatbot.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <!-- Bouton flottant -->
    @if (!isOpen()) {
      <button 
        (click)="toggleChat()"
        class="fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 hover:scale-110 transition-all duration-300 z-50 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
        aria-label="Ouvrir le Chatbot IA">
        <lucide-icon name="message-circle" [size]="28"></lucide-icon>
      </button>
    }

    <!-- Fenêtre de chat -->
    @if (isOpen()) {
      <div 
        class="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-6rem)] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-200 dark:border-gray-800">
      
      <!-- Header -->
      <div class="p-4 bg-blue-600 text-white flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <lucide-icon name="bot" [size]="20"></lucide-icon>
          </div>
          <div>
            <h3 class="font-bold">Mentor IA</h3>
            <p class="text-xs text-blue-100">En ligne</p>
          </div>
        </div>
        <button (click)="toggleChat()" class="text-white/80 hover:text-white transition-colors hover:rotate-90 duration-300" aria-label="Fermer le chat">
          <lucide-icon name="x" [size]="24"></lucide-icon>
        </button>
      </div>

      <!-- Messages -->
      <div #scrollContainer class="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-[#121212] space-y-4">
        
        <!-- Message de bienvenue -->
        <div class="flex gap-3 max-w-[85%]">
          <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 flex-shrink-0 flex items-center justify-center">
            <lucide-icon name="bot" [size]="18"></lucide-icon>
          </div>
          <div class="bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300">
            Bonjour ! Je suis votre mentor IA. Comment puis-je vous aider avec votre code aujourd'hui ?
          </div>
        </div>

        <!-- Historique des messages -->
        @for (msg of messages(); track $index) {
          <div class="flex gap-3" [class.flex-row-reverse]="msg.role === 'user'">
            <div class="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
                 [class.bg-blue-600]="msg.role === 'user'" [class.text-white]="msg.role === 'user'"
                 [class.bg-blue-100]="msg.role === 'model'" [class.text-blue-600]="msg.role === 'model'"
                 [class.dark:bg-blue-500]="msg.role === 'user'"
                 [class.dark:bg-blue-900]="msg.role === 'model'" [class.dark:text-blue-400]="msg.role === 'model'">
              <lucide-icon [name]="msg.role === 'user' ? 'user' : 'bot'" [size]="18"></lucide-icon>
            </div>
            
            <div class="max-w-[85%] p-3 shadow-sm border text-sm"
                 [class.bg-blue-600]="msg.role === 'user'" [class.text-white]="msg.role === 'user'" [class.border-transparent]="msg.role === 'user'" [class.rounded-2xl]="true" [class.rounded-tr-sm]="msg.role === 'user'"
                 [class.bg-white]="msg.role === 'model'" [class.dark:bg-gray-800]="msg.role === 'model'" [class.text-gray-700]="msg.role === 'model'" [class.dark:text-gray-300]="msg.role === 'model'" [class.border-gray-100]="msg.role === 'model'" [class.dark:border-gray-700]="msg.role === 'model'" [class.rounded-tl-sm]="msg.role === 'model'">
              
              <!-- Contenu formaté -->
              <div [innerHTML]="formatMessage(msg.content)" class="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap"></div>
            </div>
          </div>
        }

        <!-- Indicateur de frappe -->
        @if (isLoading()) {
          <div class="flex gap-3 max-w-[85%]">
            <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 flex-shrink-0 flex items-center justify-center">
              <lucide-icon name="bot" [size]="18"></lucide-icon>
            </div>
            <div class="bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-1.5 h-10">
              <div class="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
              <div class="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
              <div class="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
            </div>
          </div>
        }
      </div>

      <!-- Input Form -->
      <form (ngSubmit)="sendMessage()" class="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex gap-2">
        <input 
          type="text" 
          [(ngModel)]="userInput" 
          name="userInput"
          placeholder="Posez votre question..." 
          class="flex-1 bg-gray-100 dark:bg-gray-800 border-transparent focus:bg-white dark:focus:bg-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 rounded-xl px-4 py-2.5 text-sm dark:text-white transition-all outline-none"
          [disabled]="isLoading()"
          autocomplete="off">
        <button 
          type="submit" 
          [disabled]="!userInput.trim() || isLoading()"
          class="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0">
          <lucide-icon name="send" [size]="20"></lucide-icon>
        </button>
      </form>
    </div>
    }
  `
})
export class ChatbotComponent {
  private chatbotService = inject(IaChatbotService);
  
  readonly MessageCircle = MessageCircle;
  readonly X = X;
  readonly Send = Send;
  readonly Bot = Bot;
  readonly User = User;

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  isOpen = signal(false);
  isLoading = signal(false);
  messages = signal<ChatMessage[]>([]);
  userInput = '';

  toggleChat() {
    this.isOpen.update(v => !v);
  }

  sendMessage() {
    const text = this.userInput.trim();
    if (!text || this.isLoading()) return;

    // Ajouter le message de l'utilisateur
    this.messages.update(msgs => [...msgs, { role: 'user', content: text }]);
    this.userInput = '';
    this.isLoading.set(true);
    this.scrollToBottom();

    // Appeler l'API Gemini
    this.chatbotService.sendMessage(this.messages(), text).subscribe({
      next: (response) => {
        this.messages.update(msgs => [...msgs, { role: 'model', content: response }]);
        this.isLoading.set(false);
        this.scrollToBottom();
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.scrollContainer) {
        const el = this.scrollContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    }, 100);
  }

  // Formatage simple pour les blocs de code Markdown
  formatMessage(text: string): string {
    // Échapper le HTML pour éviter XSS, puis formater les blocs de code
    let formatted = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
      
    // Remplacer ```code``` par <pre><code>code</code></pre>
    formatted = formatted.replace(/```(.*?)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<div class="my-2 rounded-lg overflow-hidden bg-[#0d1117] border border-gray-700/50">
                <div class="px-3 py-1 bg-[#161b22] text-xs font-mono text-gray-400 border-b border-gray-700/50">${lang || 'code'}</div>
                <pre class="p-3 overflow-x-auto font-mono text-sm text-gray-300"><code>${code}</code></pre>
              </div>`;
    });
    
    // Remplacer `code` inline
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-gray-200 dark:bg-gray-800 rounded font-mono text-sm text-red-500 dark:text-red-400">$1</code>');
    
    // Remplacer **bold**
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    return formatted;
  }
}
