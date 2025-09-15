# import yaml
# import smtplib
# from email.mime.multipart import MIMEMultipart
# from email.mime.text import MIMEText
# from datetime import datetime

# def send_email(subject, body):
#     # Load email account information from YAML file
#     with open("email_config.yaml", "r") as f:
#         config = yaml.safe_load(f)

#     sender_email = config["sender_email"]
#     sender_password = config["sender_password"]
#     receiver_email = config["receiver_email"]

#     # Create the email message
#     msg = MIMEMultipart()
#     msg['From'] = sender_email
#     msg['To'] = receiver_email
#     msg['Subject'] = subject
#     msg.attach(MIMEText(body, 'plain'))

#     # Send the email
#     try:
#         server = smtplib.SMTP('smtp.gmail.com', 587)
#         server.starttls()
#         server.login(sender_email, sender_password)
#         text = msg.as_string()
#         server.sendmail(sender_email, receiver_email, text)
#         server.quit()
#         print("Email sent!")
#     except Exception as e:
#         print("Error sending email:", e)

# # Example event handler
# def event_handler():
#     with open("email_config.yaml", "r") as f:
#         config = yaml.safe_load(f)

#     subject = "Event triggered!"
#     body = "An event has been triggered at {}".format(datetime.now())
#     send_email(subject, body)

# # Trigger the event
# event_handler()


import yaml
import yagmail

with open("email_config.yaml", "r") as f:
        config = yaml.safe_load(f)

sender_email = config["sender_email"]
receiver_email = config["receiver_email"]
asunto = "Yagmail test without attachment"
body = """Hello there from Yagmail
This is a broadcast test to determine 
"""
# filename = "document.pdf"

yag = yagmail.SMTP(sender_email)
yag.send(
    to = receiver_email,
    subject = asunto,
    contents = body, 
    # attachments=filename,
)
