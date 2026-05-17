import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, deleteDoc, updateDoc, query, orderBy, serverTimestamp } from '@angular/fire/firestore';
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
}

@Injectable({
  providedIn: 'root'
})
export class TipService {
  private firestore: Firestore = inject(Firestore);
  private tipsCollection = collection(this.firestore, 'tips');

  // Récupérer toutes les astuces, triées par date de création (les plus récentes en premier)
  getTips(): Observable<Tip[]> {
    const q = query(this.tipsCollection, orderBy('createdAt', 'desc'));
    // idField: 'id' ajoute automatiquement l'ID du document à l'objet retourné
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

  // Mettre à jour une astuce (ex: pour les likes ou la modification)
  async updateTip(id: string, data: Partial<Tip>) {
    const tipRef = doc(this.firestore, `tips/${id}`);
    return updateDoc(tipRef, data);
  }

  // Supprimer une astuce
  async deleteTip(id: string) {
    const tipRef = doc(this.firestore, `tips/${id}`);
    return deleteDoc(tipRef);
  }

  // Incrémenter les likes
  async likeTip(id: string, currentLikes: number) {
    const tipRef = doc(this.firestore, `tips/${id}`);
    return updateDoc(tipRef, { likes: currentLikes + 1 });
  }
}
