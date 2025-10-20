# Documentación del Proyecto: Detector de Signos de Fatiga

## 1. Visión General

Este documento detalla la arquitectura, componentes y APIs del sistema de detección de fatiga. El objetivo del proyecto es proporcionar una solución integral para el monitoreo de la seguridad del conductor, desde la captura de datos en el vehículo hasta su análisis en una plataforma centralizada.

## 2. Arquitectura Detallada

El sistema consta de tres microservicios o componentes desacoplados que trabajan en conjunto.

### 2.1. Componente `edge` (Dispositivo en Vehículo)

Es el encargado de la captura y el análisis primario de datos.

- Tecnología: Python 3.8+
- Librerías principales:
  - OpenCV: Captura y procesamiento de video/imágenes.
  - dlib / haarcascade: Detección de rostro y landmarks (ojos y boca).
  - requests: Comunicación con la API REST del backend.
- Lógica implementada:
  1. `main.py`: Orquesta el flujo; inicia cámara y loop de inferencia.
  2. `drowsy_detector.py`: Detecta rostro, calcula EAR y apertura de boca para parpadeos/bostezos.
  3. `fatigue_analyzer.py`: Analiza métricas en ventana temporal y emite eventos de fatiga.
  4. `backend_client.py`: Construye `VehicleEventDTO` y hace POST al backend.

### 2.2. Componente `backend` (Servidor Central)

Núcleo del sistema donde reside la lógica de negocio y persistencia de datos.

- Tecnología: Java 17+, Spring Boot 3
- Arquitectura:
  - API RESTful para edge y frontend.
  - Capas: Controller, Service, Repository.
  - Seguridad: Spring Security + JWT.
  - Base de datos: Spring Data JPA (PostgreSQL 13+).
  - Tiempo real: Spring WebSocket para notificaciones al frontend.
- Paquetes clave (ejemplos):
  - `com.safetrack.controller`
  - `com.safetrack.service`
  - `com.safetrack.domain.entity`
  - `com.safetrack.repository`
  - `com.safetrack.security`
  - `com.safetrack.config` (incluye WebSocketConfig y SecurityConfig)

### 2.3. Componente `frontend` (Interfaz Web)

Interfaz para operadores y administradores del sistema.

- Tecnología: Angular 20.3.x, TypeScript 5.9.2
- Stack UI:
  - PrimeNG 20.1.2 y PrimeIcons 7.0.0
  - Tailwind CSS 3.4.17 (vía PostCSS)
  - ApexCharts 5.3.5 + ng-apexcharts 2.0.1
  - Leaflet 1.9.4 para mapas
- Tiempo real:
  - @stomp/stompjs 7.2.0 (cliente STOMP sobre WebSocket)
- Características:
  - Server-Side Rendering (SSR) habilitado con Express
  - Proxy de desarrollo para acceder al backend sin CORS
  - Arquitectura modular (core, features, shared)
- Módulos previstos:
  - `auth`: Autenticación y gestión de sesión
  - `dashboard`: Monitoreo en tiempo real
  - `management`: Conductores, vehículos, reglas
  - `analytics`: Reportes y KPIs
- Lógica transversal:
  - Servicio de autenticación (JWT en localStorage)
  - Interceptor JWT (Authorization: Bearer)
  - Guards de ruta (protección y redirecciones)

---

## 3. API REST (Backend)

Base URL: `http://localhost:8080`

La especificación completa de la API está disponible en Swagger/OpenAPI (ver sección "Documentación de API (Swagger)").

### 3.1. Autenticación (`/api/auth`)

- POST `/api/auth/login`
  - Request:
    ```json
    {"username":"admin","password":"password123"}
    ```
  - Response 200:
    ```json
    {"token":"<jwt>","type":"Bearer","username":"admin","roles":["ROLE_ADMIN","ROLE_USER"]}
    ```
- POST `/api/auth/register`
  - Request:
    ```json
    {"username":"operador1","email":"operador1@safetrack.com","password":"password123","roles":["user"]}
    ```
  - Response 200:
    ```json
    {"message":"User registered successfully!"}
    ```

