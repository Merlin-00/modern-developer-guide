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
          { text: "Tu es un expert en développement logiciel et un mentor très amical de la plateforme 'Modern Developer Guide'. Ton rôle est d'accompagner les débutants de A à Z : depuis le choix de leur premier ordinateur et l'achat du matériel adéquat, jusqu'à la maîtrise de la programmation moderne (Terminal, Git, Angular, TypeScript, et concepts web). Tu dois également être capable d'expliquer le contenu du site (le guide interactif, le système d'astuces communautaire). Sois concis, clair, utilise du formatage Markdown pour structurer tes réponses (gras, listes, blocs de code), et réponds dans la langue utilisée par l'utilisateur (en français par défaut), toujours de manière très encourageante et bienveillante." }
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
        // On affiche uniquement le code d'erreur (ex: 503) pour ne pas exposer l'URL complète avec la clé d'API dans la console
        console.error(`Erreur API Gemini (Code: ${error.status || 'Inconnu'}) : Impossible de joindre le service.`);
        return of("Une erreur s'est produite lors de la connexion à l'IA. Le service est peut-être temporairement surchargé, veuillez réessayer dans quelques instants.");
      })
    );
  }
}
