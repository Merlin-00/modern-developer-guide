import { ApplicationConfig, importProvidersFrom, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

// Lucide icons: on utilise importProvidersFrom() pour convertir un ModuleWithProviders
// en fournisseurs compatibles avec l'API standalone d'Angular
import { LucideAngularModule } from 'lucide-angular';
import {
  Moon, Sun, Menu, X, BookOpen, Code, Github,
  ChevronRight, ChevronLeft, CheckCircle, Terminal,
  MessageCircle, Send, Bot, User,
  Heart, Share2, MessageSquare, Trash2, LogIn
} from 'lucide-angular';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideHttpClient(),

    // importProvidersFrom() est la bonne façon d'intégrer un ModuleWithProviders
    // dans une application Angular standalone — LucideAngularModule.pick() en retourne un.
    importProvidersFrom(
      LucideAngularModule.pick({
        Moon, Sun, Menu, X, BookOpen, Code, Github,
        ChevronRight, ChevronLeft, CheckCircle, Terminal,
        MessageCircle, Send, Bot, User,
        Heart, Share2, MessageSquare, Trash2, LogIn
      })
    ),

    // Initialisation de Firebase avec les clés de l'environnement
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ]
};