### 3.2. Eventos de Vehículos (`/api/events`)

- POST `/api/events`
  - Descripción: El edge reporta eventos; se persisten y se publican por WebSocket.
  - Seguridad: JWT requerido.
  - Body (VehicleEventDTO):
    ```json
    {
      "vehicleId": 1,
      "driverId": 1,
      "timestamp": "2025-10-19T22:27:00Z",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "fatigueType": "DROWSINESS",
      "fatigueLevel": "HIGH",
      "confidence": 0.95
    }
    ```

### 3.3. Gestión (CRUD)

- Driver (`/api/drivers`): GET (lista y por id), POST, PUT, DELETE
- Vehicle (`/api/vehicles`): GET (lista y por id), POST, PUT, DELETE
- Rule (`/api/rules`): GET (lista y por id), POST, PUT, DELETE

### 3.4. Analíticas (`/api/analytics`)

- GET `/api/analytics/events`
  - Query params: `driverId`, `vehicleId`, `startDate`, `endDate`
  - Response (ejemplo):
    ```json
    {
      "totalEvents": 1520,
      "eventsByType": {"DROWSINESS": 800, "YAWN": 600, "EYE_CLOSURE": 120},
      "eventsByRiskLevel": {"LOW": 900, "MEDIUM": 400, "HIGH": 220}
    }
    ```

### 3.5. Ejemplos de Paginación (Eventos)

#### GET `/api/v1/events/search`

- Parámetros de consulta (query):
  - `filter.startDate` (YYYY-MM-DD)
  - `filter.endDate` (YYYY-MM-DD)
  - `filter.driverId` (UUID)
  - `filter.vehicleId` (UUID)
  - `filter.fatigueLevel` (NINGUNO|BAJO|MEDIO|ALTO)
  - `pageable.page` (0..N), `pageable.size` (1..100), `pageable.sort` (ej: `timestamp,desc`)

- Ejemplo de respuesta paginada (200 OK):

```json
{
  "content": [
    {
      "id": "fa79e284-13b0-4753-b12e-037e44880b9c",
      "driverId": "ac666564-57a9-435b-a0b4-d6c753be74ae",
      "vehicleId": "b736f732-b7ca-4515-b2c4-d1ad9ee01084",
      "timestamp": "2025-10-13T22:11:10.834101Z",
      "fatigueLevel": "ALTO",
      "fatigueType": "MICROSUEÑO",
      "eyeClosureDuration": 1.5,
      "yawnCount": 0,
      "blinkRate": 0.2,
      "driverName": "Carlos Vargas",
      "vehicleIdentifier": "RTX-3090"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": {
      "empty": false,
      "unsorted": false,
      "sorted": true
    },
    "offset": 0,
    "unpaged": false,
    "paged": true
  },
  "totalPages": 4,
  "totalElements": 68,
  "last": false,
  "size": 20,
  "number": 0,
  "sort": {
    "empty": false,
    "unsorted": false,
    "sorted": true
  },
  "numberOfElements": 20,
  "first": true,
  "empty": false
}
```

- Ejemplos de uso (query strings):
  - `GET /api/v1/events/search?filter.startDate=2025-10-01&filter.endDate=2025-10-31&pageable.page=0&pageable.size=20&pageable.sort=timestamp,desc`
  - `GET /api/v1/events/search?filter.driverId=ac666564-57a9-435b-a0b4-d6c753be74ae&pageable.page=1&pageable.size=10`

### 3.6. Ejemplos adicionales

#### GET `/api/v1/analytics/top-drivers`
- `?startDate=2025-01-01&endDate=2025-01-31`
- Respuesta (200 OK):
```json
[
  { "driverId": "ac666564-57a9-435b-a0b4-d6c753be74ae", "driverName": "Carlos Vargas", "alertCount": 42 },
  { "driverId": "7866307e-a910-4b90-8421-f1a60777ea29", "driverName": "Sofía Rodríguez", "alertCount": 31 }
]
```

