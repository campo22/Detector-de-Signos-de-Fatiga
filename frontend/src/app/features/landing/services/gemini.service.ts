import { Injectable } from '@angular/core';
import { GoogleGenAI, Chat } from '@google/genai';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI | undefined;
  private chat: Chat | undefined;
  private isConfigured = false;

  constructor() {
    if (environment.geminiApiKey) {
      this.isConfigured = true;
      this.ai = new GoogleGenAI({ apiKey: environment.geminiApiKey });
      this.chat = this.ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: `You are a friendly and helpful assistant for SafeTrack, a company that provides AI-powered driver fatigue detection for fleets. Your goal is to answer questions about the company, its products, and its benefits. Be concise and professional.`,
        },
      });
    } else {
      console.warn('Gemini API Key is not configured. The chatbot functionality will be disabled.');
    }
  }

  async sendMessage(message: string): Promise<string> {
    if (!this.isConfigured || !this.chat) {
      return 'Lo siento, el chatbot no está configurado actualmente. Por favor, póngase en contacto con el soporte técnico.';
    }

    try {
      const response = await this.chat.sendMessage({ message });
      if (response.text) { 
        return response.text;
      } else {
        console.error('Gemini API returned an empty response text.');
        return 'Lo siento, la API de Gemini no ha devuelto una respuesta de texto.';
      }
    } catch (error) {
      console.error('Error sending message to Gemini:', error);
      return 'Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.';
    }
  }
}
