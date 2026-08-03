from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Branding, WidgetConfig, NotificationPreference
from .serializers import (
    OrganizationSerializer,
    BrandingSerializer,
    WidgetConfigSerializer,
    NotificationPreferenceSerializer,
)


def get_user_org(user):
    if hasattr(user, "organization") and user.organization:
        return user.organization
    from teams.models import Membership
    membership = Membership.objects.filter(user=user, status="active").first()
    if membership:
        return membership.organization
    return None


def get_user_role(user):
    if hasattr(user, "role") and user.role in ("admin", "owner"):
        return user.role
    from teams.models import Membership
    membership = Membership.objects.filter(user=user, status="active").first()
    if membership:
        return membership.role
    return "agent"


def require_admin_or_owner(user):
    return get_user_role(user) in ("admin", "owner")


def get_or_create_workspace_models(organization):
    Branding.objects.get_or_create(organization=organization)
    WidgetConfig.objects.get_or_create(organization=organization)
    NotificationPreference.objects.get_or_create(organization=organization)


@api_view(["GET", "PATCH"])
@permission_classes([permissions.IsAuthenticated])
def workspace(request):
    organization = get_user_org(request.user)
    if not organization:
        return Response({"detail": "No organization found"}, status=status.HTTP_404_NOT_FOUND)

    get_or_create_workspace_models(organization)

    if request.method == "GET":
        return Response(OrganizationSerializer(organization).data)

    if not require_admin_or_owner(request.user):
        return Response(
            {"detail": "Only admins and owners can modify workspace settings"},
            status=status.HTTP_403_FORBIDDEN,
        )

    # Only owner can change plan
    if "plan" in request.data:
        if get_user_role(request.user) != "owner":
            return Response(
                {"detail": "Only the owner can change the plan"},
                status=status.HTTP_403_FORBIDDEN,
            )

    serializer = OrganizationSerializer(organization, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(["GET", "PATCH"])
@permission_classes([permissions.IsAuthenticated])
def branding(request):
    organization = get_user_org(request.user)
    if not organization:
        return Response({"detail": "No organization found"}, status=status.HTTP_404_NOT_FOUND)

    instance, _ = Branding.objects.get_or_create(organization=organization)

    if request.method == "GET":
        return Response(BrandingSerializer(instance).data)

    if not require_admin_or_owner(request.user):
        return Response(
            {"detail": "Only admins and owners can modify branding"},
            status=status.HTTP_403_FORBIDDEN,
        )

    serializer = BrandingSerializer(instance, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def upload_branding_logo(request):
    organization = get_user_org(request.user)
    if not organization:
        return Response({"detail": "No organization found"}, status=status.HTTP_404_NOT_FOUND)

    if not require_admin_or_owner(request.user):
        return Response(
            {"detail": "Only admins and owners can modify branding"},
            status=status.HTTP_403_FORBIDDEN,
        )

    file = request.FILES.get("logo")
    if not file:
        return Response({"detail": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]
    if file.content_type not in allowed_types:
        return Response(
            {"detail": "Only JPEG, PNG, WebP, GIF, and SVG files are allowed"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if file.size > 2 * 1024 * 1024:
        return Response(
            {"detail": "File size must be under 2MB"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    instance, _ = Branding.objects.get_or_create(organization=organization)

    if instance.logo:
        instance.logo.delete(save=False)

    instance.logo = file
    instance.save(update_fields=["logo"])

    return Response({
        "logo_url": request.build_absolute_uri(instance.logo.url),
    })


@api_view(["DELETE"])
@permission_classes([permissions.IsAuthenticated])
def delete_branding_logo(request):
    organization = get_user_org(request.user)
    if not organization:
        return Response({"detail": "No organization found"}, status=status.HTTP_404_NOT_FOUND)

    if not require_admin_or_owner(request.user):
        return Response(
            {"detail": "Only admins and owners can modify branding"},
            status=status.HTTP_403_FORBIDDEN,
        )

    instance, _ = Branding.objects.get_or_create(organization=organization)
    if instance.logo:
        instance.logo.delete(save=False)
        instance.logo = None
        instance.save(update_fields=["logo"])

    return Response({"detail": "Logo removed"})


@api_view(["GET", "PATCH"])
@permission_classes([permissions.IsAuthenticated])
def widget_config(request):
    organization = get_user_org(request.user)
    if not organization:
        return Response({"detail": "No organization found"}, status=status.HTTP_404_NOT_FOUND)

    instance, _ = WidgetConfig.objects.get_or_create(organization=organization)

    if request.method == "GET":
        return Response(WidgetConfigSerializer(instance).data)

    if not require_admin_or_owner(request.user):
        return Response(
            {"detail": "Only admins and owners can modify widget configuration"},
            status=status.HTTP_403_FORBIDDEN,
        )

    serializer = WidgetConfigSerializer(instance, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(["GET", "PATCH"])
@permission_classes([permissions.IsAuthenticated])
def notifications(request):
    organization = get_user_org(request.user)
    if not organization:
        return Response({"detail": "No organization found"}, status=status.HTTP_404_NOT_FOUND)

    instance, _ = NotificationPreference.objects.get_or_create(organization=organization)

    if request.method == "GET":
        return Response(NotificationPreferenceSerializer(instance).data)

    # Any org member can update their own notification prefs
    serializer = NotificationPreferenceSerializer(instance, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)