#### GET `/api/v1/vehicles?filter.placa=RTX-3090&pageable.page=0&pageable.size=5`
- Respuesta (200 OK):
```json
[
  { "id": "b736f732-b7ca-4515-b2c4-d1ad9ee01084", "placa": "RTX-3090", "marca": "MarcaX", "modelo": "ModeloY", "anio": 2024, "activo": true }
]
```

#### GET `/api/v1/analytics/fleet-summary`
- Parámetros (query):
  - `startDate` (YYYY-MM-DD, opcional)
  - `endDate` (YYYY-MM-DD, opcional)
  - `pageable.page` (0..N)
  - `pageable.size` (1..100)
  - `pageable.sort` (campo,orden) — ej: `fatigueCount,desc`

- Ejemplo de petición:
```
GET /api/v1/analytics/fleet-summary?startDate=2025-10-01&endDate=2025-10-31&pageable.page=0&pageable.size=10&pageable.sort=fatigueCount,desc
```

- Ejemplo de respuesta (200 OK):
```json
{
  "content": [
    {
      "driverId": "ac666564-57a9-435b-a0b4-d6c753be74ae",
      "driverName": "Carlos Vargas",
      "vehicleIdentifier": "RTX-3090",
      "fatigueCount": 42,
      "distractionCount": 7,
      "criticalEventsCount": 5,
      "riskScore": "ALTO"
    },
    {
      "driverId": "7866307e-a910-4b90-8421-f1a60777ea29",
      "driverName": "Sofía Rodríguez",
      "vehicleIdentifier": "RX-7900",
      "fatigueCount": 31,
      "distractionCount": 4,
      "criticalEventsCount": 2,
      "riskScore": "MEDIO"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10,
    "sort": { "empty": false, "unsorted": false, "sorted": true },
    "offset": 0, "unpaged": false, "paged": true
  },
  "totalPages": 3,
  "totalElements": 25,
  "last": false,
  "size": 10,
  "number": 0,
  "sort": { "empty": false, "unsorted": false, "sorted": true },
  "numberOfElements": 10,
  "first": true,
  "empty": false
}
```

- Variantes de consulta:
  - `GET /api/v1/analytics/fleet-summary?pageable.page=1&pageable.size=20`
  - `GET /api/v1/analytics/fleet-summary?startDate=2025-10-10&endDate=2025-10-20&pageable.sort=criticalEventsCount,desc`

#### GET `/api/v1/analytics/critical-events-timeline`
- Parámetros (query):
  - `startDate` (YYYY-MM-DD, opcional)
  - `endDate` (YYYY-MM-DD, opcional)

- Ejemplo de petición:
```
GET /api/v1/analytics/critical-events-timeline?startDate=2025-10-01&endDate=2025-10-07
```

- Ejemplo de respuesta (200 OK):
```json
[
  { "date": "2025-10-01", "count": 3 },
  { "date": "2025-10-02", "count": 5 },
  { "date": "2025-10-03", "count": 2 },
  { "date": "2025-10-04", "count": 6 },
  { "date": "2025-10-05", "count": 4 },
  { "date": "2025-10-06", "count": 7 },
  { "date": "2025-10-07", "count": 3 }
]
```

---

## 12. Documentación de API (Swagger)

- UI: http://localhost:8080/swagger-ui/index.html
- JSON: http://localhost:8080/v3/api-docs
- YAML: http://localhost:8080/v3/api-docs.yaml

Guía rápida JWT en Swagger UI:
- Pulsar "Authorize"
- Seleccionar esquema "Bearer"
- Ingresar: `Bearer <token>`
- Probar endpoints protegidos

## 13. Documentación Específica
- README principal: ./README.md
- Documentación general: ./DOCUMENTACION.md
- Backend: ./backend/README.md
- Frontend: ./frontend/README.md
- Edge (Python): ./sanchez_polo_drowsy/README.md

---

Última actualización: 19 de octubre de 2025