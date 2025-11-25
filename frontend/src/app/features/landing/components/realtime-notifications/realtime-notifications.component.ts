import { Component, OnInit, OnDestroy } from '@angular/core';

interface Notification {
  id: number;
  type: 'fatiga' | 'distraccion' | 'microsueño' | 'riesgo';
  message: string;
  time: string;
  severity: 'high' | 'medium' | 'low';
}

@Component({
  selector: 'app-realtime-notifications',
  standalone: true,
  template: `
    <div class="flex flex-col gap-3 max-h-60 overflow-y-auto pr-2">
      <!-- Contenedor de notificaciones -->
      @for (notification of notifications; track notification.id) {
        <div 
          class="notification-item animate-slide-in p-3 rounded-lg border-l-4 text-white text-xs transition-all duration-300"
          [class.bg-red-900/30]="notification.severity === 'high'"
          [class.bg-yellow-900/30]="notification.severity === 'medium'"
          [class.bg-blue-900/30]="notification.severity === 'low'"
          [class.border-red-500]="notification.type === 'fatiga'"
          [class.border-yellow-500]="notification.type === 'distraccion'"
          [class.border-blue-500]="notification.type === 'microsueño'"
          [class.border-purple-500]="notification.type === 'riesgo'"
        >
          <div class="flex justify-between items-start">
            <div class="flex items-center gap-2">
              <div 
                class="w-2 h-2 rounded-full animate-ping"
                [class.bg-red-500]="notification.type === 'fatiga'"
                [class.bg-yellow-500]="notification.type === 'distraccion'"
                [class.bg-blue-500]="notification.type === 'microsueño'"
                [class.bg-purple-500]="notification.type === 'riesgo'"
              ></div>
              <span 
                class="font-medium"
                [class.text-red-400]="notification.type === 'fatiga'"
                [class.text-yellow-400]="notification.type === 'distraccion'"
                [class.text-blue-400]="notification.type === 'microsueño'"
                [class.text-purple-400]="notification.type === 'riesgo'"
              >
                {{ getNotificationTitle(notification.type) }}
              </span>
            </div>
            <span class="text-slate-500">{{ notification.time }}</span>
          </div>
          <div class="mt-1 text-slate-300">{{ notification.message }}</div>
        </div>
      }
    </div>
  `,
  styles: [`
    .animate-slide-in {
      animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    /* Estilos para el scrollbar */
    ::-webkit-scrollbar {
      width: 6px;
    }
    
    ::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 3px;
    }
    
    ::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 3px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  `]
})
export class RealtimeNotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private notificationInterval: any;
  private idCounter = 0;

  notificationMessages = {
    'fatiga': [
      'Conductor muestra signos de fatiga extrema',
      'Riesgo de microsueño detectado',
      'Nivel de alerta por fatiga: CRÍTICO',
      'Conductor ha estado conduciendo por más de 4 horas'
    ],
    'distraccion': [
      'Conductor distraído manipulando teléfono',
      'Desvío de atención detectado',
      'Conductor no mantiene línea de visión en carretera',
      'Posible peligro detectado'
    ],
    'microsueño': [
      'Microsueño detectado (0.5 segundos)',
      'Cierre de ojos prolongado detectado',
      'Pérdida momentánea de atención',
      'Conductor en estado de somnolencia'
    ],
    'riesgo': [
      'Aceleración brusca detectada',
      'Frenada repentina detectada',
      'Cambio de carril inadecuado',
      'Velocidad inadecuada para condiciones'
    ]
  };

  ngOnInit() {
    // Iniciar la simulación de notificaciones entrando
    this.startNotificationSimulation();

    // Agregar algunas notificaciones iniciales para que no esté vacío al inicio
    this.addRandomNotification();
    this.addRandomNotification();
    this.addRandomNotification();
  }

  ngOnDestroy() {
    if (this.notificationInterval) {
      clearInterval(this.notificationInterval);
    }
  }

  private startNotificationSimulation() {
    // Iniciar notificaciones cada 1.5 segundos
    this.notificationInterval = setInterval(() => {
      this.addRandomNotification();
    }, 1500);
  }

  private addRandomNotification() {
    const types: Array<keyof typeof this.notificationMessages> = ['fatiga', 'distraccion', 'microsueño', 'riesgo'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    const randomMessage = this.notificationMessages[randomType][
      Math.floor(Math.random() * this.notificationMessages[randomType].length)
    ];
    
    const severity = this.getSeverityByType(randomType);
    
    // Crear un nuevo objeto de notificación con el tiempo actual
    const newNotification: Notification = {
      id: this.idCounter++,
      type: randomType,
      message: randomMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      severity: severity
    };
    
    // Agregar al inicio del array (notificaciones nuevas arriba)
    this.notifications = [newNotification, ...this.notifications];
    
    // Mantener solo las últimas 8 notificaciones
    if (this.notifications.length > 8) {
      this.notifications = this.notifications.slice(0, 8);
    }
  }

  private getSeverityByType(type: string): 'high' | 'medium' | 'low' {
    if (type === 'fatiga') return 'high';
    if (type === 'microsueño') return 'high';
    if (type === 'distraccion') return 'medium';
    return 'medium';
  }

  getNotificationTitle(type: string): string {
    switch (type) {
      case 'fatiga': return 'FATIGA';
      case 'distraccion': return 'DISTRAÍDO';
      case 'microsueño': return 'MICROSUEÑO';
      case 'riesgo': return 'RIESGO';
      default: return type.toUpperCase();
    }
  }
}