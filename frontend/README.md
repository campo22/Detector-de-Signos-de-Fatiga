# Frontend

This project was generated using Angular CLI 20.3.2.

## Development server

To start a local development server:

```bash
ng serve --proxy-config proxy.conf.json
```

Then open `http://localhost:4200/`.

## WebSocket (STOMP) quick start

Example service snippet to subscribe to fatigue events in real time:

```ts
// app/core/services/realtime.service.ts
import { Injectable, inject } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';

@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private client = new Client({ brokerURL: 'ws://localhost:8080/ws' });
  private sub?: StompSubscription;

  connect(onEvent: (msg: any) => void) {
    this.client.onConnect = () => {
      this.sub = this.client.subscribe('/topic/fatigue-events', (message: IMessage) => {
        onEvent(JSON.parse(message.body));
      });
    };
    this.client.activate();
  }

  disconnect() {
    this.sub?.unsubscribe();
    this.client.deactivate();
  }
}
```

Use it from a component:

```ts
// app/features/dashboard/dashboard.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RealtimeService } from '../../core/services/realtime.service';

@Component({
  selector: 'app-dashboard',
  template: `<div>Eventos: {{ events.length }}</div>`
})
export class DashboardComponent implements OnInit, OnDestroy {
  events: any[] = [];
  constructor(private rt: RealtimeService) {}
  ngOnInit() { this.rt.connect(e => this.events = [e, ...this.events]); }
  ngOnDestroy() { this.rt.disconnect(); }
}
```

## Code scaffolding

Generate a new component:

```bash
ng generate component component-name
```

For a list of schematics:

```bash
ng generate --help
```

## Building

```bash
ng build
```

## Running unit tests

```bash
ng test
```

## End-to-end tests

```bash
ng e2e
```
