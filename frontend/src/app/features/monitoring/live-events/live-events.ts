import { AfterViewInit, Component, computed, inject, OnDestroy, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import * as L from 'leaflet';

import { WebSocketService } from '../../auth/services/web-socket.service';
import { FatigueEvent } from '../../../core/models/event.models';
import { FatigueLevel } from '../../../core/models/enums';
import { TimeAgoPipe } from '../../shared/pipes/time-ago-pipe';
import { Driver } from '../../../core/models/driver.models';
import { DriverService } from '../../shared/services/driver.service';

// We'll augment the FatigueEvent with optional driver details for the template
interface LiveFatigueEvent extends FatigueEvent {
  driver?: Driver;
}

@Component({
  selector: 'app-live-events',
  standalone: true,
  imports: [CommonModule, TimeAgoPipe],
  templateUrl: './live-events.html',
  styleUrl: './live-events.scss'
})
export class LiveEvents implements OnDestroy, AfterViewInit {
  private webSocketService = inject(WebSocketService);
  private driverService = inject(DriverService);
  private platformId = inject(PLATFORM_ID);
  private eventsSubscription: Subscription | undefined;

  // el cache de conductores
  private driversCache = new Map<string, Driver>();
  // el mapa
  private map!: L.Map;
  // los marcadores de los eventos en vivo
  private markers = new Map<string, L.Marker>();

  public FatigueLevel = FatigueLevel;
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
    // Don't subscribe to WebSocket events on the server
    if (isPlatformBrowser(this.platformId)) {
      this.eventsSubscription = this.webSocketService.fatigueEvent$.subscribe(newEvent => {
        if (newEvent) {
          this.addEventWithDriver(newEvent);
        }
      });
    }
  }

  ngAfterViewInit(): void {
    // Initialize the map only on the browser
    if (isPlatformBrowser(this.platformId)) {
      this.initMap();
    }
  }

  ngOnDestroy(): void {
    this.eventsSubscription?.unsubscribe();
    this.map?.remove();
  }

  private initMap(): void {
    this.map = L.map('live-map').setView([40.416775, -3.703790], 6); // Centered on Spain

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
  }

  private addEventWithDriver(event: FatigueEvent): void {
    const driverId = event.driverId;

    const processEvent = (driver?: Driver) => {
      const liveEvent: LiveFatigueEvent = { ...event, driver };
      this.events.update(currentEvents => [liveEvent, ...currentEvents].slice(0, 50));
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

    // For demonstration, we'll use random coordinates around Spain
    const lat = 40.416775 + (Math.random() - 0.5) * 4;
    const lng = -3.703790 + (Math.random() - 0.5) * 8;
    const location: L.LatLngTuple = [lat, lng];

    const icon = this.getIconForLevel(event.fatigueLevel);

    const marker = L.marker(location, { icon }).addTo(this.map)
      .bindPopup(`<b>${event.fatigueLevel}</b><br>${event.driver?.nombre || 'Conductor'}<br>${new Date(event.timestamp).toLocaleTimeString()}`);

    // Store marker to manage it later
    this.markers.set(event.id, marker);

    // Center map on the new event
    this.map.panTo(location);
  }

  private getIconForLevel(level: FatigueLevel): L.Icon {
    switch (level) {
      case FatigueLevel.ALTO:
        return L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });
      case FatigueLevel.MEDIO:
        return L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });
      case FatigueLevel.BAJO:
        return L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });
      default:
        return L.icon({ iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-icon.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });
    }
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
