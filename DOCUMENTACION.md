# Documentación del Proyecto: Detector de Signos de Fatiga

## 1. Visión General

Este documento detalla la arquitectura, componentes y APIs del sistema de detección de fatiga. El objetivo del proyecto es proporcionar una solución integral para el monitoreo de la seguridad del conductor, desde la captura de datos en el vehículo hasta su análisis en una plataforma centralizada.

## 2. Arquitectura Detallada

El sistema consta de tres microservicios o componentes desacoplados que trabajan en conjunto.

### 2.1. Componente `edge` (Dispositivo en Vehículo)

Es el encargado de la captura y el análisis primario de datos.

*   **Tecnología**: Python.
*   **Librerías Principales**:
    *   `OpenCV`: Para la captura y procesamiento de imágenes/video desde una cámara.
    *   `dlib` / `haarcascade`: Para la detección de rostros y puntos faciales clave (ojos, boca).
    *   `requests`: Para comunicarse con la API REST del backend.
*   **Lógica Implementada**:
    1.  **`main.py`**: Orquesta el proceso. Inicia la cámara y entra en un bucle de detección.
    2.  **`drowsy_detector.py`**: Contiene la lógica para:
        *   Detectar el rostro en el fotograma.
        *   Identificar los ojos y la boca a partir de los puntos faciales.
        *   Calcular métricas como el "Eye Aspect Ratio" (EAR) para detectar parpadeos prolongados y la apertura de la boca para detectar bostezos.
    3.  **`fatigue_analyzer.py`**: Analiza las métricas a lo largo del tiempo. Si el EAR cae por debajo de un umbral durante un tiempo determinado, o si se detecta un bostezo, se considera un "evento de fatiga".
    4.  **`backend_client.py`**: Cuando se genera un evento, este módulo construye el objeto de datos (`VehicleEventDTO`) y lo envía mediante una petición `POST` al backend.

### 2.2. Componente `backend` (Servidor Central)

Es el núcleo del sistema, donde se centraliza toda la lógica de negocio y los datos.

*   **Tecnología**: Java 17+, Spring Boot 3.
*   **Arquitectura**:
    *   **API RESTful**: Para la comunicación con el `edge` y el `frontend`.
    *   **Capas**: Sigue un diseño clásico de capas: `Controller` (API), `Service` (lógica de negocio), `Repository` (acceso a datos).
    *   **Seguridad**: Protegida con Spring Security y JWT.
    *   **Base de Datos**: Spring Data JPA (Hibernate) para persistir los datos en una base de datos relacional (MySQL, PostgreSQL, etc.).
    *   **Tiempo Real**: Spring WebSocket para notificar al `frontend` de manera instantánea.
*   **Estructura de Paquetes Clave**:
    *   `com.safetrack.controller`: Define los endpoints de la API REST.
    *   `com.safetrack.service`: Contiene la lógica de negocio (ej. cómo procesar un evento).
    *   `com.safetrack.domain.entity`: Define las tablas de la base de datos (Driver, Vehicle, VehicleEvent).
    *   `com.safetrack.repository`: Interfaces de Spring Data JPA para el acceso a la base de datos.
    *   `com.safetrack.security`: Clases relacionadas con JWT y la configuración de seguridad.
    *   `com.safetrack.config`: Configuraciones de la aplicación, como `WebSocketConfig` y `SecurityConfig`.

### 2.3. Componente `frontend` (Interfaz Web)

La cara visible del sistema para los operadores y administradores.

*   **Tecnología**: Angular.
*   **Estructura**:
    *   **`core`**: Contiene elementos centrales como `guards` (para proteger rutas) e `interceptors` (para añadir el token JWT a las peticiones).
    *   **`features`**: Módulos que representan las funcionalidades principales:
        *   `auth`: Componente de login.
        *   `dashboard`: Vista principal para monitoreo en tiempo real.
        *   `management`: Componentes para gestionar conductores, vehículos, etc.
        *   `analytics`: Vistas para mostrar reportes y gráficos.
    *   **`shared`**: Componentes, pipes o servicios reutilizables a lo largo de la aplicación.
*   **Lógica Implementada**:
    *   **Servicio de Autenticación (`auth.service.ts`)**: Maneja el login contra el backend, almacena el token JWT en el `localStorage` y lo elimina al hacer logout.
    *   **Interceptor JWT**: Adjunta automáticamente el `Authorization: Bearer <token>` a todas las peticiones HTTP salientes.
    *   **Guardia de Rutas**: Protege las rutas de la aplicación, redirigiendo al login si el usuario no está autenticado.
    *   **Estructura de componentes**: Se ha creado la estructura básica de los componentes para login, dashboard y layouts principales.

---

## 3. Documentación de la API REST (Backend)

A continuación se detallan los endpoints implementados en el backend.

