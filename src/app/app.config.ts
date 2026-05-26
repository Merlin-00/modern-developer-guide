import {
  ApplicationConfig,
  importProvidersFrom,
  provideZonelessChangeDetection,
  isDevMode,
  EnvironmentInjector,
  inject,
  runInInjectionContext,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { FirebaseApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, provideFirestore } from '@angular/fire/firestore';

// Lucide icons: on utilise importProvidersFrom() pour convertir un ModuleWithProviders
// en fournisseurs compatibles avec l'API standalone d'Angular
import { LucideAngularModule } from 'lucide-angular';
import {
  Moon,
  Sun,
  Menu,
  X,
  BookOpen,
  Code,
  ChevronRight,
  ChevronLeft,
  CircleCheck,
  Terminal,
  MessageCircle,
  Send,
  Bot,
  User,
  Heart,
  Share2,
  MessageSquare,
  Trash2,
  LogIn,
  Pencil,
  TriangleAlert,
} from 'lucide-angular';

import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),

    // importProvidersFrom() est la bonne façon d'intégrer un ModuleWithProviders
    // dans une application Angular standalone — LucideAngularModule.pick() en retourne un.
    importProvidersFrom(
      LucideAngularModule.pick({
        Moon,
        Sun,
        Menu,
        X,
        BookOpen,
        Code,
        ChevronRight,
        ChevronLeft,
        CircleCheck,
        Terminal,
        MessageCircle,
        Send,
        Bot,
        User,
        Heart,
        Share2,
        MessageSquare,
        Trash2,
        LogIn,
        Pencil,
        TriangleAlert,
      }),
    ),

    // Initialisation de Firebase avec les clés de l'environnement
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => {
      const app = inject(FirebaseApp);
      const injector = inject(EnvironmentInjector);
      return runInInjectionContext(injector, () =>
        initializeFirestore(app, {
          localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager(),
          }),
        })
      );
    }),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
