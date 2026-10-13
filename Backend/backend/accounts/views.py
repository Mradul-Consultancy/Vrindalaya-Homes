# apps/authentication/views.py
import logging

from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import smart_str, DjangoUnicodeDecodeError
from django.contrib.auth.tokens import default_token_generator

from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

from .serializers import (
    UserRegisterSerializer,
    LoginSerializer,
    PasswordResetRequestSerializer,
    SetNewPasswordSerializer,
    LogoutUserSerializer,
)
from .utils import EmailUtil
from .models import User

logger = logging.getLogger(__name__)


class RegisterUserView(GenericAPIView):
    """
    Registers a new user and sends an email-verification link.
    """
    serializer_class = UserRegisterSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'register'

    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        try:
            EmailUtil.send_verification_email(user, request)
        except Exception as exc:  # noqa: BLE001
            logger.exception("Verification email failed", exc_info=exc)
            return Response(
                {
                    "data": {"email": user.email},
                    "message": (
                        "User created, but we couldn’t send a verification email. "
                        "Please contact support."
                    ),
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            {
                "data": {
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "is_verified": user.is_verified,
                },
                "message": "User created successfully. Please check your email to verify your account.",
            },
            status=status.HTTP_201_CREATED,
        )


class VerifyEmailView(GenericAPIView):
    """
    Confirms the email-verification token sent to the user.
    Browsers get a simple HTML message; API clients still get JSON if they
    set an Accept header of application/json.
    """

    def get(self, request, token):
        user = get_object_or_404(User, verification_token=token)

        if user.is_verified:
            return HttpResponse("Email already verified.")

        if not user.is_token_valid():
            response = {"detail": "Verification token has expired."}
            return (
                Response(response, status=400)
                if request.accepted_media_type == "application/json"
                else HttpResponse(response["detail"], status=400)
            )

        user.is_verified = True
        user.verification_token = None
        user.token_created_at = None
        user.save(update_fields=["is_verified", "verification_token", "token_created_at"])

        return HttpResponse("Email verified successfully!")


class LoginUserView(GenericAPIView):
    serializer_class = LoginSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'login'

    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class TestAuthenticationView(GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"msg": "It works"}, status=status.HTTP_200_OK)


class PasswordResetRequestView(GenericAPIView):
    serializer_class = PasswordResetRequestSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'password_reset'

    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()  # <== 🔥 this triggers the email
        return Response({'message': "A link has been sent to your email to reset your password."}, status=status.HTTP_200_OK)


class PasswordResetConfirm(GenericAPIView):
    """
    Validates the uid/token pair sent to the user.
    """

    def get(self, request, uidb64, token):
        try:
            uid_int = int(smart_str(urlsafe_base64_decode(uidb64)))
            user = User.objects.get(id=uid_int)

            if not default_token_generator.check_token(user, token):
                raise ValueError("Invalid or expired token")

            return Response(
                {
                    "success": True,
                    "message": "Token is valid.",
                    "uidb64": uidb64,
                    "token": token,
                },
                status=status.HTTP_200_OK,
            )

        except (DjangoUnicodeDecodeError, ValueError, User.DoesNotExist):
            return Response(
                {"message": "Invalid or expired token."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class SetNewPassword(GenericAPIView):
    serializer_class = SetNewPasswordSerializer

    def patch(self, request):
        serializer = self.serializer_class(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()  # <- actually resets the password
        return Response(
            {"message": "Password has been reset successfully."},
            status=status.HTTP_200_OK,
        )


class LogoutUserView(GenericAPIView):
    serializer_class = LogoutUserSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "Logout successful."}, status=status.HTTP_200_OK)