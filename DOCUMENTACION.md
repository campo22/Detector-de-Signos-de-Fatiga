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

## 4. Tiempo Real (WebSockets)

- Endpoint: `ws://localhost:8080/ws`
- Topic: `/topic/fatigue-events`
- Frontend: Conexión con `@stomp/stompjs` y actualización del dashboard en tiempo real.

## 5. Requisitos del Sistema

### 5.1. Software
- Python 3.8+
- Java 17+
- Node.js 18+
- PostgreSQL 13+
- Angular CLI 20.3.2

### 5.2. Hardware (recomendado)
- Edge: Raspberry Pi 4+ o equivalente con cámara
- Backend: ≥4GB RAM, 2 vCPU
- DB: ≥2GB RAM dedicados

## 6. Configuración de Entorno

### 6.1. Edge (Python)
```bash
cd sanchez_polo_drowsy
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

### 6.2. Backend (Spring Boot)
```bash
cd backend
./mvnw install
./mvnw spring-boot:run
```

### 6.3. Frontend (Angular)
```bash
cd frontend
npm install
ng serve --proxy-config proxy.conf.json  # http://localhost:4200
```

### 6.4. WebSocket en Frontend (Angular)
- Servicio `RealtimeService` con `@stomp/stompjs` para conectarse a `ws://localhost:8080/ws` y suscribirse a `/topic/fatigue-events` (ver ejemplo en frontend/README.md).

## 7. Ejecución

### 7.1. Desarrollo
```bash
# Backend
cd backend && ./mvnw spring-boot:run

# Frontend
cd frontend && ng serve --proxy-config proxy.conf.json

# Edge
cd sanchez_polo_drowsy && source venv/bin/activate && python main.py
```

### 7.2. Producción
```bash
# Frontend (SSR opcional)
cd frontend && npm run build
# SSR: npm run serve:ssr:frontend

# Backend (perfil prod)
cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=prod
```

## 8. Modelo de Datos (ejemplos)

### Driver
```json
{"id":1,"name":"Juan Pérez","licenseNumber":"ABC123456","email":"juan.perez@empresa.com","phone":"+34 600 123 456","status":"ACTIVE","createdAt":"2025-10-19T22:27:00Z"}
```

### Vehicle
```json
{"id":1,"plateNumber":"1234-ABC","model":"Mercedes Sprinter","year":2023,"edgeDeviceId":"edge-001","status":"ACTIVE","lastLocation":{"latitude":40.7128,"longitude":-74.0060}}
```

### VehicleEvent
```json
{"id":1,"vehicleId":1,"driverId":1,"timestamp":"2025-10-19T22:27:00Z","latitude":40.7128,"longitude":-74.0060,"fatigueType":"DROWSINESS","fatigueLevel":"HIGH","confidence":0.95,"processed":false}
```

## 9. Seguridad

- JWT con expiración configurable (por defecto 24h)
- Roles: ADMIN, OPERATOR, VIEWER
- HTTPS/WSS en producción; CORS restringido
- El esquema Bearer JWT está documentado en la especificación OpenAPI y puede probarse desde Swagger UI usando el botón "Authorize".

## 10. Observabilidad

- Backend: Spring Boot Actuator (métricas/health)
- Edge: logs rotativos locales
- Frontend: manejo de errores y trazas básicas

## 11. Despliegue

- Docker por componente; Docker Compose para desarrollo
- Kubernetes para escalado en producción
- CI/CD con GitHub Actions, pruebas unitarias/integración y quality gates (SonarQube)

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
