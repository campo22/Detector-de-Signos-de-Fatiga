# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Arquitectura del Sistema

El proyecto se divide en tres componentes principales:

### Edge (Python)
- Sistema de visión por computadora para detección en tiempo real
- Ubicación: `/edge`
- Tecnologías principales: OpenCV, dlib, WebSocket
- Componentes clave:
  - `DrowsinessDetector`: Extracción de métricas faciales (EAR, MAR, pose)
  - `FatigueAnalyzer`: Análisis temporal y clasificación de fatiga
  - `BackendClient`: Comunicación STOMP/WebSocket con el backend

### Backend (Spring Boot)
- API REST y WebSocket para gestión de datos
- Ubicación: `/backend/backend`
- Tecnologías: Java 17, Spring Boot 3, PostgreSQL
- Características principales (según dependencias en pom.xml):
  - API REST (spring-boot-starter-web)
  - WebSocket (spring-boot-starter-websocket)
  - Persistencia con JPA/Hibernate y PostgreSQL
  - OpenAPI (springdoc)

### Frontend (Angular)
- Panel de control y monitoreo
- Ubicación: `/frontend`
- Tecnologías: Angular 20, TailwindCSS, PrimeNG, SSR (Angular Universal)
- Características principales:
  - Dashboard en tiempo real
  - Visualización de estadísticas
  - Gestión de conductores y vehículos
  - Soporte SSR (outputMode: server, entry src/server.ts)

## Comandos Comunes

### Edge (Python)
```bash
# Activar entorno virtual
cd edge
source venv/bin/activate  # En Windows: .\\venv\\Scripts\\activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar aplicación
python main.py
```

### Backend (Spring Boot)
```bash
cd backend/backend
# Compilar y ejecutar pruebas
./mvnw clean test

# Ejecutar la aplicación
./mvnw spring-boot:run

# Ejecutar un único test de unidad (clase)
./mvnw -q -Dtest=NombreDeLaClaseTest test

# Ejecutar un único método de test
./mvnw -q -Dtest=NombreDeLaClaseTest#nombreDelMetodo test
```

### Frontend (Angular)
```bash
cd frontend
# Instalar dependencias
npm install

# Servidor de desarrollo
ng serve

# Ejecutar pruebas unitarias
ng test

# Ejecutar un único spec
ng test --include src/app/ruta/al-archivo.component.spec.ts

# Generar build de producción
ng build --configuration=production

# Servir SSR tras build (Angular Universal)
npm run serve:ssr:frontend
```

## Configuración del Entorno

### Requisitos del Sistema
- Python 3.8+
- Java 17+
- Node.js 18+
- PostgreSQL 13+
- Cámara web (para el componente Edge)

### Edge
- Asegurarse de tener instalado el modelo de landmarks de dlib en `/edge/models/shape_predictor_68_face_landmarks.dat`
- Configurar `config.yaml` para ajustar umbrales y conexión al backend
- Verificar que existe el archivo de audio para alarmas en `assets/music.wav`

### Backend
- Dependencias definidas en `backend/backend/pom.xml` (incluye springdoc-openapi y WebSocket).
- Ajusta propiedades de base de datos y servidor en los archivos de configuración del backend (ubicación estándar `src/main/resources/application*.properties|yml`).

### Frontend
- TailwindCSS v4 configurado en `frontend/src/styles.scss` con clases predefinidas en `@layer utilities`.
- PostCSS configurado en `frontend/postcss.config.js` usando `@tailwindcss/postcss`.
- PrimeNG y PrimeIcons como librerías UI.

## Flujos y Relaciones entre Componentes

- Edge captura frames de cámara, calcula métricas (EAR/MAR/pose) con `DrowsinessDetector`, resume estado con `FatigueAnalyzer` y envía eventos al backend por STOMP/WebSocket.
- Según `edge/README.md`, los eventos se publican en `/app/vehicle-event` y el backend expone WebSocket (URL típica `ws://<host>:<port>/ws`, configurable en `config.yaml`). También puede enviarse imagen JPEG a `POST /api/attachments` cuando hay fatiga alta, si está habilitado.
- El Backend recibe, persiste y expone datos vía REST/WebSocket.
- El Frontend consume APIs/WebSocket para el dashboard.

## Notas Operativas

### Edge
- Umbrales y rutas en `edge/config.yaml`. Requiere `edge/models/shape_predictor_68_face_landmarks.dat`.
- Calibra FPS real al inicio y ajusta umbrales temporales en runtime.
- Incluye reconexión de cámara con backoff y control de alarma opcional con pygame.

### Backend
- Java 17; dependencias y plugins (MapStruct, Lombok) configurados en `backend/backend/pom.xml`.

### Frontend
- Proyecto Angular CLI 20. Soporta SSR. Scripts en `frontend/package.json`.
