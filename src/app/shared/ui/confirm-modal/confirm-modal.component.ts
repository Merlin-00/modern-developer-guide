import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, LucideAngularModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/35 dark:bg-black/55 backdrop-blur-[2px] animate-fade-in">
        <!-- Card Modal -->
        <div 
          class="relative w-full max-w-sm transform overflow-hidden rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-[#121212] p-5 shadow-2xl transition-all animate-slide-up">
          
          <!-- Content -->
          <div class="flex items-center text-center sm:items-start sm:text-left gap-4 mt-2">
            <!-- Icon container (optionnel) -->
            @if (iconName) {
              <div 
                [ngClass]="{
                  'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400': type === 'danger',
                  'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400': type === 'warning',
                  'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400': type === 'info'
                }"
                class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                <lucide-icon [name]="iconName" [size]="24"></lucide-icon>
              </div>
            }

            <div class="flex-1">
              <h3 class="text-lg font-extrabold text-gray-900 dark:text-white leading-6">
                {{ title }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-2 whitespace-pre-line leading-relaxed">
                {{ message }}
              </p>
            </div>
          </div>

          <!-- Actions Footer -->
          <div class="mt-6 flex sm:justify-end gap-3">
            <button 
              (click)="onCancel()" 
              class="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors cursor-pointer justify-center w-full sm:w-auto">
              {{ cancelText }}
            </button>
            <button 
              (click)="onConfirm()"
              [ngClass]="{
                'bg-red-600 hover:bg-red-500 text-white dark:bg-red-500 dark:hover:bg-red-400': type === 'danger',
                'bg-amber-600 hover:bg-amber-500 text-white dark:bg-amber-500 dark:hover:bg-amber-400': type === 'warning',
                'bg-blue-600 hover:bg-blue-500 text-white dark:bg-blue-500 dark:hover:bg-blue-400': type === 'info'
              }"
              class="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 w-full sm:w-auto cursor-pointer border border-transparent">
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirmation';
  @Input() message = 'Êtes-vous sûr de vouloir effectuer cette action ?';
  @Input() confirmText = 'Confirmer';
  @Input() cancelText = 'Annuler';
  @Input() type: 'danger' | 'warning' | 'info' = 'info';
  @Input() iconName = 'alert-triangle';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
