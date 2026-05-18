import { Injectable, inject, signal } from '@angular/core';
import { Auth, authState, GoogleAuthProvider, signInWithPopup, signOut, User } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  
  // Signal pour l'état de l'utilisateur
  currentUser = signal<User | null>(null);
  
  // Signal pour savoir si Firebase Auth a fini de s'initialiser
  authInitialized = signal<boolean>(false);

  constructor() {
    // Écouter les changements d'état d'authentification
    authState(this.auth).subscribe((user: User | null) => {
      this.currentUser.set(user);
      this.authInitialized.set(true);
    });
  }

  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(this.auth, provider);
    } catch (error) {
      console.error('Erreur lors de la connexion Google:', error);
    }
  }

  async logout() {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  }
}
