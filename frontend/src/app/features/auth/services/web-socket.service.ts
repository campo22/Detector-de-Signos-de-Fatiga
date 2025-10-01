import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import { Subject } from 'rxjs';
import { FatigueEvent } from '../../../core/models/event.models';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  private stompClient: Client;

  // Subject para emitir eventos
  private fatigueEventSubject = new Subject<FatigueEvent>();


  public fatigueEvent$ = this.fatigueEventSubject.asObservable();

  constructor() {
    // crear la instancia de Stomp
    this.stompClient = new Client({

      brokerURL: environment.websocketUrl,

      debug: (str) => {
        console.log(new Date(), str);

      },
      // intentar reconectar cada 5 segundos si la conexión se cierra
      reconnectDelay: 5000,
    });

    this.stompClient.onConnect = (freame) => {
      console.log('Conectado al servidor WebSocket', freame);

      // suscribirse al topic
      this.stompClient.subscribe('/topic/vehicle-event', (message: IMessage) => {

        // convertir el mensaje en un objeto FatigueEvent
        const event = JSON.parse(message.body) as FatigueEvent;
        // emitir el evento
        this.fatigueEventSubject.next(event);
      });

    };


    // Manejadores de errores
    this.stompClient.onStompError = (frame) => {
      console.error('Error en el protocolo STOMP:', frame);
    };

    this.stompClient.onWebSocketError = (event) => {
      console.error('Error en el WebSocket:', event);
    };
  }



  public connect(): void {
    // si no estamos conectados, activar la conexión
    if (!this.stompClient.active) {
      this.stompClient.activate();
    }
  }

  // Método para cerrar la conexión cuando ya no la necesitemos (ej. al hacer logout).
  public disconnect(): void {
    if (this.stompClient.active) {
      this.stompClient.deactivate();
    }
  }




}


