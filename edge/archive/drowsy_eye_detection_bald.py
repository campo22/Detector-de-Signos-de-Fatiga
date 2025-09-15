# import the necessary packages
from scipy.spatial import distance as dist

from imutils import face_utils
from threading import Thread

import dlib
import cv2
from os.path import join, dirname
from time import sleep

from datetime import date

# from gpiozero import Buzzer
# global bz
# bz = Buzzer(17)

def buzzer_alarm():
    # play an alarm sound
    print("buzzer on")
    # bz.on()
    sleep(5)
    print("buzzer off")
    # bz.off()


header = ["Fecha","Hora","ID","resultado"]

def write_csv_file(csv_file,content):
    if not os.path.isfile(csv_file):
        with open(csv_file,'w+',encoding='UTF-8',newline='') as f:
            writer = csv.writer(f)
            writer.writerow(header)
            writer.writerow(content)
    else:
        with open(csv_file,'a+',encoding='UTF-8',newline='') as f:
            writer = csv.writer(f)
            writer.writerow(content)

from yaml import safe_load

from datetime import datetime

import json
import requests

global sender_email, receiver_email, password, smtp_server, port, context, id_conductor

id_conductor = "conductor2939"

with open(join(dirname(__file__),"email_config.yaml"), "r") as f:
            config = safe_load(f)

sender_email = config["sender_email"]
# receiver_email = config["receiver_email"]
receiver_email = "prueba.starsa@gmail.com"; 
password = config["sender_password"]

import smtplib, ssl
port = 465  # For SSL
smtp_server = "smtp.gmail.com"

context = ssl.create_default_context()
def send_mail(id):
    buzzer_alarm()
    write_csv_file(join(dirname(__file__),'reporte_incidentes_{}.csv'.format(date.today())),[datetime.now().strftime('%Y/%m/%d'),datetime.now().strftime('%H:%M:%S'),id,"Sintomas de fatiga"])
    # subject = f"Comunicado de Incidente Síntomas de Fatiga en Conductor {datetime.now().strftime('%Y/%m/%d %H:%M:%S')}"

    try:
        message = f"""\
        Subject: Comunicado de Incidente Síntomas de Fatiga en Conductor {id} el {datetime.now().strftime('%Y/%m/%d %H:%M:%S')}
        
Estimados miembros del equipo,

Queremos informarles sobre un incidente que ocurrió el {datetime.now().strftime("%Y/%m/%d")} a las {datetime.now().strftime("%H:%M:%S")}, 
donde uno de nuestros conductores con ID {id} presentó síntomas de fatiga mientras estaba en servicio. 
La seguridad y el bienestar de nuestro personal y de quienes nos rodean son de suma importancia para nosotros,
por lo que queremos abordar este asunto de manera transparente y proactiva.  
    
Queremos enfatizar que estamos comprometidos con la seguridad en carretera y con mantener 
altos estándares de bienestar para nuestro equipo. Continuaremos monitoreando de cerca la situación
y tomaremos todas las medidas necesarias para prevenir incidentes similares en el futuro.
        """.encode("utf-8")
        
        with smtplib.SMTP_SSL(smtp_server, port, context=context) as server:
            server.login(sender_email, password)
            server.sendmail(sender_email, receiver_email, message)
    except:
        pass

# Function to gather drowsiness-related variables and send them as JSON
def send_drowsiness_data(ear, mar, ht, status):
    # Create a dictionary with the relevant data
    data = {
        "ear": ear,
        "mar": mar,
        "head_tilt": ht,
        "status": status,
        "timestamp": datetime.now().isoformat(),
        "id": id_conductor
    }
    
    # Convert the dictionary to a JSON string
    json_data = json.dumps(data)
    
    # Define the URL of the remote server
    url = "http://your-remote-server.com/api/drowsiness"  # Replace with your server URL
    
    # Send the JSON data to the remote server
    try:
        response = requests.post(url, json=json_data)
        if response.status_code == 200:
            print("Data sent successfully!")
        else:
            print(f"Failed to send data: {response.status_code}")
    except Exception as e:
        print(f"An error occurred: {e}")


