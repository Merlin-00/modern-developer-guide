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
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          <!-- Logo -->
          <div class="flex items-center">
            <a routerLink="/" class="flex items-center gap-2 group">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white transition-transform group-hover:scale-105">
                <lucide-icon name="code" [size]="20"></lucide-icon>
              </div>
              <span class="text-xl font-bold tracking-tight text-gray-900 dark:text-white">MDG.</span>
            </a>
          </div>

          <!-- Desktop Navigation -->
          <nav class="hidden md:flex items-center gap-8">
            <a routerLink="/" routerLinkActive="text-blue-600 dark:text-blue-400 font-semibold" [routerLinkActiveOptions]="{exact: true}" class="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white flex items-center gap-2">
              <lucide-icon name="book-open" [size]="16"></lucide-icon>
              Le Guide
            </a>
            <a routerLink="/tips" routerLinkActive="text-blue-600 dark:text-blue-400 font-semibold" class="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white flex items-center gap-2">
              <lucide-icon name="code" [size]="16"></lucide-icon>
              Astuces
            </a>
          </nav>

          <!-- Actions -->
          <div class="flex items-center gap-4">
            <button (click)="themeService.toggleTheme()" class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors" aria-label="Toggle Dark Mode">
              @if (themeService.isDarkMode()) {
                <lucide-icon name="sun" [size]="20"></lucide-icon>
              } @else {
                <lucide-icon name="moon" [size]="20"></lucide-icon>
              }
            </button>
            
            <a href="https://github.com" target="_blank" class="hidden md:flex p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors">
              <lucide-icon name="github" [size]="20"></lucide-icon>
            </a>
            
            <!-- Mobile Menu Toggle -->
            <button (click)="isMobileMenuOpen = !isMobileMenuOpen" class="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors">
              @if (isMobileMenuOpen) {
                <lucide-icon name="x" [size]="24"></lucide-icon>
              } @else {
                <lucide-icon name="menu" [size]="24"></lucide-icon>
              }
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Navigation -->
      @if (isMobileMenuOpen) {
        <div class="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121212] px-4 py-6">
          <nav class="flex flex-col gap-4">
            <a routerLink="/" (click)="isMobileMenuOpen = false" class="text-base font-medium text-gray-600 dark:text-gray-300 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3">
              <lucide-icon name="book-open" [size]="20"></lucide-icon>
              Le Guide
            </a>
            <a routerLink="/tips" (click)="isMobileMenuOpen = false" class="text-base font-medium text-gray-600 dark:text-gray-300 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3">
              <lucide-icon name="code" [size]="20"></lucide-icon>
              Astuces
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
