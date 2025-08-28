#!/usr/bin/env python3
# Versión de diagnóstico SIN rotación de imagen
from scipy.spatial import distance as dist
from imutils import face_utils
import dlib
import cv2
from os.path import join, dirname

def eye_aspect_ratio(eye):
    A = dist.euclidean(eye[1], eye[5])
    B = dist.euclidean(eye[2], eye[4])
    C = dist.euclidean(eye[0], eye[3])
    ear = (A + B) / (2.0 * C)
    return ear

def mouth_aspect_ratio(mouth):
    A = dist.euclidean(mouth[2], mouth[10])
    B = dist.euclidean(mouth[4], mouth[8])
    C = dist.euclidean(mouth[0], mouth[6])
    mar = (A + B) / (2.0 * C)
    return mar

# Umbrales
EYE_AR_THRESH = 0.38
MOUTH_AR_THRESH = 0.25

print("🔍 DIAGNÓSTICO SIN ROTACIÓN DE IMAGEN")
print("=" * 50)
print(f"📊 Umbral de ojos (EYE_AR_THRESH): {EYE_AR_THRESH}")
print(f"📊 Umbral de boca (MOUTH_AR_THRESH): {MOUTH_AR_THRESH}")
print("=" * 50)

# Cargar detector
print("[INFO] Cargando detector facial...")
detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor(join(dirname(__file__), "models", "shape_predictor_68_face_landmarks.dat"))

# Índices de landmarks
(lStart, lEnd) = face_utils.FACIAL_LANDMARKS_IDXS["left_eye"]
(rStart, rEnd) = face_utils.FACIAL_LANDMARKS_IDXS["right_eye"]
(mouth_start, mouth_end) = (48, 68)

# Iniciar cámara
cap = cv2.VideoCapture(0)

print("[INFO] Iniciando diagnóstico SIN rotación...")
print("🎯 INSTRUCCIONES:")
print("   - Mantén ojos cerrados para ver si EAR baja")
print("   - Abre la boca para ver si MAR sube")
print("   - Presiona 'q' para salir")
print("-" * 50)

while True:
    ret, frame = cap.read()
    if not ret:
        break
    
    # NO ROTAMOS LA IMAGEN
    # frame = cv2.rotate(frame, cv2.ROTATE_90_COUNTERCLOCKWISE)
    
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    
    # Detectar caras
    rects = detector(gray, 0)
    
    if len(rects) == 0:
        cv2.putText(frame, "NO SE DETECTA CARA", (10, 50), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        print("⚠️  NO SE DETECTA CARA - Asegúrate de estar bien iluminado")
    else:
        print(f"✅ SE DETECTÓ {len(rects)} CARA(S)")
    
    for rect in rects:
        shape = predictor(gray, rect)
        shape = face_utils.shape_to_np(shape)
        
        # Calcular EAR
        leftEye = shape[lStart:lEnd]
        rightEye = shape[rStart:rEnd]
        leftEAR = eye_aspect_ratio(leftEye)
        rightEAR = eye_aspect_ratio(rightEye)
        ear = (leftEAR + rightEAR) / 2.0
        
        # Calcular MAR
        mouth = shape[mouth_start:mouth_end]
        mar = mouth_aspect_ratio(mouth)
        
        # Detectar estado
        eyes_closed = ear < EYE_AR_THRESH
        mouth_open = mar > MOUTH_AR_THRESH
        
        # Mostrar información en pantalla
        cv2.putText(frame, f"EAR: {ear:.3f} (Umbral: {EYE_AR_THRESH})", 
                   (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        cv2.putText(frame, f"MAR: {mar:.3f} (Umbral: {MOUTH_AR_THRESH})", 
                   (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        # Estado de ojos
        if eyes_closed:
            cv2.putText(frame, "OJOS: CERRADOS", (10, 120), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
            print(f"👁️  OJOS CERRADOS - EAR: {ear:.3f} < {EYE_AR_THRESH}")
        else:
            cv2.putText(frame, "OJOS: ABIERTOS", (10, 120), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
        
        # Estado de boca
        if mouth_open:
            cv2.putText(frame, "BOCA: ABIERTA", (10, 150), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
            print(f"🥱 BOCA ABIERTA - MAR: {mar:.3f} > {MOUTH_AR_THRESH}")
        else:
            cv2.putText(frame, "BOCA: CERRADA", (10, 150), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
        
        # Dibujar landmarks
        leftEyeHull = cv2.convexHull(leftEye)
        rightEyeHull = cv2.convexHull(rightEye)
        mouthHull = cv2.convexHull(mouth)
        cv2.drawContours(frame, [leftEyeHull], -1, (0, 255, 0), 1)
        cv2.drawContours(frame, [rightEyeHull], -1, (0, 255, 0), 1)
        cv2.drawContours(frame, [mouthHull], -1, (0, 255, 255), 1)
    
    cv2.imshow("Diagnóstico Sin Rotación", frame)
    key = cv2.waitKey(1) & 0xFF
    
    if key == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
print("\n✅ Diagnóstico completado")
