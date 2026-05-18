import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData, 
  addDoc, 
  doc, 
  deleteDoc, 
  updateDoc, 
  query, 
  orderBy, 
  serverTimestamp, 
  writeBatch,
  increment,
  getDocs,
  getCountFromServer,
  startAfter,
  where,
  limit
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Tip {
  id?: string;
  title: string;
  description: string;
  codeSnippet?: string;
  language?: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  createdAt?: any;
  likes: number;
  isEdited?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TipService {
  private firestore: Firestore = inject(Firestore);
  private tipsCollection = collection(this.firestore, 'tips');

  

  // Récupérer les astuces paginées côté serveur (performances optimales et à la demande)
  async getTipsPaginated(options: {
    pageSize: number;
    startAfterDoc?: any;
    sortBy: 'likes' | 'createdAt';
    searchQuery?: string;
    authorId?: string;
  }) {
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
  }

  // Récupérer toutes les astuces (méthode existante conservée pour compatibilité globale si besoin)
  getTips(): Observable<Tip[]> {
    const q = query(this.tipsCollection, orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Tip[]>;
  }

  // Ajouter une nouvelle astuce
  async addTip(tipData: Omit<Tip, 'id' | 'createdAt' | 'likes'>) {
    const newTip = {
      ...tipData,
      likes: 0,
      createdAt: serverTimestamp() // Utilise l'heure du serveur Firebase
    };
    return addDoc(this.tipsCollection, newTip);
  }

  // Mettre à jour une astuce (ex: pour la modification)
  async updateTip(id: string, data: Partial<Tip>) {
    const tipRef = doc(this.firestore, `tips/${id}`);
    return updateDoc(tipRef, data);
  }

  // Supprimer une astuce
  async deleteTip(id: string) {
    const tipRef = doc(this.firestore, `tips/${id}`);
    return deleteDoc(tipRef);
  }

  // Incrémenter ou décrémenter les likes de manière concurrente (safe)
  async likeTip(id: string, isLike: boolean) {
    const tipRef = doc(this.firestore, `tips/${id}`);
    return updateDoc(tipRef, { likes: increment(isLike ? 1 : -1) });
  }
}
