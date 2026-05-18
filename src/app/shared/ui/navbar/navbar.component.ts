import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Moon, Sun, Menu, X, BookOpen, Code, Github } from 'lucide-angular';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <header class="sticky top-0 z-50 w-full border-b border-gray-200/50 bg-white/80 backdrop-blur-md dark:border-gray-800/50 dark:bg-[#121212]/80 transition-colors duration-300">
      <div class="max-w-3xl mx-auto px-6 w-full">
        <div class="flex h-16 items-center justify-between">
          <!-- Logo -->
          <div class="flex items-center">
            <a routerLink="/" class="flex items-center gap-2 group">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white transition-transform group-hover:scale-105">
                <lucide-icon name="code" [size]="16"></lucide-icon>
              </div>
              <span class="text-lg font-bold tracking-tight text-gray-900 dark:text-white">MDG.</span>
            </a>
          </div>

          <!-- Desktop Navigation -->
          <nav class="hidden md:flex items-center gap-4">
            <a routerLink="/" routerLinkActive="bg-blue-50/70 dark:bg-blue-950/25 text-blue-600 dark:text-blue-400 font-semibold" [routerLinkActiveOptions]="{exact: true}" class="text-sm font-medium text-gray-600 dark:text-gray-300 px-3.5 py-1.5 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/30 hover:text-gray-900 dark:hover:text-white transition-all flex items-center gap-2 cursor-pointer">
              <lucide-icon name="book-open" [size]="16"></lucide-icon>
              Le Guide
            </a>
            <a routerLink="/tips" routerLinkActive="bg-blue-50/70 dark:bg-blue-950/25 text-blue-600 dark:text-blue-400 font-semibold" class="text-sm font-medium text-gray-600 dark:text-gray-300 px-3.5 py-1.5 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/30 hover:text-gray-900 dark:hover:text-white transition-all flex items-center gap-2 cursor-pointer">
              <lucide-icon name="code" [size]="16"></lucide-icon>
              Astuces
            </a>
            <a routerLink="/profile" routerLinkActive="bg-blue-50/70 dark:bg-blue-950/25 text-blue-600 dark:text-blue-400 font-semibold" class="text-sm font-medium text-gray-600 dark:text-gray-300 px-3.5 py-1.5 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/30 hover:text-gray-900 dark:hover:text-white transition-all flex items-center gap-2 cursor-pointer">
              <lucide-icon name="user" [size]="16"></lucide-icon>
              Profil
            </a>
          </nav>

          <!-- Actions -->
          <div class="flex items-center gap-4">
            <button (click)="themeService.toggleTheme()" class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors cursor-pointer" aria-label="Toggle Dark Mode">
              @if (themeService.isDarkMode()) {
                <lucide-icon name="sun" [size]="20"></lucide-icon>
              } @else {
                <lucide-icon name="moon" [size]="20"></lucide-icon>
              }
            </button>
            
            <a href="https://github.com/Merlin-00/modern-developer-guide.git" target="_blank" class="hidden md:flex p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors cursor-pointer">
              <lucide-icon name="github" [size]="20"></lucide-icon>
            </a>
            
            <!-- Mobile Menu Toggle -->
            <button (click)="isMobileMenuOpen = !isMobileMenuOpen" class="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors cursor-pointer">
              @if (isMobileMenuOpen) {
                <lucide-icon name="x" [size]="24"></lucide-icon>
              } @else {
                <lucide-icon name="menu" [size]="24"></lucide-icon>
              }
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Navigation (Floating right card) -->
      @if (isMobileMenuOpen) {
        <div class="md:hidden absolute right-6 top-16 w-56 bg-white dark:bg-[#121212] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 py-3 z-50 animate-fade-in">
          <nav class="flex flex-col gap-1 px-2.5">
            <a routerLink="/" (click)="isMobileMenuOpen = false" routerLinkActive="bg-blue-50/70 dark:bg-blue-950/25 text-blue-600 dark:text-blue-400 font-semibold" [routerLinkActiveOptions]="{exact: true}" class="text-sm font-semibold text-gray-600 dark:text-gray-300 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/40 flex items-center gap-3 transition-colors cursor-pointer">
              <lucide-icon name="book-open" [size]="16"></lucide-icon>
              Le Guide
            </a>
            <a routerLink="/tips" (click)="isMobileMenuOpen = false" routerLinkActive="bg-blue-50/70 dark:bg-blue-950/25 text-blue-600 dark:text-blue-400 font-semibold" class="text-sm font-semibold text-gray-600 dark:text-gray-300 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/40 flex items-center gap-3 transition-colors cursor-pointer">
              <lucide-icon name="code" [size]="16"></lucide-icon>
              Astuces
            </a>
            <a routerLink="/profile" (click)="isMobileMenuOpen = false" routerLinkActive="bg-blue-50/70 dark:bg-blue-950/25 text-blue-600 dark:text-blue-400 font-semibold" class="text-sm font-semibold text-gray-600 dark:text-gray-300 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/40 flex items-center gap-3 transition-colors cursor-pointer">
              <lucide-icon name="user" [size]="16"></lucide-icon>
              Profil
            </a>
          </nav>
        </div>
      }
    </header>
  `
})
export class NavbarComponent {
  themeService = inject(ThemeService);
  isMobileMenuOpen = false;
  readonly Moon = Moon;
  readonly Sun = Sun;
  readonly Menu = Menu;
  readonly X = X;
  readonly BookOpen = BookOpen;
  readonly Code = Code;
  readonly Github = Github;
}
