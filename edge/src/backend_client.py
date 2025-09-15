import json
import time
import websocket
import threading
import os
import socket
import uuid
import collections

class StompWebSocketClient(threading.Thread):
    """
    Cliente STOMP sobre WebSocket que corre en su propio hilo.
    """
    def __init__(self, host='localhost', port=8080, connect_timeout=5): 
        super().__init__()
        self.daemon = True  # Hilo de fondo para que no bloquee el cierre del programa
        self.host = host
        self.port = port
        self.ws_path = '/ws'
        self.ws = None 
        self.connected = False
        self.destination = '/app/vehicle-event'
        self.data_to_send = collections.deque(maxlen=1000)
        self.connect_timeout = connect_timeout
        self.lock = threading.Lock()
        self._stop = False
        # Persistencia offline
        os.makedirs('reports', exist_ok=True)
        self.offline_path = os.path.join('reports', 'offline_queue.jsonl')
        self._base_backoff = 1.0

    def _create_stomp_frame(self, command, headers=None, body=None):
        """Crea un frame STOMP básico"""
        frame_lines = [command]
        
        if headers:
            for key, value in headers.items():
                frame_lines.append(f"{key}:{value}")
        
        frame_lines.append('')  # Línea vacía separa headers del body
        
        if body:
            frame_lines.append(body)
        
        # Unir con \n y añadir terminador NULL
        frame = '\n'.join(frame_lines) + '\x00'
        return frame

    def _send_stomp_connect(self):
        """Envía frame CONNECT de STOMP"""
        # Usar el formato exacto que sabíamos que funcionaba antes
        connect_frame = f"CONNECT\naccept-version:1.0,1.1,1.2\nhost:{self.host}:{self.port}\n\n\x00"
        print(f"[THREAD-DEBUG] Enviando CONNECT frame: {repr(connect_frame)}")
        self.ws.send(connect_frame)

    def _send_stomp_message(self, destination, message_body):
        """Envía un mensaje STOMP"""
        body_bytes = message_body.encode('utf-8')
        headers = {
            'destination': destination,
            'content-type': 'application/json; charset=utf-8',
            'content-length': str(len(body_bytes))
        }
        send_frame = self._create_stomp_frame('SEND', headers, message_body)
        self.ws.send(send_frame)

    def _persist_offline(self, data):
        """Guarda el evento en un archivo JSONL cuando no hay conexión."""
        try:
            with open(self.offline_path, 'a') as f:
                f.write(json.dumps(data, ensure_ascii=False) + "\n")
        except Exception as e:
            print(f"[THREAD-ERROR] No se pudo persistir offline: {e}")

    def _load_offline_queue(self):
        """Carga eventos persistidos al iniciar/conectar y limpia el archivo."""
        try:
            if os.path.exists(self.offline_path):
                loaded = 0
                with open(self.offline_path, 'r') as f:
                    for line in f:
                        line = line.strip()
                        if not line:
                            continue
                        try:
                            evt = json.loads(line)
                            self.data_to_send.append(evt)
                            loaded += 1
                        except Exception:
                            pass
                os.remove(self.offline_path)
                if loaded:
                    print(f"[THREAD] Cola offline cargada: {loaded} eventos")
        except Exception as e:
            print(f"[THREAD-ERROR] No se pudo cargar cola offline: {e}")

    def run(self):
        """
        Conecta y mantiene la conexión con reconexión/backoff y persistencia offline.
        """
        backoff = self._base_backoff
        while not self._stop:
            try:
                # Intentos de conexión alternando host/candidato
                self.connected = False
                last_err = None
                for candidate_host in [self.host, '127.0.0.1']:
                    if self._stop:
                        break
                    try:
                        url = f"ws://{candidate_host}:{self.port}{self.ws_path}"
                        print(f"[THREAD] Conectando a {url} (timeout={self.connect_timeout}s)...")

                        if os.getenv('DEBUG_WEBSOCKET') == '1':
                            websocket.enableTrace(True)

                        self.ws = websocket.create_connection(
                            url,
                            timeout=self.connect_timeout,
                            subprotocols=['v10.stomp', 'v11.stomp', 'v12.stomp']
                        )
                        print(f"[THREAD-DEBUG] WebSocket conectado, enviando STOMP CONNECT...")

                        # Handshake STOMP
                        self._send_stomp_connect()
                        self.ws.settimeout(self.connect_timeout)
                        print(f"[THREAD-DEBUG] Esperando respuesta CONNECTED del servidor...")
                        response = self.ws.recv()
                        print(f"[THREAD-DEBUG] Respuesta del servidor: {repr(response)}")

                        if 'CONNECTED' in response:
                            self.connected = True
                            print("[THREAD] Conexión STOMP sobre WebSocket exitosa.")
                            break
                        else:
                            raise RuntimeError(f"Respuesta inesperada del servidor: {response}")
                    except Exception as e:
                        last_err = e
                        print(f"[THREAD-ERROR] Fallo conectando con host {candidate_host}: {e}")
                        try:
                            if self.ws:
                                self.ws.close()
                        except:
                            pass
                        self.ws = None
                        time.sleep(0.2)

                if not self.connected:
                    raise RuntimeError(f"No se pudo establecer conexión tras varios intentos: {last_err}")

                # Cargar cola offline tras conectar
                self._load_offline_queue()

                # Loop principal no bloqueante
                self.ws.settimeout(0.1)
                backoff = self._base_backoff  # reset backoff al conectar
                while self.connected and not self._stop:
                    # Enviar datos pendientes
                    item = None
                    with self.lock:
                        if self.data_to_send:
                            item = self.data_to_send.popleft()
                    if item is not None:
                        try:
                            json_data = json.dumps(item, ensure_ascii=False)
                            self._send_stomp_message(self.destination, json_data)
                            print(f"[THREAD] Datos enviados: {json_data}")
                        except Exception as e:
                            print(f"[THREAD-ERROR] Fallo al enviar mensaje: {e}")
                            # Persistir y forzar reconexión
                            self._persist_offline(item)
                            break

                    # Leer datos del servidor (si los hay)
                    try:
                        response = self.ws.recv()
                        if response:
                            print(f"[THREAD-DEBUG] Mensaje del servidor: {repr(response)}")
                    except websocket.WebSocketTimeoutException:
                        pass
                    except Exception as e:
                        print(f"[THREAD-ERROR] Error leyendo del WebSocket: {e}")
                        break

                    time.sleep(0.05)

            except Exception as e:
                if self._stop:
                    break
                print(f"[THREAD-ERROR] Fallo en el hilo de conexión: {e}")
            finally:
                # Cerrar conexión si estaba abierta
                if self.ws:
                    try:
                        disconnect_frame = self._create_stomp_frame('DISCONNECT')
                        try:
                            self.ws.send(disconnect_frame)
                        except Exception:
                            pass
                        self.ws.close()
                    except Exception:
                        pass
                    self.ws = None
                self.connected = False
                print("[THREAD] Conexión finalizada. Intentando reconectar...")

                # Backoff exponencial con límite
                if not self._stop:
                    time.sleep(backoff)
                    backoff = min(backoff * 2, 30.0)

        print("[THREAD] Hilo de conexión terminado.")

    def send(self, data):
        """
        Método público para añadir datos a la cola de envío o persistir si no hay conexión.
        """
        with self.lock:
            if self.connected:
                self.data_to_send.append(data)
            else:
                self._persist_offline(data)

    def disconnect(self):
        """Solicitar desconexión"""
        self._stop = True
        self.connected = False
        try:
            if self.ws:
                self.ws.close()
        except Exception:
            pass

# --- Instancia Global y Funciones Wrapper ---
stomp_client = StompWebSocketClient()

def configure_backend(host=None, port=None, ws_path=None):
    """Configura el destino del backend. Debe llamarse antes de connect_to_backend()."""
    try:
        if host is not None:
            stomp_client.host = host
        if port is not None:
            stomp_client.port = int(port)
        if ws_path is not None:
            if not ws_path.startswith('/'):
                ws_path = '/' + ws_path
            stomp_client.ws_path = ws_path
        print(f"[INFO] Backend configurado: host={stomp_client.host} port={stomp_client.port} path={stomp_client.ws_path}")
    except Exception as e:
        print(f"[WARN] No se pudo configurar backend: {e}")

def connect_to_backend():
    print("[INFO] Iniciando el hilo del cliente WebSocket...")
    stomp_client.start()

def send_vehicle_data(data):
    stomp_client.send(data)

def disconnect_from_backend():
    print("[INFO] Solicitando desconexión...")
    stomp_client.disconnect()