def alert():
    global ALARM_ON, Last_Email
    if not ALARM_ON:
        ALARM_ON = True
        # check to see if an alarm file was supplied,
        # and if so, start a thread to have the alarm
        # sound played in the background
                        
        # t = Thread(target=buzzer_alarm,)
        
        if(check_time_greater(Last_Email, 60)):
            Last_Email = datetime.now()
            t = Thread(target=send_mail, args=(id_conductor,))
            # t = Thread(target=mandar_correo,)
            t.deamon = True
            t.start()
        
        # Send drowsiness data when alert is triggered
        send_drowsiness_data(ear, mar, ht, STATUS)

        # draw an alarm on the 
        print("Alarma")
    cv2.putText(frame, "DROWSINESS ALERT!", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
    # print("DROWSINESS ALERT!")


def eye_aspect_ratio(eye):
    # compute the euclidean distances between the two sets of
    # vertical eye landmarks (x, y)-coordinates
    A = dist.euclidean(eye[1], eye[5])
    B = dist.euclidean(eye[2], eye[4])
    # compute the euclidean distance between the horizontal
    # eye landmark (x, y)-coordinates
    C = dist.euclidean(eye[0], eye[3])
    # compute the eye aspect ratio
    ear = (A + B) / (2.0 * C)
    # return the eye aspect ratio
    return ear

def eyes_aspect(shape):
    # extract the left and right eye coordinates, then use the
    # coordinates to compute the eye aspect ratio for both eyes
    leftEye = shape[lStart:lEnd]
    rightEye = shape[rStart:rEnd]
    leftEAR = eye_aspect_ratio(leftEye)
    rightEAR = eye_aspect_ratio(rightEye)
    # average the eye aspect ratio together for both eyes
    ear = (leftEAR + rightEAR) / 2.0
    # compute the convex hull for the left and right eye, then
    # visualize each of the eyes
    leftEyeHull = cv2.convexHull(leftEye)
    rightEyeHull = cv2.convexHull(rightEye)
    cv2.drawContours(frame, [leftEyeHull], -1, (0, 255, 0), 1)
    cv2.drawContours(frame, [rightEyeHull], -1, (0, 255, 0), 1)
    return ear

# calculating the aspect ratio of the mouth (MAR)
def mouth_aspect_ratio(shape):
    mouth = shape[mouth_start:mouth_end]
    # Vertical distance (upper and lower lip)
    A = dist.euclidean(mouth[2], mouth[10])
    # Vertical distance (mouth edge)
    B = dist.euclidean(mouth[4], mouth[8])
    # Horizontal distance (mouth ends)
    C = dist.euclidean(mouth[0], mouth[6])
    mar = (A + B) / (2.0 * C)
    return mar
    
def head_tilt(shape_p):
    # Get coordinates of all face points
    shape = [(shape_p.part(i).x, shape_p.part(i).y) for i in range(68)]
    # Extract coordinates of the nose (point 33 in a 
    # typical 68-point face)
    nose_y = shape[33][1]
    cv2.putText(frame, f"Nose Y: {nose_y}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
    # Compare the vertical position of the nose with 
    # the defined threshold
    if nose_y > HEAD_THRESH:
        # If the nose is above the threshold, interpret 
        # this as forward tilt
        return True
    else:
        # If the nose is below the threshold, interpret 
        # this as backward tilt
        return False
    
# Calculate the number of seconds between two dates
def time_elapsed(start, end):
    # if start is not defined, it sets the current 
    # date, otherwise its value
    start = start or datetime.now()
    # if end is not defined, it sets the current 
    # date, otherwise its value
    end = end or datetime.now()
    # returns calculates the difference and passes 
    # the value to seconds
    return (end - start).total_seconds()

# check if the time is greater or equal between two dates
def check_time_greater(start, time_lapse):
    # Calculates the time difference between 'start' 
    # and the current time.
    elapsed = time_elapsed(start, None)
    # returns True if the elapsed time is greater than or 
    # equal to the time_lapse, otherwise returns False
    return True if elapsed >= time_lapse else False

# checks if the time is less than or equal between two dates
def check_time_less(start, time_lapse):
    # Calculates the time difference between 'start' 
    # and the current time.
    elapsed = time_elapsed(start, None)
    # returns True if the elapsed time is greater than or 
    # equal to the time_lapse, otherwise returns False
    return True if elapsed <= time_lapse else False

def validate_sequence(index):
    # Uses the global variable Last_Time
    global Last_Time
    # Calculates the time difference between the last 
    # recorded time and the current time.
    elapsed = time_elapsed(Last_Time["time"], None)
    # Determines the response based on the conditions:
    # 1 if the time difference is greater than 3 seconds.
    # 2 if the time difference is less than or equal to 3 
    # seconds and the current index is different from the 
    # last one recorded.
    resp = 2 if elapsed <= MAXIMUM_TIME_LAPSE and Last_Time["index"] != index  else 1
    # Update values in Last_Time
    Last_Time["time"] = datetime.now()
    Last_Time["index"] = index
    return resp

def low_flicker(ear, flicker_start):
    # Use the global CHANGE_TIME variable
    global CHANGE_TIME
    # Check if the eye is below the flicker threshold
    if ear < EYE_AR_THRESH:
        # Calculate the elapsed time since flicker start
        elapsed = check_time_greater(flicker_start, 0.6)
        # If elapsed time is greater than 0.6 seconds
        if elapsed:
            # Update STATUS and CHANGE_TIME
            STATUS[0] = validate_sequence(0)
            CHANGE_TIME[0] = True
            print("No flicker")
        else:
            # Reset CHANGE_TIME
            CHANGE_TIME[0] = False
    # If the eye is not below the threshold
    else:
        # Set CHANGE_TIME to True
        CHANGE_TIME[0] = True
        STATUS[0] = 0

def yawning(mar, yawn_start):
    # Use the global CHANGE_TIME variable
    global CHANGE_TIME
    # Check if the mouth opening is greater than the mouth 
    # opening threshold
    if mar > MOUTH_AR_THRESH:
        # Calculate the elapsed time since yawn start
        elapsed = check_time_greater(yawn_start, 3)
        # If elapsed time is greater than 3 seconds
        if elapsed:
            # Update STATUS and CHANGE_TIME
            STATUS[1] = validate_sequence(1)
            CHANGE_TIME[1] = True
            print("Yawn")
        else:
            # Reset CHANGE_TIME
            CHANGE_TIME[1] = False
    # If the mouth opening is not greater than the threshold
    else:
        # Set CHANGE_TIME to True
        CHANGE_TIME[1] = True
        STATUS[1] = 0

def pitch(tilt, pitch_start):
    # Use the global CHANGE_TIME variable
    global CHANGE_TIME
    # Check if the tilt is true
    if tilt:
        # Reset CHANGE_TIME and STATUS for pitch
        CHANGE_TIME[2] = False
        STATUS[2] = 0
    # If the tilt is false
    else:
        # Check if CHANGE_TIME for pitch is currently False
        if not CHANGE_TIME[2]:
            # Calculate the elapsed time since pitch start
            elapsed = check_time_less(pitch_start, 1)
            # If elapsed time is less than 1 second
            if elapsed:
                # Validate the sequence and set STATUS
                STATUS[2] = validate_sequence(2)
                print("Pitch")
            else:
                # Reset STATUS to 0
                STATUS[2] = 0
        # Always set CHANGE_TIME to True
        CHANGE_TIME[2] = True

    
# define a constant for the eye aspect ratio to indicate 
# blinking, another to indicate yawning and a final one 
# to indicate nodding.
EYE_AR_THRESH = 0.24
MOUTH_AR_THRESH = 0.6
HEAD_THRESH = 300 # y-axis
# initialize a boolean used to indicate if the alarm is going 
# off and Different symptom states
ALARM_ON = False
# pos -> 1: ear, 2: mar, 3: ht
STATUS = [0, 0, 0]
# constant indicating time in seconds for the pattern sequence
MAXIMUM_TIME_LAPSE = 3
# Constant to initialize the times with a valid value
TIME = datetime.strptime("2024-08-30 09:17:55", '%Y-%m-%d %H:%M:%S')
# Create a dictionary to store the last recorded time and index
Last_Time = {
    "time" : TIME,
    "index": -1
}
Last_Email = TIME
# initialize dlib's face detector (HOG-based) and then create
# the facial landmark predictor
print("[INFO] loading facial landmark predictor...")
detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor(join(dirname(__file__),"models","shape_predictor_68_face_landmarks.dat"))


# grab the indexes of the facial landmarks for the left and
# right eye, respectively
(lStart, lEnd) = face_utils.FACIAL_LANDMARKS_IDXS["left_eye"]
(rStart, rEnd) = face_utils.FACIAL_LANDMARKS_IDXS["right_eye"]
(mouth_start, mouth_end) = (48, 68)

# start the video stream thread
print("[INFO] starting video stream thread...")

cap = cv2.VideoCapture(0)
cap.set(3,1280)
cap.set(4,720)

# bz.on()
# sleep(0.5)
# bz.off()

# Interrupter to allow change in the timing of each pattern
CHANGE_TIME = [True, True, False]
# Initialize times
flicker_start = TIME
pitch_start = TIME
yawn_start = TIME

# loop over frames from the video stream
while True:
    # grab the frame from the threaded video file stream, resize
    # it, and convert it to grayscale
    # channels)
    ret, frame = cap.read()
    if not ret:
        print("Failed to grab frame due to camera error caused by this piece of shit of an operating system")
        break
    
    frame = cv2.resize(frame, (640,480), interpolation = cv2.INTER_AREA)
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # detect faces in the grayscale frame
    rects = detector(gray, 0)
    
    for rect in rects:
        # determine the facial landmarks for the face region, then
        # convert the facial landmark (x, y)-coordinates to a NumPy
        # array
        shape_p = predictor(gray, rect)
        shape = face_utils.shape_to_np(shape_p)

        # Calculate eye aspect ratios
        ear = eyes_aspect(shape)
        # Calculate mouth aspect ratio
        mar = mouth_aspect_ratio(shape)
        # Calculate head tilt
        ht = head_tilt(shape_p)

        # If no blinking within 1 minute
        flicker_start = datetime.now() if CHANGE_TIME[0] == True else flicker_start
        low_flicker(ear, flicker_start)

        # If there is yawning
        yawn_start =  datetime.now() if CHANGE_TIME[1] == True else yawn_start
        yawning(mar, yawn_start)

        # If there is pitching
        pitch_start = datetime.now() if CHANGE_TIME[2] == True else pitch_start
        pitch(ht, pitch_start)

        # Send drowsiness data when alert is triggered
        send_drowsiness_data(ear, mar, ht, STATUS)

        # If there are two symptoms of fatigue, sound the alarm
        if sum(STATUS) >= 2:
            alert()
        else:
            ALARM_ON = False

        # draw the computed eye aspect ratio on the frame to help
        # with debugging and setting the correct eye aspect ratio
        # thresholds and frame counters
        cv2.putText(frame, "EAR: {:.2f}".format(ear), (300, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
        # print("EAR: {:.2f}".format(ear))

    # show the frame
    cv2.namedWindow("Frame", cv2.WND_PROP_FULLSCREEN)
    cv2.setWindowProperty("Frame",cv2.WND_PROP_FULLSCREEN,cv2.WINDOW_FULLSCREEN)
    cv2.imshow("Frame", frame)
    key = cv2.waitKey(1) & 0xFF

    # if the `q` key was pressed, break from the loop
    if key == ord("q"):
        break
# do a bit of cleanup
cap.release()
cv2.destroyAllWindows()
