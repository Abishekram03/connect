from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Category, Article, FAQ
from .serializers import (
    CategorySerializer,
    ArticleSerializer,
    ArticleListSerializer,
    FAQSerializer,
    ArticlePublicSerializer,
    FAQPublicSerializer,
)


def get_user_org(user):
    if hasattr(user, "organization") and user.organization:
        return user.organization
    from teams.models import Membership
    membership = Membership.objects.filter(user=user, status="active").first()
    if membership:
        return membership.organization
    return None


# ─── Categories ───────────────────────────────────────────────

@api_view(["GET", "POST"])
@permission_classes([permissions.IsAuthenticated])
def category_list(request):
    org = get_user_org(request.user)
    if not org:
        return Response({"detail": "No organization found"}, status=status.HTTP_400_BAD_REQUEST)

    if request.method == "GET":
        categories = Category.objects.filter(organization=org)
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    serializer = CategorySerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save(organization=org)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([permissions.IsAuthenticated])
def category_detail(request, pk):
    org = get_user_org(request.user)
    if not org:
        return Response({"detail": "No organization found"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        category = Category.objects.get(pk=pk, organization=org)
    except Category.DoesNotExist:
        return Response({"detail": "Category not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        serializer = CategorySerializer(category)
        return Response(serializer.data)

    if request.method == "DELETE":
        category.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = CategorySerializer(category, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


# ─── Articles ─────────────────────────────────────────────────

@api_view(["GET", "POST"])
@permission_classes([permissions.IsAuthenticated])
def article_list(request):
    org = get_user_org(request.user)
    if not org:
        return Response({"detail": "No organization found"}, status=status.HTTP_400_BAD_REQUEST)

    if request.method == "GET":
        articles = Article.objects.filter(organization=org).select_related("category")
        category_id = request.query_params.get("category_id")
        if category_id:
            articles = articles.filter(category_id=category_id)
        published = request.query_params.get("published")
        if published is not None:
            articles = articles.filter(published=published.lower() == "true")
        serializer = ArticleListSerializer(articles, many=True)
        return Response(serializer.data)

    serializer = ArticleSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save(organization=org)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([permissions.IsAuthenticated])
def article_detail(request, pk):
    org = get_user_org(request.user)
    if not org:
        return Response({"detail": "No organization found"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        article = Article.objects.get(pk=pk, organization=org)
    except Article.DoesNotExist:
        return Response({"detail": "Article not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        serializer = ArticleSerializer(article)
        return Response(serializer.data)

    if request.method == "DELETE":
        article.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = ArticleSerializer(article, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


# ─── FAQs ─────────────────────────────────────────────────────

@api_view(["GET", "POST"])
@permission_classes([permissions.IsAuthenticated])
def faq_list(request):
    org = get_user_org(request.user)
    if not org:
        return Response({"detail": "No organization found"}, status=status.HTTP_400_BAD_REQUEST)

    if request.method == "GET":
        faqs = FAQ.objects.filter(organization=org).select_related("category")
        category_id = request.query_params.get("category_id")
        if category_id:
            faqs = faqs.filter(category_id=category_id)
        serializer = FAQSerializer(faqs, many=True)
        return Response(serializer.data)

    serializer = FAQSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save(organization=org)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([permissions.IsAuthenticated])
def faq_detail(request, pk):
    org = get_user_org(request.user)
    if not org:
        return Response({"detail": "No organization found"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        faq = FAQ.objects.get(pk=pk, organization=org)
    except FAQ.DoesNotExist:
        return Response({"detail": "FAQ not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        serializer = FAQSerializer(faq)
        return Response(serializer.data)

    if request.method == "DELETE":
        faq.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = FAQSerializer(faq, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


# ─── Public Widget API (AllowAny) ────────────────────────────

@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def widget_help_center(request):
    org_id = request.query_params.get("organization_id")
    if not org_id:
        return Response({"detail": "organization_id is required"}, status=status.HTTP_400_BAD_REQUEST)

    from accounts.models import Organization
    try:
        org = Organization.objects.get(pk=org_id)
    except Organization.DoesNotExist:
        return Response({"detail": "Organization not found"}, status=status.HTTP_404_NOT_FOUND)

    categories = Category.objects.filter(organization=org)
    articles = Article.objects.filter(organization=org, published=True).select_related("category")
    faqs = FAQ.objects.filter(organization=org).select_related("category")

    return Response({
        "categories": CategorySerializer(categories, many=True).data,
        "articles": ArticlePublicSerializer(articles, many=True).data,
        "faqs": FAQPublicSerializer(faqs, many=True).data,
    })
