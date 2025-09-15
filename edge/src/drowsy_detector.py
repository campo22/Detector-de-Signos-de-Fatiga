import cv2
import dlib
import numpy as np
from scipy.spatial import distance as dist
from imutils import face_utils

class DrowsinessDetector:
    """
    Clase para extraer métricas faciales crudas de un fotograma de video.
    Responsabilidades:
    - Detectar cara y puntos faciales.
    - Calcular EAR (Eye Aspect Ratio).
    - Calcular MAR (Mouth Aspect Ratio).
    - Estimar la pose de la cabeza (pitch, yaw, roll).
    NO controla alarmas ni dibuja en el frame.
    """

    def __init__(self, config):
        print("[INFO] Inicializando el extractor de métricas faciales...")
        self.config = config
        
        # --- Modelos Dlib ---
        self.detector = dlib.get_frontal_face_detector()
        self.predictor = dlib.shape_predictor(config['shape_predictor_path'])

        # --- Índices de Puntos Faciales ---
        (self.lStart, self.lEnd) = face_utils.FACIAL_LANDMARKS_IDXS["left_eye"]
        (self.rStart, self.rEnd) = face_utils.FACIAL_LANDMARKS_IDXS["right_eye"]
        (self.mStart, self.mEnd) = face_utils.FACIAL_LANDMARKS_IDXS["mouth"]

        # --- Modelo 3D de Cara para Estimación de Pose ---
        self.face_model_3d = np.array([
            (0.0, 0.0, 0.0),             # Punta de la nariz (30)
            (0.0, -330.0, -65.0),        # Mentón (8)
            (-225.0, 170.0, -135.0),     # Comisura del ojo izquierdo (36)
            (225.0, 170.0, -135.0),      # Comisura del ojo derecho (45)
            (-150.0, -150.0, -125.0),    # Comisura de la boca izquierda (48)
            (150.0, -150.0, -125.0)     # Comisura de la boca derecha (54)
        ], dtype=np.float64)
        
        self.face_model_3d_indices = [30, 8, 36, 45, 48, 54]

    def _calculate_ear(self, eye):
        A = dist.euclidean(eye[1], eye[5])
        B = dist.euclidean(eye[2], eye[4])
        C = dist.euclidean(eye[0], eye[3])
        return (A + B) / (2.0 * C)

    def _calculate_mar(self, mouth):
        # Distancias verticales entre puntos del labio superior e inferior
        A = dist.euclidean(mouth[3], mouth[9])  # 51-57
        B = dist.euclidean(mouth[2], mouth[10]) # 50-58
        C = dist.euclidean(mouth[4], mouth[8])  # 52-56
        # Distancia horizontal entre las comisuras de la boca
        D = dist.euclidean(mouth[0], mouth[6])  # 48-54
        
        # Fórmula común para MAR
        return (A + B + C) / (3.0 * D)


    def _estimate_head_pose(self, shape, frame_size):
        image_points = np.array([shape[i] for i in self.face_model_3d_indices], dtype=np.float64)

        focal_length = frame_size[1]
        center = (frame_size[1] / 2, frame_size[0] / 2)
        camera_matrix = np.array(
            [[focal_length, 0, center[0]],
             [0, focal_length, center[1]],
             [0, 0, 1]], dtype=np.float64
        )
        dist_coeffs = np.zeros((4, 1))

        try:
            (success, rotation_vector, _) = cv2.solvePnP(
                self.face_model_3d, image_points, camera_matrix, dist_coeffs, flags=cv2.SOLVEPNP_ITERATIVE
            )
            if not success:
                return None, None

            rotation_matrix, _ = cv2.Rodrigues(rotation_vector)
            angles, _, _, _, _, _ = cv2.RQDecomp3x3(rotation_matrix)
            
            # Pitch, Yaw, Roll
            pitch, yaw, roll = angles[0], angles[1], angles[2]
            
            return (pitch, yaw, roll), rotation_vector
        except Exception:
            return None, None

    def process_frame(self, frame):
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        rects = self.detector(gray, 0)

        if not rects:
            return frame, None # Devolver el frame original y None para métricas si no se detecta cara

        rect = rects[0]
        shape = self.predictor(gray, rect)
        shape_np = face_utils.shape_to_np(shape)

        # --- Calcular todas las métricas ---
        left_eye = shape_np[self.lStart:self.lEnd]
        right_eye = shape_np[self.rStart:self.rEnd]
        mouth = shape_np[self.mStart:self.mEnd]

        ear = (self._calculate_ear(left_eye) + self._calculate_ear(right_eye)) / 2.0
        mar = self._calculate_mar(mouth)
        
        head_pose_angles, rotation_vector = self._estimate_head_pose(shape_np, frame.shape)
        
        if head_pose_angles is None:
            pitch, yaw, roll = 0.0, 0.0, 0.0
        else:
            pitch, yaw, roll = head_pose_angles

        metrics = {
            "ear": ear,
            "mar": mar,
            "head_pitch": pitch,
            "head_yaw": yaw,
            "head_roll": roll,
            "face_landmarks": shape_np, # Devolvemos los puntos para poder dibujar en main
            "rotation_vector": rotation_vector # Para dibujar la pose de la cabeza
        }

        return frame, metrics
