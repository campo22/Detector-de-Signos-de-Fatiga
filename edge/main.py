import cv2
import yaml
import imutils
from imutils.video import VideoStream
import time
import os
import pygame
import numpy as np # Necesario para dibujar la pose de la cabeza
from datetime import datetime, timezone
import logging
from logging.handlers import RotatingFileHandler
import csv
import requests
from pathlib import Path
from src.drowsy_detector import DrowsinessDetector
from src.fatigue_analyzer import FatigueAnalyzer
from src.backend_client import configure_backend, connect_to_backend, disconnect_from_backend, send_vehicle_data


def _validate_and_patch_config(config):
    """Valida claves críticas y aplica defaults seguros si faltan."""
    # Defaults razonables
    defaults = {
        'fps': 20,
        'data_send_interval_seconds': 5,
        'normal_data_send_interval_seconds': 30,
        'FATIGUE_EAR_THRESHOLD': 0.24,
        'FATIGUE_MAR_THRESHOLD': 0.65,
        'FATIGUE_EYE_CLOSED_CONSEC_FRAMES': 20,
        'FATIGUE_HEAD_NOD_CONSEC_FRAMES': 30,
        'FATIGUE_YAWN_CONSEC_FRAMES': 15,
        'FATIGUE_HEAD_PITCH_DOWN_THRESHOLD': 20,
    }
    for k, v in defaults.items():
        if k not in config or config[k] is None:
            print(f"[WARN] Config faltante '{k}', usando valor por defecto: {v}")
            config[k] = v

    # Validar modelo de dlib
    shp = config.get('shape_predictor_path', '')
    if not os.path.exists(shp):
        print(f"[ERROR] No se encontró el modelo de puntos faciales en: {shp}")
        return False
    # Defaults opcionales de logging y CSV
    config.setdefault('enable_file_logging', True)
    config.setdefault('enable_csv_metrics', False)
    config.setdefault('enable_debug_logging', False)

    # Config por imágenes de evidencia
    config.setdefault('send_images_on_high', False)
    config.setdefault('image_variant', 'ORIGINAL')  # ORIGINAL | OVERLAY
    config.setdefault('image_max_width', 640)
    config.setdefault('image_jpeg_quality', 75)
    config.setdefault('image_cooldown_seconds', 20)
    if not config.get('image_upload_url'):
        host = config.get('backend_host', 'localhost')
        port = config.get('backend_port', 8080)
        config['image_upload_url'] = f"http://{host}:{port}/api/attachments"
    return True


def _setup_logging(config):
    """Configura logging a archivo rotativo en reports/app.log."""
    if not config.get('enable_file_logging', True):
        return
    try:
        Path('reports').mkdir(exist_ok=True)
        logger = logging.getLogger()
        level = logging.DEBUG if config.get('enable_debug_logging', False) else logging.INFO
        logger.setLevel(level)
        # Evitar handlers duplicados
        if not any(isinstance(h, RotatingFileHandler) for h in logger.handlers):
            fh = RotatingFileHandler('reports/app.log', maxBytes=1_000_000, backupCount=3)
            fh.setLevel(level)
            fh.setFormatter(logging.Formatter('%(asctime)s [%(levelname)s] %(message)s'))
            logger.addHandler(fh)
        logging.info("Logging inicializado")
    except Exception as e:
        print(f"[WARN] No se pudo inicializar logging a archivo: {e}")


def _append_metrics_csv(payload, raw_metrics, csv_path='reports/metrics.csv'):
    """Anexa métricas y estado a un CSV para análisis y calibración."""
    try:
        Path(csv_path).parent.mkdir(exist_ok=True)
        file_exists = Path(csv_path).exists()
        with open(csv_path, 'a', newline='') as f:
            fieldnames = [
                'timestamp', 'fatigueLevel', 'fatigueType',
                'eyeClosureDuration', 'yawnCount', 'blinkRate',
                'ear', 'mar', 'head_pitch'
            ]
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            if not file_exists:
                writer.writeheader()
            row = {
                'timestamp': payload.get('timestamp'),
                'fatigueLevel': payload.get('fatigueLevel'),
                'fatigueType': payload.get('fatigueType'),
                'eyeClosureDuration': payload.get('eyeClosureDuration', 0.0),
                'yawnCount': payload.get('yawnCount', 0),
                'blinkRate': payload.get('blinkRate', 0.0),
                'ear': round(float(raw_metrics.get('ear', 0.0)), 3) if raw_metrics else '',
                'mar': round(float(raw_metrics.get('mar', 0.0)), 3) if raw_metrics else '',
                'head_pitch': round(float(raw_metrics.get('head_pitch', 0.0)), 2) if raw_metrics else ''
            }
            writer.writerow(row)
    except Exception as e:
        logging.warning(f"No se pudo escribir métricas CSV: {e}")

