from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("auth/send-code", views.send_code, name="send-code"),
    path("auth/verify-code", views.verify_code, name="verify-code"),
    path("auth/complete-signup", views.complete_signup, name="complete-signup"),
    path("auth/signup", views.signup, name="signup"),
    path("auth/signin", views.signin, name="signin"),
    path("auth/me", views.me, name="me"),
    path("auth/logout", views.logout, name="logout"),
    path("auth/forgot-password", views.forgot_password, name="forgot-password"),
    path("auth/reset-password", views.reset_password, name="reset-password"),
    path("auth/refresh", TokenRefreshView.as_view(), name="token-refresh"),
    path("auth/setup-workspace", views.setup_workspace, name="setup-workspace"),
    path("auth/change-password", views.change_password, name="change-password"),
]
