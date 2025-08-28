# Proyecto de Detección de Somnolencia y Fatiga

Sistema de visión por computadora para monitorear en tiempo real signos de somnolencia y fatiga del conductor. El sistema analiza apertura de ojos (EAR), apertura de boca (MAR) para bostezos, y la orientación de la cabeza (pitch/yaw/roll) para detectar cabeceo. Puede activar una alarma sonora y enviar eventos a un backend (STOMP/WebSocket) con cadencias configurables.

## Características

- Detección de rostro y landmarks faciales (dlib, 68 puntos)
- Métricas crudas por frame:
  - EAR (Eye Aspect Ratio) — ojos cerrados / parpadeo
  - MAR (Mouth Aspect Ratio) — bostezos
  - Pose de cabeza (pitch/yaw/roll) — cabeceo
- Análisis temporal robusto con estado interno (FatigueAnalyzer):
  - Microsueños (ojos cerrados sostenidos)
  - Cabeceo (pitch hacia abajo sostenido)
  - Bostezos sostenidos y repetidos
  - Tasa de parpadeo (parpadeos/min)
- Clasificación de nivel y tipo de fatiga: NONE/LOW/MEDIUM/HIGH + MICRO_SLEEP/HEAD_NOD/YAWNING/EYE_STRAIN
- Overlays opcionales en pantalla:
  - Landmarks faciales y línea de pose
  - Métricas (EAR/MAR/pitch, blink/min, duración ojos cerrados, yawn/min, estado de fatiga)
- Alarma sonora (pygame) con bucle cuando el nivel es HIGH
- Envío a backend por STOMP/WebSocket (cola interna y envío en segundo plano)
  - Cadencia rápida cuando hay fatiga
  - Keepalive con cadencia normal cuando no la hay
- Configuración vía `config.yaml` (umbrales, rutas, cámara, envío)
- Calibración automática de FPS en runtime (ajuste de umbrales por frames consecutivos)

## Estructura del Proyecto

```
.
├── main.py                     # Orquestación: cámara, overlays, alarma, envío backend
├── config.yaml                 # Configuración (umbrales, rutas, FPS, cámara, envío)
├── requirements.txt            # Dependencias
├── README.md                   # Documentación
├── assets/
│   └── music.wav               # Sonido de alarma (configurable)
├── models/
│   └── shape_predictor_68_face_landmarks.dat  # Modelo dlib (colocar aquí)
├── src/
│   ├── drowsy_detector.py      # Extracción de métricas crudas (EAR/MAR/pose/landmarks)
│   ├── fatigue_analyzer.py     # An��lisis temporal y clasificación de fatiga
│   └── backend_client.py       # Hilo STOMP/WebSocket, envío de eventos
└── reports/                    # Capturas y/o reportes (generado en runtime)
```

## Prerrequisitos

- Python 3.8+
- Cámara web funcional
- En macOS, para `dlib` puede requerirse Xcode Command Line Tools y/o wheel precompilado
- Para pygame/audio: dispositivo de audio disponible (si no, la app desactiva el sonido automáticamente)

## Instalación

1) Crear entorno virtual e instalar dependencias

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2) Descargar el modelo de landmarks de dlib (si no está en `models/`)

- Enlace oficial (comprimido): http://dlib.net/files/shape_predictor_68_face_landmarks.dat.bz2
- Pasos:
  - Descarga el `.bz2` y descomprímelo para obtener `shape_predictor_68_face_landmarks.dat`
  - Colócalo en `models/`
  - Ajusta `shape_predictor_path` en `config.yaml` si usas otra ruta

3) Verifica el archivo de sonido (opcional)

- Asegúrate de tener `assets/music.wav` o cambia `alarm_sound_path` en `config.yaml`

## Ejecución

```bash
python main.py
```

Se abrirá una ventana con la cámara. Por defecto verás los overlays (landmarks, línea de pose y métricas). Presiona `q` para salir.

### Controles en tiempo real

- `o`: alterna overlays (on/off)
- `a`: activa/desactiva la alarma sonora (no afecta la detección, solo el audio)
- `s`: guarda una captura en `reports/`
- `q`: salir

## Configuración (`config.yaml`)

- Identificadores:
  - `driver_id`: ID del conductor
  - `vehicle_id`: ID del vehículo (opcional)
- Backend:
  - `data_send_interval_seconds`: intervalo de envío cuando hay fatiga
  - `normal_data_send_interval_seconds`: intervalo de keepalive cuando no hay fatiga
