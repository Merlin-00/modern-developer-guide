import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, map, catchError, of } from 'rxjs';
import { ChatMessage } from '../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class IaChatbotService {
  private http = inject(HttpClient);

  private apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${environment.gemini.apiKey}`;

  sendMessage(history: ChatMessage[], newMessage: string): Observable<string> {
    // Format requis par l'API Gemini
    const contents = history.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Ajouter le nouveau message
    contents.push({
      role: 'user',
      parts: [{ text: newMessage }]
    });

    const body = {
      contents: contents,
      systemInstruction: {
        parts: [
          { text: "Tu es un expert développeur et un mentor très amical. Ton rôle est d'aider les débutants à comprendre la programmation moderne, Angular, TypeScript, et les concepts web. Sois concis, clair, utilise du formatage Markdown pour le code, et réponds en français de manière encourageante." }
        ]
      }
    };

    return this.http.post<any>(this.apiUrl, body).pipe(
      map(response => {
        if (response.candidates && response.candidates.length > 0) {
          return response.candidates[0].content.parts[0].text;
        }
        return "Désolé, je n'ai pas pu générer de réponse.";
      }),
      catchError(error => {
        console.error("Erreur API Gemini:", error);
        return of("Une erreur s'est produite lors de la connexion à l'IA. Veuillez vérifier votre clé API ou votre connexion.");
      })
    );
  }
}
