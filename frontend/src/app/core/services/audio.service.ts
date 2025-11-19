import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audioContext: AudioContext | null = null;

  constructor() {
    // Inicializar AudioContext después de una interacción del usuario es una buena práctica,
    // pero para este caso lo inicializamos aquí. Los navegadores pueden bloquearlo hasta un gesto del usuario.
    try {
      this.audioContext = new AudioContext();
    } catch (e) {
      console.error('Web Audio API is not supported in this browser');
    }
  }

  playNotificationSound(): void {
    if (!this.audioContext) {
      return;
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Configuración del sonido (un "bip" simple)
    oscillator.type = 'sine'; // Onda sinusoidal
    oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime); // Tono (A4)
    gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime); // Volumen

    // Iniciar y detener el sonido
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.2); // Duración de 0.2 segundos
  }
}
