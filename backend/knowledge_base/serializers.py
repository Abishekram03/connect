from rest_framework import serializers
from .models import Category, Article, FAQ


class CategorySerializer(serializers.ModelSerializer):
    article_count = serializers.SerializerMethodField()
    faq_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "description", "sort_order", "article_count", "faq_count", "created_at", "updated_at"]

    def get_article_count(self, obj):
        return obj.articles.count()

    def get_faq_count(self, obj):
        return obj.faqs.count()


class CategoryMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]


class ArticleSerializer(serializers.ModelSerializer):
    category = CategoryMinimalSerializer(read_only=True)
    category_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Article
        fields = [
            "id", "title", "content", "excerpt", "published",
            "category", "category_id", "sort_order", "created_at", "updated_at",
        ]

    def create(self, validated_data):
        category_id = validated_data.pop("category_id", None)
        if category_id:
            validated_data["category_id"] = category_id
        return super().create(validated_data)

    def update(self, instance, validated_data):
        category_id = validated_data.pop("category_id", None)
        if "category_id" in self.initial_data:
            instance.category_id = category_id
        return super().update(instance, validated_data)


class ArticleListSerializer(serializers.ModelSerializer):
    category = CategoryMinimalSerializer(read_only=True)

    class Meta:
        model = Article
        fields = ["id", "title", "excerpt", "published", "category", "sort_order", "created_at", "updated_at"]


class FAQSerializer(serializers.ModelSerializer):
    category = CategoryMinimalSerializer(read_only=True)
    category_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = FAQ
        fields = ["id", "question", "answer", "category", "category_id", "sort_order", "created_at", "updated_at"]

    def create(self, validated_data):
        category_id = validated_data.pop("category_id", None)
        if category_id:
            validated_data["category_id"] = category_id
        return super().create(validated_data)

    def update(self, instance, validated_data):
        category_id = validated_data.pop("category_id", None)
        if "category_id" in self.initial_data:
            instance.category_id = category_id
        return super().update(instance, validated_data)


class ArticlePublicSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True, default=None)

    class Meta:
        model = Article
        fields = ["id", "title", "excerpt", "content", "category_name", "updated_at"]


class FAQPublicSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True, default=None)

    class Meta:
        model = FAQ
        fields = ["id", "question", "answer", "category_name"]
