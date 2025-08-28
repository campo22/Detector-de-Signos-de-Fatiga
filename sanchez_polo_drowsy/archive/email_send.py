import smtplib, ssl

from os.path import join, dirname
from yaml import safe_load

with open(join(dirname(__file__),"email_config.yaml"), "r") as f:
            config = safe_load(f)

sender_email = config["sender_email"]
receiver_email = config["receiver_email"]
password = config["sender_password"]

port = 465  # For SSL
smtp_server = "smtp.gmail.com"

message = """\
Subject: Hi there

This message is sent from Python."""

context = ssl.create_default_context()
with smtplib.SMTP_SSL(smtp_server, port, context=context) as server:
    server.login(sender_email, password)
    server.sendmail(sender_email, receiver_email, message)