**URL Base**: `http://localhost:8080`

### 3.1. Autenticación (`/api/auth`)

Endpoints públicos para gestionar el acceso al sistema.

*   #### `POST /api/auth/login`
    *   **Descripción**: Autentica a un usuario con su nombre de usuario y contraseña.
    *   **Seguridad**: Pública.
    *   **Request Body**:
        ```json
        {
          "username": "admin",
          "password": "password123"
        }
        ```
    *   **Success Response (200 OK)**: Devuelve el token JWT y la información del usuario.
        ```json
        {
          "token": "eyJhbGciOiJIUzI1NiJ9...",
          "type": "Bearer",
          "username": "admin",
          "roles": ["ROLE_ADMIN", "ROLE_USER"]
        }
        ```

*   #### `POST /api/auth/register`
    *   **Descripción**: Registra un nuevo usuario en el sistema.
    *   **Seguridad**: Pública (o podría restringirse a `ROLE_ADMIN`).
    *   **Request Body**:
        ```json
        {
          "username": "operador1",
          "email": "operador1@safetrack.com",
          "password": "password123",
          "roles": ["user"]
        }
        ```
    *   **Success Response (200 OK)**:
        ```json
        {
          "message": "User registered successfully!"
        }
        ```

### 3.2. Eventos de Vehículos (`/api/events`)

*   #### `POST /api/events`
    *   **Descripción**: Endpoint principal para que el dispositivo `edge` reporte un evento de fatiga. Al recibirlo, lo persiste y lo publica en el WebSocket.
    *   **Seguridad**: Requiere autenticación (Token JWT).
    *   **Request Body (`VehicleEventDTO`)**:
        ```json
        {
          "vehicleId": 1,
          "driverId": 1,
          "timestamp": "2025-09-29T10:00:00Z",
          "latitude": 40.7128,
          "longitude": -74.0060,
          "fatigueType": "DROWSINESS",
          "fatigueLevel": "HIGH",
          "confidence": 0.95
        }
        ```
    *   **Success Response (201 Created)**: Devuelve el evento creado con su ID.

### 3.3. Gestión (CRUD)

Endpoints para gestionar las entidades principales del sistema.

*   **Seguridad**: Todos los endpoints de gestión requieren autenticación (Token JWT) y, a menudo, un rol específico (`ROLE_ADMIN`).

*   #### Entidad: `Driver` (`/api/drivers`)
    *   `GET /api/drivers`: Devuelve una lista de todos los conductores.
    *   `GET /api/drivers/{id}`: Devuelve un conductor específico.
    *   `POST /api/drivers`: Crea un nuevo conductor.
    *   `PUT /api/drivers/{id}`: Actualiza un conductor existente.
    *   `DELETE /api/drivers/{id}`: Elimina un conductor.

*   #### Entidad: `Vehicle` (`/api/vehicles`)
    *   `GET /api/vehicles`: Devuelve una lista de todos los vehículos.
    *   ... (y así sucesivamente con los demás métodos CRUD).

*   #### Entidad: `Rule` (`/api/rules`)
    *   `GET /api/rules`: Devuelve la lista de reglas de fatiga.
    *   ... (y así sucesivamente con los demás métodos CRUD).

### 3.4. Analíticas (`/api/analytics`)

*   #### `GET /api/analytics/events`
    *   **Descripción**: Proporciona datos agregados sobre los eventos de fatiga.
    *   **Seguridad**: Requiere autenticación (Token JWT).
    *   **Query Params (Opcionales)**:
        *   `?driverId={id}`: Filtrar por conductor.
        *   `?vehicleId={id}`: Filtrar por vehículo.
        *   `?startDate=YYYY-MM-DD`: Filtrar por fecha de inicio.
        *   `?endDate=YYYY-MM-DD`: Filtrar por fecha de fin.
    *   **Success Response (200 OK)**: La estructura de la respuesta puede variar, pero un ejemplo sería:
        ```json
        {
          "totalEvents": 1520,
          "eventsByType": {
            "DROWSINESS": 800,
            "YAWN": 600,
            "EYE_CLOSURE": 120
          },
          "eventsByRiskLevel": {
            "LOW": 900,
            "MEDIUM": 400,
            "HIGH": 220
          }
        }
        ```

## 4. Comunicación en Tiempo Real (WebSockets)

*   **Endpoint del Servidor**: `ws://localhost:8080/ws`
*   **Topic de Suscripción**: `/topic/fatigue-events`
*   **Descripción**: El frontend debe conectarse al endpoint WebSocket y suscribirse a este topic. Cada vez que el backend recibe un nuevo evento de fatiga a través de la API REST, lo procesará y enviará el objeto `VehicleEventDTO` completo a todos los clientes suscritos a este canal. Esto permite la actualización del dashboard en tiempo real sin necesidad de recargar la página.