- Cámara:
  - `fps`: FPS esperado (se recalibra en runtime y ajusta duraciones automáticamente)
  - `camera_index`: índice de cámara (0 por defecto)
  - `frame_width`: ancho de procesamiento (ej. 450)
- Rutas:
  - `shape_predictor_path`: ruta al modelo de dlib (.dat)
  - `alarm_sound_path`: ruta al sonido de alarma
- Umbrales de fatiga:
  - `FATIGUE_EAR_THRESHOLD`: umbral de ojos cerrados (EAR)
  - `FATIGUE_MAR_THRESHOLD`: umbral de bostezo (MAR)
  - `FATIGUE_EYE_CLOSED_CONSEC_FRAMES`: frames consecutivos para microsueño
  - `FATIGUE_HEAD_NOD_CONSEC_FRAMES`: frames consecutivos para cabeceo
  - `FATIGUE_YAWN_CONSEC_FRAMES`: frames consecutivos para bostezo sostenido
  - `FATIGUE_HEAD_PITCH_DOWN_THRESHOLD`: umbral (grados) de pitch hacia abajo

Notas:
- La aplicación estima el FPS real (~2s tras iniciar) y reajusta internamente los valores de frames consecutivos para mantener las mismas duraciones nominales.

## Payload al Backend

- Protocolo: STOMP sobre WebSocket
- Destination: `/app/vehicle-event`
- Ejemplo de campos enviados:

```json
{
  "driverId": "PILOTO-001",
  "vehicleId": "VEHICULO-001",
  "timestamp": "2025-01-01T12:00:00",
  "fatigueLevel": "HIGH",
  "fatigueType": "MICRO_SLEEP",
  "eyeClosureDuration": 1.6,
  "yawnCount": 2,
  "blinkRate": 18.0
}
```

- Cadencias:
  - Con fatiga (fatigueLevel != "NONE"): `data_send_interval_seconds`
  - Sin fatiga: `normal_data_send_interval_seconds`

## Calibración y Tuning

- Ajusta `fps` si conoces el valor típico de tu cámara (si no, se calibrará automáticamente).
- Umbrales recomendados (punto de partida):
  - `FATIGUE_EAR_THRESHOLD`: 0.24 (rango típico 0.23–0.26)
  - `FATIGUE_EYE_CLOSED_CONSEC_FRAMES`: 20 (≈ 1s a 20 FPS)
  - `FATIGUE_MAR_THRESHOLD`: 0.65 (rango 0.60–0.75)
  - `FATIGUE_YAWN_CONSEC_FRAMES`: 15 (≈ 0.75s a 20 FPS)
  - `FATIGUE_HEAD_PITCH_DOWN_THRESHOLD`: 20 (rango 15–25 deg)
  - `FATIGUE_HEAD_NOD_CONSEC_FRAMES`: 30 (≈ 1.5s a 20 FPS)
- Observa en pantalla EAR/MAR/pitch y ajusta umbrales según tu entorno (iluminación, cámara).
- En algunos sistemas, mirar hacia abajo puede dar pitch positivo en vez de negativo; si detectas esta inversión, invierte el criterio en el analizador.

## Solución de Problemas

- dlib falla al instalarse
  - En macOS/ARM puede requerir wheel precompilado, Xcode CLT o cmake
- No se encuentra el modelo dlib
  - Verifica `models/shape_predictor_68_face_landmarks.dat` y la ruta en `config.yaml`
- No hay audio o falla pygame
  - El sistema desactiva el audio y continúa sin alarma sonora
- No abre la cámara / pantalla negra
  - Cambia `camera_index` (0/1), verifica permisos del SO, prueba otra aplicación para confirmar la cámara
- No detecta rostro
  - Mejora la iluminación y encuadre; reduce/ajusta `frame_width` si es necesario
- Eventos no llegan al backend
  - Revisa logs del hilo STOMP, URL del WebSocket (`ws://<host>:<port>/ws`) y firewall

## Roadmap (ideas sugeridas)

- Reintentos con backoff y buffer offline para el backend
- Heartbeat "NONE" incluso sin rostro detectado
- Reconexión de cámara y fallback si el stream falla
- Calibración guiada por conductor (baseline EAR/MAR)
- Logging estructurado a archivo y reportes CSV para análisis
- Opción de landmarks vía MediaPipe Face Mesh

---

Este proyecto está enfocado en investigación y prototipado de seguridad vial. Ajusta umbrales y calibra en tu entorno antes de uso en situaciones reales.