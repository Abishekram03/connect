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

    serializer = BrandingSerializer(instance, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(["GET", "PATCH"])
@permission_classes([permissions.IsAuthenticated])
def widget_config(request):
    organization = get_user_org(request.user)
    if not organization:
        return Response({"detail": "No organization found"}, status=status.HTTP_404_NOT_FOUND)

    instance, _ = WidgetConfig.objects.get_or_create(organization=organization)

    if request.method == "GET":
        return Response(WidgetConfigSerializer(instance).data)

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

    serializer = NotificationPreferenceSerializer(instance, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)
