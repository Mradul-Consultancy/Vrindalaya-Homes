from django.test import TestCase, override_settings
from django.core import mail
from rest_framework import status
from rest_framework.test import APIClient

from .models import User


class LoginApiTests(TestCase):
    def test_login_returns_frontend_token_field_names(self):
        user = User.objects.create_user(
            email='buyer@example.com',
            first_name='Local',
            last_name='Buyer',
            password='Strong-Test-Pass-2026!',
            is_verified=True,
        )
        response = APIClient().post(
            '/api/accounts/auth/login/',
            {'email': user.email, 'password': 'Strong-Test-Pass-2026!'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access_token', response.data)
        self.assertIn('refresh_token', response.data)

    def test_refresh_endpoint_rotates_refresh_tokens(self):
        user = User.objects.create_user(
            email='refresh@example.com',
            first_name='Refresh',
            last_name='User',
            password='Strong-Test-Pass-2026!',
            is_verified=True,
        )
        client = APIClient()
        login = client.post(
            '/api/accounts/auth/login/',
            {'email': user.email, 'password': 'Strong-Test-Pass-2026!'},
            format='json',
        )
        response = client.post(
            '/api/accounts/auth/token/refresh/',
            {'refresh': login.data['refresh_token']},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_password_reset_request_does_not_disclose_unknown_email(self):
        response = APIClient().post(
            '/api/accounts/auth/password-reset/request/',
            {'email': 'not-registered@example.com'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data['message'],
            'A link has been sent to your email to reset your password.',
        )
        self.assertEqual(len(mail.outbox), 0)
