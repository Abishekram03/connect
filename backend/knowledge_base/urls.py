from django.urls import path
from . import views

urlpatterns = [
    path("knowledge/categories", views.category_list, name="category-list"),
    path("knowledge/categories/<uuid:pk>", views.category_detail, name="category-detail"),
    path("knowledge/articles", views.article_list, name="article-list"),
    path("knowledge/articles/<uuid:pk>", views.article_detail, name="article-detail"),
    path("knowledge/faqs", views.faq_list, name="faq-list"),
    path("knowledge/faqs/<uuid:pk>", views.faq_detail, name="faq-detail"),
    path("widget/help-center", views.widget_help_center, name="widget-help-center"),
]