def _encode_image_jpeg(img, max_width=640, quality=75):
    """Redimensiona si es necesario y codifica a JPEG. Devuelve bytes."""
    h, w = img.shape[:2]
    if w > max_width:
        scale = max_width / float(w)
        new_size = (int(w * scale), int(h * scale))
        img = cv2.resize(img, new_size)
    ok, buf = cv2.imencode('.jpg', img, [int(cv2.IMWRITE_JPEG_QUALITY), int(quality)])
    if not ok:
        raise RuntimeError('imencode failed')
    return buf.tobytes()


def main():
    """
    Función principal para ejecutar la simulación del vehículo inteligente.
    """
    # --- Cargar Configuración ---
    try:
        with open("config.yaml", "r") as f:
            config = yaml.safe_load(f)
        print("[INFO] Configuración cargada correctamente.")
        if not _validate_and_patch_config(config):
            return
    except FileNotFoundError:
        print("[ERROR] No se encontró el archivo de configuración (config.yaml).")
        return
    except yaml.YAMLError as e:
        print(f"[ERROR] Error al leer el archivo YAML: {e}")
        return

    # --- Configurar y Conectar al Backend ---
    _setup_logging(config)
    configure_backend(
        host=config.get('backend_host'),
        port=config.get('backend_port'),
        ws_path=config.get('backend_ws_path')
    )
    connect_to_backend()

    # --- Inicializar Módulos ---
    print("[INFO] Inicializando módulos...")
    try:
        detector = DrowsinessDetector(config)
        analyzer = FatigueAnalyzer(config, driver_id=config.get("driver_id", "DEFAULT_DRIVER"), vehicle_id=config.get("vehicle_id", "DEFAULT_VEHICLE"))
    except Exception as e:
        print(f"[ERROR] Fallo al inicializar módulos: {e}")
        disconnect_from_backend()
        return
    
    # --- Configurar Temporizador para Envío de Datos ---
    data_send_interval = config.get("data_send_interval_seconds", 5)
    normal_data_send_interval = config.get("normal_data_send_interval_seconds", 30)
    last_send_time = time.time()

    # --- Inicializar Alarma (Pygame) ---
    print("[INFO] Inicializando la alarma...")
    audio_enabled = False
    alarm_sound_path = config.get('alarm_sound_path', 'assets/music.wav')
    try:
        pygame.mixer.init()
        if os.path.exists(alarm_sound_path):
            pygame.mixer.music.load(alarm_sound_path)
            audio_enabled = True
        else:
            print(f"[WARN] Archivo de alarma no encontrado: {alarm_sound_path}. Audio deshabilitado.")
    except Exception as e:
        print(f"[WARN] No se pudo inicializar el audio: {e}. Continuando sin sonido.")
    alarm_on = False

    # --- Inicializar Flujo de Video ---
    print("[INFO] Iniciando el flujo de video...")
    vs = VideoStream(src=config.get('camera_index', 0)).start()
    time.sleep(1.0)

    # --- Configuración de la Ventana de Display ---
    window_name = "Simulador de Vehículo Inteligente"
    cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
    if config.get('display_full_screen', False):
        cv2.setWindowProperty(window_name, cv2.WND_PROP_FULLSCREEN, cv2.WINDOW_FULLSCREEN)
    
    # --- Variables para alternar pantalla completa ---
    is_fullscreen = config.get('display_full_screen', False)
    
    overlay_enabled = True
    fps_calc_start = time.time()
    fps_frame_count = 0
    fps_updated = False

    prev_fatigue_level = "NINGUNO"
    last_image_send_time = 0

    # --- Variables de reconexión de cámara ---
    none_frame_count = 0
    reconnect_attempts = 0
    reconnect_backoff = 1.0
    max_reconnect_attempts = 5
    none_frame_threshold = int(config.get('fps', 20)) * 2  # ~2s sin frames

    # --- Bucle Principal de la Aplicación ---
    print("[INFO] Iniciando simulación...")
    while True:
        raw_camera_frame = vs.read()
        if raw_camera_frame is None:
            none_frame_count += 1
            if none_frame_count >= none_frame_threshold:
                print("[WARN] Stream de cámara sin frames, intentando reconectar...")
                try:
                    vs.stop()
                except Exception:
                    pass
                time.sleep(reconnect_backoff)
                try:
                    vs = VideoStream(src=config.get('camera_index', 0)).start()
                    time.sleep(1.0)
                    test = vs.read()
                    if test is not None:
                        print("[INFO] Cámara reconectada.")
                        none_frame_count = 0
                        reconnect_backoff = 1.0
                        reconnect_attempts = 0
                        raw_camera_frame = test
                    else:
                        raise RuntimeError("No frame tras reconectar")
                except Exception as e:
                    reconnect_attempts += 1
                    reconnect_backoff = min(reconnect_backoff * 2.0, 5.0)
                    print(f"[ERROR] Reintento de cámara #{reconnect_attempts} falló: {e}")
                    continue
            else:
                time.sleep(0.05)
                continue
        else:
            none_frame_count = 0
        
        # Frame para procesamiento (siempre se redimensiona a frame_width para consistencia)
        processed_frame = imutils.resize(raw_camera_frame.copy(), width=config.get('frame_width', 450))
        
        fps_frame_count += 1

        # Procesar el frame y obtener métricas crudas
        # display_frame ahora es el frame procesado con los overlays del detector
        display_frame, raw_metrics = detector.process_frame(processed_frame.copy())
        

        # --- Lógica de Visualización y Detección ---
        if raw_metrics:
            # Analizar fatiga y obtener el payload simplificado
            analysis_payload = analyzer.analyze(raw_metrics)

            # --- Actualización de FPS real y escalado de umbrales ---
            if not fps_updated:
                elapsed = time.time() - fps_calc_start
                if elapsed >= 2.0:
                    fps_real = max(1, int(round(fps_frame_count / elapsed)))
                    print(f"[INFO] FPS real estimado: {fps_real}")
                    try:
                        scale = fps_real / float(config.get('fps', fps_real))
                        analyzer.FPS = fps_real
                        analyzer.EYE_CLOSED_CONSEC_FRAMES = max(1, int(round(analyzer.EYE_CLOSED_CONSEC_FRAMES * scale)))
                        analyzer.HEAD_NOD_CONSEC_FRAMES = max(1, int(round(analyzer.HEAD_NOD_CONSEC_FRAMES * scale)))
                        analyzer.YAWN_CONSEC_FRAMES = max(1, int(round(analyzer.YAWN_CONSEC_FRAMES * scale)))
                    except Exception as e:
                        print(f"[WARN] No se pudo ajustar umbrales por FPS: {e}")
                    fps_updated = True

            # --- Control de Alarma ---
            if analysis_payload['fatigueLevel'] == "ALTO":
                if audio_enabled and not alarm_on:
                    pygame.mixer.music.play(-1)
                    alarm_on = True
                cv2.putText(display_frame, "¡ALERTA DE FATIGA ALTA!", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            else:
                if audio_enabled and alarm_on:
                    pygame.mixer.music.stop()
                    alarm_on = False
            
            # --- Dibujar Puntos Faciales y Pose de la Cabeza ---
            if overlay_enabled and raw_metrics['face_landmarks'] is not None:
                for (x, y) in raw_metrics['face_landmarks']:
                    cv2.circle(display_frame, (x, y), 2, (0, 255, 0), -1) # Puntos en verde (radio aumentado)
            
            if overlay_enabled and raw_metrics['rotation_vector'] is not None:
                focal_length = display_frame.shape[1]
                center = (display_frame.shape[1]/2, display_frame.shape[0]/2)
                camera_matrix = np.array([
                    [focal_length, 0, center[0]],
                    [0, focal_length, center[1]],
                    [0, 0, 1]
                ], dtype=np.float64)
                dist_coeffs = np.zeros((4,1))

                nose_end_point_3d = np.array([(0.0, 0.0, 1000.0)], dtype=np.float64)
                nose_point_2d = raw_metrics['face_landmarks'][30]

                (nose_end_point2D, _) = cv2.projectPoints(
                    nose_end_point_3d, raw_metrics['rotation_vector'], np.zeros((3,1)), camera_matrix, dist_coeffs
                )
                # Línea de pose deshabilitada
                # p1 = (int(nose_point_2d[0]), int(nose_point_2d[1]))
                # p2 = (int(nose_end_point2D[0][0][0]), int(nose_end_point2D[0][0][1]))
                # cv2.line(display_frame, p1, p2, (255, 0, 0), 2)

            # --- Overlays de métricas (debug) ---
            if overlay_enabled:
                try:
                    cv2.putText(display_frame, f"EAR:{raw_metrics['ear']:.2f}  MAR:{raw_metrics['mar']:.2f}", (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (50, 255, 50), 1)
                    cv2.putText(display_frame, f"Pitch:{raw_metrics['head_pitch']:.1f}  Blink/min:{analyzer.blink_rate:.1f}", (10, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (50, 255, 50), 1)
                    cv2.putText(display_frame, f"EyeClosed:{analyzer.eye_closure_duration:.2f}s  Yawns/min:{analyzer.yawn_count}", (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (50, 255, 50), 1)
                    cv2.putText(display_frame, f"Fatigue:{analysis_payload['fatigueLevel']}::{analysis_payload['fatigueType']}", (10, 110), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 200, 255), 1)
                except Exception:
                    pass

            # --- Evidencia de imagen en ALTO (con cooldown) ---
            if config.get('send_images_on_high', False):
                try:
                    now = time.time()
                    cooldown = int(config.get('image_cooldown_seconds', 20))
                    if analysis_payload['fatigueLevel'] == 'ALTO' and prev_fatigue_level != 'ALTO' and (now - last_image_send_time) >= cooldown:
                        img = display_frame if config.get('image_variant', 'ORIGINAL') == 'OVERLAY' else frame
                        try:
                            jpeg_bytes = _encode_image_jpeg(img, config.get('image_max_width', 640), config.get('image_jpeg_quality', 75))
                        except Exception as e:
                            logging.error(f"Fallo codificando evidencia JPEG: {e}")
                            jpeg_bytes = None
                        url = config.get('image_upload_url')
                        if jpeg_bytes and url:
                            try:
                                files = {'file': ('evidence.jpg', jpeg_bytes, 'image/jpeg')}
                                data = {
                                    'driverId': analysis_payload['driverId'],
                                    'vehicleId': analysis_payload['vehicleId'],
                                    'timestamp': analysis_payload['timestamp'],
                                    'fatigueLevel': analysis_payload['fatigueLevel'],
                                    'fatigueType': analysis_payload['fatigueType']
                                }
                                resp = requests.post(url, files=files, data=data, timeout=5)
                                if resp.status_code in (200, 201):
                                    try:
                                        j = resp.json()
                                        if isinstance(j, dict):
                                            if 'imageId' in j:
                                                analysis_payload['imageId'] = j['imageId']
                                            if 'url' in j:
                                                analysis_payload['imageUrl'] = j['url']
                                    except Exception:
                                        pass
                                    logging.info("Imagen de evidencia subida correctamente")
                                else:
                                    raise RuntimeError(f"HTTP {resp.status_code}")
                            except Exception as e:
                                try:
                                    Path('reports/evidence').mkdir(parents=True, exist_ok=True)
                                    fname = f"reports/evidence/evidence_{int(now)}.jpg"
                                    with open(fname, 'wb') as f:
                                        f.write(jpeg_bytes or b'')
                                    analysis_payload['imageLocalPath'] = fname
                                    logging.warning(f"No se pudo subir imagen, guardada localmente: {e}")
                                except Exception as e2:
                                    logging.error(f"Fallo guardando evidencia local: {e2}")
                        last_image_send_time = now
                except Exception as e:
                    logging.error(f"Error en flujo de evidencia: {e}")

            # --- Envío de Datos al Backend ---
            current_time = time.time()
            send_condition_met = False
            if analysis_payload['fatigueLevel'] != "NINGUNO":
                if current_time - last_send_time >= data_send_interval:
                    send_condition_met = True
            else:
                if current_time - last_send_time >= normal_data_send_interval:
                    send_condition_met = True

            if send_condition_met:
                print("\n--- Enviando datos al backend ---")
                logging.info(f"Enviando payload: level={analysis_payload['fatigueLevel']} type={analysis_payload['fatigueType']}")
                send_vehicle_data(analysis_payload)
                if config.get('enable_csv_metrics', False):
                    _append_metrics_csv(analysis_payload, raw_metrics)
                last_send_time = current_time
                prev_fatigue_level = analysis_payload['fatigueLevel']

        else: # No se detect�� ninguna cara
            if overlay_enabled:
                cv2.putText(display_frame, "No se detecta rostro", (display_frame.shape[1] // 2 - 100, display_frame.shape[0] // 2), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
            # Keepalive incluso sin rostro detectado
            current_time = time.time()
            if current_time - last_send_time >= normal_data_send_interval:
                keepalive_payload = {
                    "driverId": analyzer.driver_id,
                    "vehicleId": analyzer.vehicle_id,
                    "timestamp": datetime.now( timezone.utc).isoformat(),
                    "fatigueLevel": "NINGUNO",
                    "fatigueType": "NINGUNO",
                    "eyeClosureDuration": 0.0,
                    "yawnCount": 0,
                    "blinkRate": 0.0
                }
                print("\n--- Enviando keepalive (sin rostro) ---")
                send_vehicle_data(keepalive_payload)
                last_send_time = current_time

        # --- Mostrar atajos de teclado ---
        cv2.putText(display_frame, "Q: Salir", (display_frame.shape[1] - 120, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        cv2.putText(display_frame, "O: Overlay", (display_frame.shape[1] - 120, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        cv2.putText(display_frame, "A: Audio", (display_frame.shape[1] - 120, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        cv2.putText(display_frame, "S: Captura", (display_frame.shape[1] - 120, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        
        cv2.imshow("Simulador de Vehículo Inteligente", display_frame)
        key = cv2.waitKey(1) & 0xFF

        if key == ord("q"):
            break
        elif key == ord("o"):
            overlay_enabled = not overlay_enabled
            print(f"[INFO] Overlay {'activado' if overlay_enabled else 'desactivado'}.")
        elif key == ord("a"):
            audio_enabled = not audio_enabled
            print(f"[INFO] Alarma {'activada' if audio_enabled else 'desactivada'}.")
            if alarm_on and not audio_enabled:
                try:
                    pygame.mixer.music.stop()
                except Exception:
                    pass
                alarm_on = False
        elif key == ord("s"):
            try:
                os.makedirs('reports', exist_ok=True)
                fname = f"reports/screenshot_{int(time.time())}.png"
                cv2.imwrite(fname, display_frame)
                print(f"[INFO] Captura guardada en {fname}")
            except Exception as e:
                print(f"[WARN] No se pudo guardar captura: {e}")
        elif key == ord("f"): # Alternar pantalla completa
            is_fullscreen = not is_fullscreen
            if is_fullscreen:
                cv2.setWindowProperty(window_name, cv2.WND_PROP_FULLSCREEN, cv2.WINDOW_FULLSCREEN)
            else:
                cv2.setWindowProperty(window_name, cv2.WND_PROP_FULLSCREEN, cv2.WINDOW_NORMAL)
            print(f"[INFO] Pantalla completa {'activada' if is_fullscreen else 'desactivada'}.")

    # --- Limpieza Final ---
    print("[INFO] Finalizando simulación y realizando limpieza...")
    disconnect_from_backend() # Desconectar del WebSocket
    if alarm_on and audio_enabled:
        try:
            pygame.mixer.music.stop()
        except Exception:
            pass
    cv2.destroyAllWindows()
    vs.stop()

if __name__ == "__main__":
    main()
