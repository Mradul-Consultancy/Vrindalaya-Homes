from django.core.mail import send_mail, EmailMessage
from django.conf import settings
from django.urls import reverse


class EmailUtil:
    @staticmethod
    def send_verification_email(user, request):
        # Generate email verification token
        token = user.generate_verification_token()
        
        # Build the verification URL
        verification_url = request.build_absolute_uri(
            reverse('verify-email', kwargs={'token': token})
        )
        
        # Compose the email
        subject = 'Verify your email address'
        message = f'''
        Hi {user.full_name},

        Thank you for registering! Please click the link below to verify your email address:

        {verification_url}

        This link will expire in 24 hours.

        If you didn't create this account, please ignore this email.

        Best regards,
        The Industry Machine Team
        '''
        
        # Send the email
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[user.email],
            fail_silently=False,
        )
def send_normal_email(data):
        print("Data")
        email = EmailMessage(
            subject=data['email_subject'],
            body=data['email_body'],
            from_email=settings.EMAIL_HOST_USER,
            to=[data['to_email']],
        )
        email.send(fail_silently=False)
