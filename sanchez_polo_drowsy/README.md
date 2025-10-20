# Edge: sanchez_polo_drowsy (Python)

Detector en el borde (edge) que procesa video en tiempo real para identificar signos de fatiga y reportarlos al backend.

## Requisitos
- Python 3.8+
- Cámara USB/CSI

## Instalación
```bash
cd sanchez_polo_drowsy
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

## Estructura (resumen)
- `src/` lógica de detección (EAR, bostezos, cabeceo)
- `models/` modelos pre-entrenados (si aplica)
- `main.py` arranque del pipeline
- `backend_client.py` envío de eventos

## Variables de entorno
- `BACKEND_BASE_URL` (ej: `http://localhost:8080`)
- `DEVICE_ID` (identificador del dispositivo)
- `VEHICLE_ID` y `DRIVER_ID` (opcional, si se adjuntan en origen)

## Ejecución
```bash
source venv/bin/activate
python main.py
```

## Parámetros y umbrales
- EAR mínimo configurable (parpadeo / ojos cerrados)
- Duración mínima de cierre ocular (ms)
- Umbral de apertura de boca para bostezo

## Telemetría y envío de eventos
- HTTP POST a `/api/events` con `VehicleEventDTO`
- Reintentos con backoff exponencial en caso de fallo de red

## Logs
- Logs rotativos en archivos locales (configurable)

## Consejos de rendimiento
- Reducir resolución de cámara si la CPU es limitada (ej. 640x480)
- Usar ROI para acelerar detección
- Deshabilitar visualización si no es necesaria en producción
