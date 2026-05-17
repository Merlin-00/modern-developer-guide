import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { LucideAngularModule, Heart, Share2, Code, MessageSquare, Trash2, LogIn } from 'lucide-angular';
import { TipService, Tip } from '../../core/services/tip.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-tips',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-5xl">
      <div class="mb-10 text-center">
        <h1 class="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
          Astuces Communautaires
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Découvrez, partagez et apprenez des meilleures astuces de la communauté.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Sidebar / Formulaire d'ajout -->
        <div class="lg:col-span-1">
          <div class="sticky top-24">
            @if (authService.currentUser()) {
              <div class="card-modern">
                <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
                  <lucide-icon name="message-square" [size]="20" class="text-blue-600 dark:text-blue-400"></lucide-icon>
                  Partager une astuce
                </h3>
                
                <form [formGroup]="tipForm" (ngSubmit)="submitTip()" class="flex flex-col gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titre</label>
                    <input 
                      type="text" 
                      formControlName="title"
                      class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-blue-500"
                      placeholder="Ex: Centrer une div en CSS">
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea 
                      formControlName="description"
                      rows="3"
                      class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-blue-500"
                      placeholder="Expliquez votre astuce..."></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code (optionnel)</label>
                    <textarea 
                      formControlName="codeSnippet"
                      rows="4"
                      class="w-full font-mono rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-blue-500"
                      placeholder="Collez votre code ici..."></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Langage</label>
                    <select 
                      formControlName="language"
                      class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-blue-500">
                      <option value="typescript">TypeScript</option>
                      <option value="javascript">JavaScript</option>
                      <option value="html">HTML</option>
                      <option value="css">CSS / Tailwind</option>
                      <option value="bash">Bash / Terminal</option>
                    </select>
                  </div>

                  <button 
                    type="submit" 
                    [disabled]="tipForm.invalid || isSubmitting()"
                    class="btn-primary w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {{ isSubmitting() ? 'Publication...' : 'Publier' }}
                  </button>
                </form>
              </div>
            } @else {
              <div class="card-modern text-center py-8">
                <div class="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
                  <lucide-icon name="log-in" [size]="24"></lucide-icon>
                </div>
                <h3 class="text-lg font-bold mb-2">Rejoignez la communauté</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Connectez-vous pour partager vos propres astuces avec les autres développeurs.
                </p>
                <button (click)="authService.loginWithGoogle()" class="btn-primary w-full">
                  Connexion avec Google
                </button>
              </div>
            }
          </div>
        </div>

        <!-- Liste des astuces -->
        <div class="lg:col-span-2 flex flex-col gap-6">
          
          <!-- async pipe pour l'observable des astuces -->
          @if (tips$ | async; as tips) {
            @if (tips.length === 0) {
              <div class="text-center py-12 text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
                Aucune astuce pour le moment. Soyez le premier !
              </div>
            }
            
            @for (tip of tips; track tip.id) {
              <div class="card-modern p-0 overflow-hidden group">
                <!-- Header de la carte -->
                <div class="p-6 pb-4 flex items-start justify-between">
                  <div class="flex items-center gap-3">
                    <img [src]="tip.authorAvatar || 'assets/default-avatar.png'" alt="Avatar" class="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700">
                    <div>
                      <h4 class="font-semibold text-gray-900 dark:text-white">{{ tip.authorName }}</h4>
                      <p class="text-xs text-gray-500 dark:text-gray-400">
                        {{ tip.createdAt?.toDate() | date:'dd MMM yyyy' }}
                      </p>
                    </div>
                  </div>
                  
                  @if (authService.currentUser()?.uid === tip.authorId) {
                    <button (click)="deleteTip(tip.id!)" class="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100" title="Supprimer mon astuce">
                      <lucide-icon name="trash-2" [size]="18"></lucide-icon>
                    </button>
                  }
                </div>

                <!-- Contenu de l'astuce -->
                <div class="px-6 pb-4">
                  <h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">{{ tip.title }}</h3>
                  <p class="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 whitespace-pre-wrap">
                    {{ tip.description }}
                  </p>
                  
                  @if (tip.codeSnippet) {
                    <div class="relative mt-4 rounded-xl overflow-hidden bg-[#0d1117] border border-gray-800">
                      <div class="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-gray-800">
                        <span class="text-xs font-mono text-gray-400">{{ tip.language }}</span>
                        <button (click)="copyCode(tip.codeSnippet, tip.id!)" class="text-gray-400 hover:text-white transition-colors text-xs font-medium">
                          {{ copiedId() === tip.id ? 'Copié !' : 'Copier' }}
                        </button>
                      </div>
                      <div class="p-4 overflow-x-auto">
                        <pre class="font-mono text-sm text-gray-300"><code>{{ tip.codeSnippet }}</code></pre>
                      </div>
                    </div>
                  }
                </div>

                <!-- Footer (Actions) -->
                <div class="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <button (click)="likeTip(tip)" class="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors group/btn">
                    <lucide-icon name="heart" [size]="18" class="group-hover/btn:fill-red-500/20"></lucide-icon>
                    {{ tip.likes || 0 }}
                  </button>
                  <button class="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                    <lucide-icon name="share-2" [size]="18"></lucide-icon>
                    Partager
                  </button>
                </div>
              </div>
            }
          } @else {
            <div class="flex justify-center py-12">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          }
        </div>
        
      </div>
    </div>
  `
})
export class TipsComponent {
  authService = inject(AuthService);
  tipService = inject(TipService);
  fb = inject(FormBuilder);
  
  readonly Heart = Heart;
  readonly Share2 = Share2;
  readonly Code = Code;
  readonly MessageSquare = MessageSquare;
  readonly Trash2 = Trash2;
  readonly LogIn = LogIn;

  tips$ = this.tipService.getTips();
  isSubmitting = signal(false);
  copiedId = signal<string | null>(null);

  tipForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    codeSnippet: [''],
    language: ['typescript']
  });

  async submitTip() {
    if (this.tipForm.invalid || !this.authService.currentUser()) return;
    
    this.isSubmitting.set(true);
    const user = this.authService.currentUser()!;
    const formValue = this.tipForm.getRawValue();
    
    try {
      await this.tipService.addTip({
        title: formValue.title,
        description: formValue.description,
        codeSnippet: formValue.codeSnippet,
        language: formValue.language,
        authorId: user.uid,
        authorName: user.displayName || 'Utilisateur',
        authorAvatar: user.photoURL || ''
      });
      this.tipForm.reset({ language: 'typescript' });
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async likeTip(tip: Tip) {
    if (tip.id) {
      await this.tipService.likeTip(tip.id, tip.likes);
    }
  }

  async deleteTip(id: string) {
    if (confirm('Voulez-vous vraiment supprimer cette astuce ?')) {
      await this.tipService.deleteTip(id);
    }
  }

  copyCode(code: string, id: string) {
    navigator.clipboard.writeText(code).then(() => {
      this.copiedId.set(id);
      setTimeout(() => this.copiedId.set(null), 2000);
    });
  }
}
