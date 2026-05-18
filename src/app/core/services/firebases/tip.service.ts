import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
  increment,
  getDocs,
  getCountFromServer,
  startAfter,
  where,
  limit,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  getDoc
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Tip } from '../../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class TipService {
  private firestore: Firestore = inject(Firestore);
  private injector = inject(Injector);
  private tipsCollection = collection(this.firestore, 'tips');



  // Récupérer les astuces paginées côté serveur (performances optimales et à la demande)
  async getTipsPaginated(options: {
    pageSize: number;
    startAfterDoc?: any;
    sortBy: 'likes' | 'createdAt';
    searchQuery?: string;
    authorId?: string;
  }) {
    return runInInjectionContext(this.injector, async () => {
      const buildConstraints = (includeSecondarySort: boolean) => {
        let constraints: any[] = [];

        if (options.authorId) {
          constraints.push(where('authorId', '==', options.authorId));
        }

        let isSearchActive = false;
        if (options.searchQuery) {
          const search = options.searchQuery.trim();
          if (search) {
            isSearchActive = true;
            if (['typescript', 'javascript', 'html', 'css', 'bash', 'python', 'java', 'go', 'rust', 'cpp', 'csharp', 'php', 'ruby', 'sql', 'yaml', 'markdown'].includes(search.toLowerCase())) {
              constraints.push(where('language', '==', search.toLowerCase()));
            } else {
              constraints.push(where('title', '>=', search));
              constraints.push(where('title', '<=', search + '\uf8ff'));
            }
          }
        }

        if (isSearchActive) {
          constraints.push(orderBy('title', 'asc'));
        } else {
          if (options.sortBy === 'likes') {
            constraints.push(orderBy('likes', 'desc'));
            if (includeSecondarySort) {
              constraints.push(orderBy('createdAt', 'desc'));
            }
          } else {
            constraints.push(orderBy('createdAt', 'desc'));
          }
        }

        if (options.startAfterDoc) {
          constraints.push(startAfter(options.startAfterDoc));
        }

        constraints.push(limit(options.pageSize));
        return { constraints, isSearchActive };
      };

      const { constraints, isSearchActive } = buildConstraints(true);
      const q = query(this.tipsCollection, ...constraints);

      let docsSnapshot;
      try {
        docsSnapshot = await getDocs(q);
      } catch (error: any) {
        // En cas de manque d'index composite pour (likes desc, createdAt desc), repli automatique
        if (options.sortBy === 'likes' && !isSearchActive) {
          console.warn("Index composite manquant. Repli automatique sur un tri simple par likes.", error);
          const { constraints: fallbackConstraints } = buildConstraints(false);
          const fallbackQ = query(this.tipsCollection, ...fallbackConstraints);
          docsSnapshot = await getDocs(fallbackQ);
        } else {
          throw error;
        }
      }

      // Compter le total sans limites ni curseurs
      let countConstraints: any[] = [];
      if (options.authorId) {
        countConstraints.push(where('authorId', '==', options.authorId));
      }
      if (options.searchQuery) {
        const search = options.searchQuery.trim();
        if (search) {
          if (['typescript', 'javascript', 'html', 'css', 'bash', 'python', 'java', 'go', 'rust', 'cpp', 'csharp', 'php', 'ruby', 'sql', 'yaml', 'markdown'].includes(search.toLowerCase())) {
            countConstraints.push(where('language', '==', search.toLowerCase()));
          } else {
            countConstraints.push(where('title', '>=', search));
            countConstraints.push(where('title', '<=', search + '\uf8ff'));
          }
        }
      }

      const countQuery = countConstraints.length > 0
        ? query(this.tipsCollection, ...countConstraints)
        : this.tipsCollection;

      const countSnapshot = await getCountFromServer(countQuery);
      const totalCount = countSnapshot.data().count;

      return {
        docs: docsSnapshot.docs,
        totalCount
      };
    });
  }

  // Récupérer toutes les astuces (méthode existante conservée pour compatibilité globale si besoin)
  getTips(): Observable<Tip[]> {
    return runInInjectionContext(this.injector, () => {
      const q = query(this.tipsCollection, orderBy('createdAt', 'desc'));
      return collectionData(q, { idField: 'id' }) as Observable<Tip[]>;
    });
  }

  // Ajouter une nouvelle astuce
  async addTip(tipData: Omit<Tip, 'id' | 'createdAt' | 'likes'>) {
    return runInInjectionContext(this.injector, async () => {
      const newTip = {
        ...tipData,
        likes: 0,
        isDeleted: false,
        createdAt: serverTimestamp() // Utilise l'heure du serveur Firebase
      };
      return addDoc(this.tipsCollection, newTip);
    });
  }

  // Mettre à jour une astuce (ex: pour la modification)
  async updateTip(id: string, data: Partial<Tip>) {
    return runInInjectionContext(this.injector, async () => {
      const tipRef = doc(this.firestore, `tips/${id}`);
      return updateDoc(tipRef, data);
    });
  }

  // Supprimer logiquement une astuce
  async deleteTip(id: string) {
    return runInInjectionContext(this.injector, async () => {
      const tipRef = doc(this.firestore, `tips/${id}`);
      return updateDoc(tipRef, { isDeleted: true });
    });
  }

  // Incrémenter ou décrémenter les likes de manière concurrente (safe)
  async likeTip(
    id: string,
    isLike: boolean,
    user?: { uid: string; displayName: string | null; photoURL: string | null; } | null
  ) {
    return runInInjectionContext(this.injector, async () => {
      const tipRef = doc(this.firestore, `tips/${id}`);
      const updates: any = {
        likes: increment(isLike ? 1 : -1)
      };
      if (user) {
        const profileObj = {
          uid: user.uid,
          displayName: user.displayName || 'Anonyme',
          photoURL: user.photoURL || ''
        };
        updates.likedByProfiles = isLike ? arrayUnion(profileObj) : arrayRemove(profileObj);
      }
      return updateDoc(tipRef, updates);
    });
  }

  // Récupérer une astuce spécifique par son ID
  async getTipById(id: string): Promise<Tip | null> {
    return runInInjectionContext(this.injector, async () => {
      const tipRef = doc(this.firestore, `tips/${id}`);
      const docSnap = await getDoc(tipRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Tip;
      }
      return null;
    });
  }

  // Écouter une astuce spécifique en temps réel (pour la synchronisation multi-utilisateurs)
  listenToTip(id: string, callback: (tip: Tip) => void): () => void {
    return runInInjectionContext(this.injector, () => {
      const tipRef = doc(this.firestore, `tips/${id}`);
      return onSnapshot(tipRef, (docSnap) => {
        if (docSnap.exists()) {
          callback({ id: docSnap.id, ...docSnap.data() } as Tip);
        }
      });
    });
  }
}
