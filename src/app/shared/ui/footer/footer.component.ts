import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Github } from 'lucide-angular';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <footer class="border-t border-gray-200/50 bg-white dark:border-gray-800/50 dark:bg-[#121212] py-8 mt-auto transition-colors duration-300">
      <div class="max-w-3xl mx-auto px-6 text-sm text-gray-500 dark:text-gray-400">
        
        <!-- Ligne titre et bouton Contribuer (toujours en ligne) -->
        <div class="flex items-center justify-between gap-4 mb-4">
          <p class="text-base font-semibold text-gray-900 dark:text-white">
            Modern Developer Guide
          </p>
          <a href="https://github.com/Merlin-00/modern-developer-guide.git" 
             target="_blank" 
             rel="noopener noreferrer" 
             class="inline-flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-all cursor-pointer">
            <lucide-icon name="github" [size]="14"></lucide-icon>
            <span class="hidden sm:inline">Contribuer</span>
          </a>
        </div>

        <p class="mb-6 text-xs leading-relaxed max-w-xl">
          Une plateforme open-source pour apprendre, partager et grandir ensemble dans l'écosystème de développement moderne.
        </p>

        <div class="border-t border-gray-100 dark:border-gray-800/60 pt-4 text-xs opacity-75">
          <p>&copy; {{ currentYear }} Modern Developer Guide. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  readonly Github = Github;
}
