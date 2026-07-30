import random
import string
from datetime import timedelta

from django.core.mail import send_mail
from django.utils import timezone
from django.conf import settings
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.db import transaction

from .models import Organization, VerificationCode
from .serializers import (
    SignupSerializer,
    SigninSerializer,
    UserSerializer,
    SendCodeSerializer,
    VerifyCodeSerializer,
    CompleteSignupSerializer,
    SetupWorkspaceSerializer,
)

UserModel = get_user_model()

CODE_EXPIRY_MINUTES = 10


def generate_code(length=6):
    return "".join(random.choices(string.digits, k=length))


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def send_code(request):
    serializer = SendCodeSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    email = serializer.validated_data["email"]

    # Invalidate previous unused codes
    VerificationCode.objects.filter(email=email, is_used=False).update(is_used=True)

    code = generate_code()
    expires_at = timezone.now() + timedelta(minutes=CODE_EXPIRY_MINUTES)
    VerificationCode.objects.create(
        email=email, code=code, expires_at=expires_at, purpose="signup"
    )

    # Determine if user exists
    user = UserModel.objects.filter(email=email).first()

    send_mail(
        subject="Your Connect verification code",
        message=f"Your verification code is: {code}\n\nThis code expires in {CODE_EXPIRY_MINUTES} minutes.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False,
    )

    exists = user is not None
    if user and user.name:
        name_hint = user.name
    else:
        name_hint = ""

    return Response({
        "detail": "Verification code sent",
        "user_exists": exists,
        "name_hint": name_hint,
    })


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def verify_code(request):
    serializer = VerifyCodeSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    email = serializer.validated_data["email"]
    code = serializer.validated_data["code"]

    vc = VerificationCode.objects.filter(
        email=email, code=code, is_used=False, expires_at__gt=timezone.now()
    ).first()

    if not vc:
        return Response(
            {"detail": "Invalid or expired code"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = UserModel.objects.filter(email=email).first()

    if user:
        # Existing user — sign them in
        refresh = RefreshToken.for_user(user)
        return Response({
            "action": "signin",
            "user": UserSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        })

    # New user — return a temp token for completing signup
    temp_token = generate_code(32)
    request.session[f"temp_signup_{temp_token}"] = {
        "email": email,
        "expires_at": (timezone.now() + timedelta(minutes=30)).isoformat(),
    }
    request.session.modified = True

    return Response({
        "action": "signup",
        "temp_token": temp_token,
    })


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def complete_signup(request):
    serializer = CompleteSignupSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    session_data = request.session.get(f"temp_signup_{data['token']}")
    if not session_data:
        return Response(
            {"detail": "Invalid or expired token"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    expires_at = session_data.get("expires_at")
    if expires_at and timezone.now().isoformat() > expires_at:
        del request.session[f"temp_signup_{data['token']}"]
        request.session.modified = True
        return Response(
            {"detail": "Token expired"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    email = session_data["email"]

    try:
        with transaction.atomic():
            organization = Organization.objects.create(
                name=data["organization_name"],
                slug=data["organization_slug"],
            )

            user = UserModel.objects.create_user(
                email=email,
                password=data["password"],
                username=email,
                first_name=data["name"],
                organization=organization,
                role="admin",
                status="active",
            )

            from teams.models import Membership

            Membership.objects.create(
                user=user,
                organization=organization,
                role="owner",
                status="active",
            )
    except Exception:
        user = UserModel.objects.create_user(
            email=email,
            password=data["password"],
            username=email,
            first_name=data["name"],
            role="admin",
            status="pending",
        )

        VerificationCode.objects.filter(email=email, is_used=False).update(is_used=True)

        del request.session[f"temp_signup_{data['token']}"]
        request.session.modified = True

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "needs_workspace": True,
            },
            status=status.HTTP_201_CREATED,
        )

    # Mark all codes for this email as used
    VerificationCode.objects.filter(email=email, is_used=False).update(is_used=True)

    # Clean up session
    del request.session[f"temp_signup_{data['token']}"]
    request.session.modified = True

    refresh = RefreshToken.for_user(user)
    return Response(
        {
            "user": UserSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def signup(request):
    serializer = SignupSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    refresh = RefreshToken.for_user(user)
    return Response(
        {
            "user": UserSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def signin(request):
    serializer = SigninSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.validated_data["user"]
    refresh = RefreshToken.for_user(user)
    return Response(
        {
            "user": UserSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }
    )


@api_view(["GET", "PATCH"])
@permission_classes([permissions.IsAuthenticated])
def me(request):
    if request.method == "GET":
        return Response(UserSerializer(request.user).data)

    name = request.data.get("name")
    if name:
        request.user.first_name = name
        request.user.save(update_fields=["first_name"])

    return Response(UserSerializer(request.user).data)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    old = request.data.get("old_password")
    new = request.data.get("new_password")
    if not old or not new:
        return Response(
            {"detail": "Both old_password and new_password are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if len(new) < 8:
        return Response(
            {"detail": "New password must be at least 8 characters"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if not request.user.check_password(old):
        return Response(
            {"detail": "Current password is incorrect"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    request.user.set_password(new)
    request.user.save(update_fields=["password"])
    return Response({"detail": "Password updated"})


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def logout(request):
    try:
        refresh_token = request.data.get("refresh")
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
    except Exception:
        pass
    return Response({"detail": "Logged out"})


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def setup_workspace(request):
    serializer = SetupWorkspaceSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    user = request.user
    if user.organization:
        return Response(
            {"detail": "You already have a workspace"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        with transaction.atomic():
            organization = Organization.objects.create(
                name=data["organization_name"],
                slug=data["organization_slug"],
            )
            user.organization = organization
            user.role = "admin"
            user.status = "active"
            user.save(update_fields=["organization", "role", "status"])

            from teams.models import Membership

            Membership.objects.create(
                user=user,
                organization=organization,
                role="owner",
                status="active",
            )
    except Exception:
        return Response(
            {"detail": "Failed to create workspace. Please try again."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return Response({
        "user": UserSerializer(user).data,
    })


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def forgot_password(request):
    email = request.data.get("email")
    if not email:
        return Response({"detail": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        user = UserModel.objects.get(email=email)
        # In production, send password reset email here
        return Response({"detail": "Password reset link sent to email"})
    except UserModel.DoesNotExist:
        return Response({"detail": "Password reset link sent to email"})


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def reset_password(request):
    # In production, validate reset token from email link
    return Response({"detail": "Password reset successful"})
