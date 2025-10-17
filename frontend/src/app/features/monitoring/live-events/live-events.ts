import { AfterViewInit, Component, computed, inject, OnDestroy, OnInit, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import * as L from 'leaflet';

import { WebSocketService } from '../../auth/services/web-socket.service';
import { FatigueEvent } from '../../../core/models/event.models';
import { FatigueLevel, FatigueType } from '../../../core/models/enums';
import { TimeAgoPipe } from '../../shared/pipes/time-ago-pipe';
import { Driver } from '../../../core/models/driver.models';
import { DriverService } from '../../shared/services/driver.service';
import { EventService } from '../../shared/services/event.service';

// Aumentamos FatigueEvent con detalles opcionales del conductor para la plantilla
interface LiveFatigueEvent extends FatigueEvent {
  driver?: Driver;
  isNewCritical?: boolean;
}

@Component({
  selector: 'app-live-events',
  standalone: true,
  imports: [CommonModule, TimeAgoPipe],
  templateUrl: './live-events.html',
  styleUrl: './live-events.scss'
})
export class LiveEvents implements OnDestroy, AfterViewInit, OnInit {
  private webSocketService = inject(WebSocketService);
  private driverService = inject(DriverService);
  private eventService = inject(EventService);
  private platformId = inject(PLATFORM_ID);
  private eventsSubscription: Subscription | undefined;

  // el cache de conductores
  private driversCache = new Map<string, Driver>();
  // el mapa
  private map!: L.Map;
  // los marcadores de los eventos en vivo
  private markers = new Map<string, L.Marker>();

  public FatigueLevel = FatigueLevel;
  public FatigueType = FatigueType;
  public events = signal<LiveFatigueEvent[]>([]);

  public selectedFilter = signal<FatigueLevel | 'ALL'>('ALL');

  public filteredEvents = computed(() => {
    const events = this.events();
    const filter = this.selectedFilter();

    // actualizar la visibilidad de los marcadores
    this.updateMarkersVisibility(events, filter);

    if (filter === 'ALL') {
      return events;
    }
    return events.filter(event => event.fatigueLevel === filter);
  });

  constructor() {
    // No suscribirse a eventos de WebSocket en el servidor
    if (isPlatformBrowser(this.platformId)) {
      this.eventsSubscription = this.webSocketService.fatigueEvent$.subscribe(newEvent => {
        if (newEvent) {
          this.addEventWithDriver(newEvent, true);
        }
      });
    }
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadInitialEvents();
    }
  }

  ngAfterViewInit(): void {
    // Inicializar el mapa solo en el navegador
    if (isPlatformBrowser(this.platformId)) {
      this.initMap();
    }
  }

  ngOnDestroy(): void {
    this.eventsSubscription?.unsubscribe();
    this.map?.remove();
  }

  private initMap(): void {
    this.map = L.map('live-map').setView([4.5709, -74.2973], 6); // Centrado en Colombia

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
  }

  private loadInitialEvents(): void {
    this.eventService.searchEvents({}, 0, 20).subscribe(page => {
      const initialEvents = page.content;
      // Revertir para procesar los más antiguos primero y mantener el orden al agregar
      initialEvents.reverse().forEach(event => this.addEventWithDriver(event, false));
    });
  }

  private addEventWithDriver(event: FatigueEvent, prepend = true): void {
    const driverId = event.driverId;

    const processEvent = (driver?: Driver) => {
      const liveEvent: LiveFatigueEvent = { ...event, driver };

      if (prepend) {
        if (event.fatigueType === FatigueType.MICROSUEÑO) {
          liveEvent.isNewCritical = true;
        }
        this.events.update(currentEvents => [liveEvent, ...currentEvents].slice(0, 50));
      } else {
        this.events.update(currentEvents => [...currentEvents, liveEvent]);
      }

      this.addEventMarker(liveEvent);
    };

    if (this.driversCache.has(driverId)) {
      processEvent(this.driversCache.get(driverId)!);
    } else {
      this.driverService.getDriverById(driverId).subscribe(driver => {
        this.driversCache.set(driverId, driver);
        processEvent(driver);
      });
    }
  }

  private addEventMarker(event: LiveFatigueEvent): void {
    if (!this.map) return;

    // Para demostración, usamos coordenadas aleatorias alrededor de Colombia
    const lat = 4.5709 + (Math.random() - 0.5) * 4;
    const lng = -74.2973 + (Math.random() - 0.5) * 8;
    const location: L.LatLngTuple = [lat, lng];

    const icon = this.getIconForLevel(event.fatigueLevel, event.isNewCritical);

    const marker = L.marker(location, { icon }).addTo(this.map)
      .bindPopup(`<b>Nivel:</b> ${event.fatigueLevel}<br><b>Tipo:</b> ${event.fatigueType}<br><b>Conductor:</b> ${event.driver?.nombre || 'Desconocido'}<br><b>Hora:</b> ${new Date(event.timestamp).toLocaleTimeString()}`, {
        className: 'custom-popup'
      });

    // Guardar marcador para gestionarlo más tarde
    this.markers.set(event.id, marker);

    // Centrar el mapa en el nuevo evento con una animación suave
    this.map.flyTo(location, 10);
  }

  private getIconForLevel(level: FatigueLevel, isNewCritical = false): L.Icon {
    let iconUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-icon.png';
    switch (level) {
      case FatigueLevel.ALTO:
        iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png';
        break;
      case FatigueLevel.MEDIO:
        iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png';
        break;
      case FatigueLevel.BAJO:
        iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png';
        break;
    }

    return L.icon({
      iconUrl,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
      className: isNewCritical ? 'blinking-marker' : ''
    });
  }

  private updateMarkersVisibility(events: LiveFatigueEvent[], filter: FatigueLevel | 'ALL'): void {
    if (!this.map) return;

    const filteredIds = new Set(
      (filter === 'ALL' ? events : events.filter(e => e.fatigueLevel === filter)).map(e => e.id)
    );

    this.markers.forEach((marker, eventId) => {
      if (filteredIds.has(eventId)) {
        if (!this.map.hasLayer(marker)) {
          marker.addTo(this.map);
        }
      } else {
        if (this.map.hasLayer(marker)) {
          this.map.removeLayer(marker);
        }
      }
    });
  }

  setFilter(level: FatigueLevel | 'ALL'): void {
    this.selectedFilter.set(level);
  }
}
