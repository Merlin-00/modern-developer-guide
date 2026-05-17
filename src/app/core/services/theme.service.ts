import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * ThemeService — gestion du mode clair/sombre.
 * On évite effect() asynchrone pour appliquer le thème directement et de façon synchrone.
 * La persistance se fait via localStorage.
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);

  // Signal réactif représentant l'état actuel du thème
  isDarkMode = signal<boolean>(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      // Lire le thème sauvegardé, ou utiliser la préférence système
      const saved = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = saved === 'dark' || (!saved && prefersDark);

      this.isDarkMode.set(isDark);
      this.applyToDocument(isDark); // Applique immédiatement (synchrone)
    }
  }

  /** Bascule entre clair et sombre */
  toggleTheme(): void {
    const newValue = !this.isDarkMode();
    this.isDarkMode.set(newValue);
    this.applyToDocument(newValue);
  }

  /** Ajoute/retire la classe `dark` sur <html> et persiste le choix */
  private applyToDocument(isDark: boolean): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
