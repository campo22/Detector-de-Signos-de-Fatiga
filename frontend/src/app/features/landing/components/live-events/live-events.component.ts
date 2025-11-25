import { Component, OnInit, OnDestroy } from '@angular/core';

interface LiveEvent {
  id: number;
  level: 'Alto' | 'Medio' | 'Bajo';
  eventType: string;
  driver: string;
  vehicle: string;
  timeAgo: string;
  timeAgoMs: number;
  severity: 'destructive' | 'warning' | 'success';
}

@Component({
  selector: 'app-live-events',
  standalone: true,
  template: `
    <div class="bg-slate-800/80 rounded-lg border border-slate-700 flex flex-col h-full">
      <!-- Header -->
      <div class="p-3 border-b border-slate-700">
        <h3 class="font-bold text-white flex items-center text-sm">
          <span class="material-symbols-outlined text-landing-primary mr-2 text-base">rss_feed</span>
          Eventos en Vivo
        </h3>
        <p class="text-slate-500 text-xs mt-1">Alertas de fatiga y distracción en tiempo real.</p>
      </div>

      <!-- Event List -->
      <div class="flex-1 overflow-y-auto p-2" style="max-height: 300px;">
        <div class="space-y-3">
          @for (event of liveEvents; track event.id) {
            <div 
              class="bg-opacity-50 py-3 px-2 sm:px-3 rounded-lg border-l-4 shadow-sm hover:bg-opacity-70 transition-all duration-300 cursor-pointer relative overflow-hidden group"
              [class.bg-red-900/20]="event.severity === 'destructive'"
              [class.bg-yellow-900/20]="event.severity === 'warning'"
              [class.bg-green-900/20]="event.severity === 'success'"
              [class.border-red-500]="event.severity === 'destructive'"
              [class.border-yellow-500]="event.severity === 'warning'"
              [class.border-green-500]="event.severity === 'success'"
            >
              <div class="relative z-10">
                <div class="flex flex-col sm:flex-row justify-between items-start mb-1">
                  <div class="flex flex-col sm:flex-row items-start sm:items-center">
                    <span 
                      class="px-2 py-0.5 text-xs font-bold rounded-full text-white uppercase tracking-wide"
                      [class.bg-red-500]="event.severity === 'destructive'"
                      [class.bg-yellow-500]="event.severity === 'warning'"
                      [class.bg-green-500]="event.severity === 'success'"
                    >
                      {{ event.level }}
                    </span>
                    <p 
                      class="ml-2 text-xs font-semibold"
                      [class.text-red-400]="event.severity === 'destructive'"
                      [class.text-yellow-400]="event.severity === 'warning'"
                      [class.text-green-400]="event.severity === 'success'"
                    >
                      {{ event.eventType }}
                    </p>
                  </div>
                  <p class="text-xs text-slate-500 font-mono">{{ event.timeAgo }}</p>
                </div>
                <div class="flex flex-wrap items-center text-xs">
                  <span class="material-symbols-outlined mr-1 text-slate-400 text-xs">person</span>
                  <p class="text-slate-300 font-semibold">{{ event.driver }}</p>
                  <span class="material-symbols-outlined mx-2 text-slate-400 text-xs">local_shipping</span>
                  <p class="text-slate-400">{{ event.vehicle }}</p>
                </div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Footer -->
      <div class="p-2 border-t border-slate-700 text-center">
        <a class="text-xs font-semibold text-landing-primary hover:text-landing-primary-focus transition-colors duration-300 flex items-center justify-center" href="#">
          Ver todas las alertas
          <span class="material-symbols-outlined ml-1 text-xs">arrow_forward</span>
        </a>
      </div>
    </div>
  `
})
export class LiveEventsComponent implements OnInit, OnDestroy {
  liveEvents: LiveEvent[] = [];
  private liveEventsInterval: any;

  ngOnInit() {
    // Iniciar la simulación de eventos en vivo
    this.startLiveEventsSimulation();

    // Agregar algunos eventos iniciales para que no esté vacío al inicio
    this.addLiveEvent();
    this.addLiveEvent();
    this.addLiveEvent();
  }

  ngOnDestroy() {
    if (this.liveEventsInterval) {
      clearInterval(this.liveEventsInterval);
    }
  }

  private startLiveEventsSimulation() {
    // Simular nuevos eventos cada 2 segundos para mostrar constantemente llegada de eventos
    this.liveEventsInterval = setInterval(() => {
      this.addLiveEvent();

      // Eliminar eventos antiguos (mantener los 6 más recientes)
      if (this.liveEvents.length > 6) {
        this.liveEvents = this.liveEvents.slice(0, 6);
      }
    }, 2000);
  }

  private addLiveEvent() {
    const eventTypes: { type: string; severity: 'destructive' | 'warning' | 'success'; level: 'Alto' | 'Medio' | 'Bajo' }[] = [
      { type: 'Microsueño Detectado', severity: 'destructive', level: 'Alto' },
      { type: 'Distracción Severa', severity: 'destructive', level: 'Alto' },
      { type: 'Bostezo Frecuente', severity: 'warning', level: 'Medio' },
      { type: 'Uso de Celular', severity: 'warning', level: 'Medio' },
      { type: 'Pestañeo Lento', severity: 'success', level: 'Bajo' },
      { type: 'Bostezo', severity: 'success', level: 'Bajo' },
      { type: 'Cabeceo', severity: 'destructive', level: 'Alto' },
      { type: 'Falla en Concentración', severity: 'warning', level: 'Medio' }
    ];

    const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const drivers = ['Juan Pérez', 'María Rodríguez', 'Luis Hernández', 'Carlos Gómez', 'Ana Martínez', 'Pedro Sánchez'];
    const vehicles = ['Camión-01A', 'Van-03B', 'Camión-08D', 'Camión-05C', 'Bus-02A', 'Tracto-12E'];

    const newEvent: LiveEvent = {
      id: Date.now(), // Usar timestamp como ID único
      level: randomEvent.level,
      eventType: randomEvent.type,
      driver: drivers[Math.floor(Math.random() * drivers.length)],
      vehicle: vehicles[Math.floor(Math.random() * vehicles.length)],
      timeAgo: 'Hace 0s',
      timeAgoMs: Date.now(),
      severity: randomEvent.severity
    };

    // Agregar al inicio del array (eventos nuevos arriba)
    this.liveEvents = [newEvent, ...this.liveEvents];

    // Mantener solo los últimos 6 eventos
    if (this.liveEvents.length > 6) {
      this.liveEvents = this.liveEvents.slice(0, 6);
    }

    // Actualizar el tiempo transcurrido cada segundo
    this.updateTimeAgo();
  }

  private updateTimeAgo() {
    const now = Date.now();
    this.liveEvents.forEach(event => {
      const seconds = Math.floor((now - event.timeAgoMs) / 1000);
      
      if (seconds < 60) {
        event.timeAgo = `Hace ${seconds}s`;
      } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        event.timeAgo = `Hace ${minutes}m`;
      } else {
        const hours = Math.floor(seconds / 3600);
        event.timeAgo = `Hace ${hours}h`;
      }
    });
  }
}