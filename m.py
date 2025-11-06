import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

def send_email(receiver_email, otp_number):
    SMTP_SERVER = "smtp.gmail.com"  # SMTP server (Gmail)
    SMTP_PORT = 587  # TLS port


    subject = "hi"
    body = "hi, this is the otp number: " + otp_number
    sender_email = "shaikhazeem4646@gmail.com"
    sender_password = "mooicmexxptahzxo"
    
    try:
        # Create email message
        msg = MIMEMultipart()
        msg["From"] = sender_email
        msg["To"] = receiver_email
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))



        # Establish connection with the SMTP server
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()  # Secure the connection
        server.login(sender_email, sender_password)

        # Send email
        server.sendmail(sender_email, receiver_email, msg.as_string())
        server.quit()

        print("Email sent successfully!")

    except Exception as e:
        print(f"Error: {e}")

send_email("shaikhfahad687@gmail.com", "123")