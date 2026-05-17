import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="border-t border-gray-200/50 bg-white dark:border-gray-800/50 dark:bg-[#121212] py-8 mt-auto transition-colors duration-300">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p class="mb-4 text-base font-medium text-gray-900 dark:text-white">
          Modern Developer Guide
        </p>
        <p class="mb-4 max-w-md mx-auto">
          Une plateforme open-source pour apprendre, partager et grandir ensemble dans l'écosystème de développement moderne.
        </p>
        <div class="flex justify-center space-x-6">
          <a href="#" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">GitHub</a>
          <a href="#" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contribuer</a>
          <a href="#" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Mentions légales</a>
        </div>
        <p class="mt-8 opacity-75">
          &copy; {{ currentYear }} Modern Developer Guide. Tous droits réservés.
        </p>
      </div>
    </footer>
  `
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
