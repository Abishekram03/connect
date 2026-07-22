from django.contrib import admin
from .models import Branding, WidgetConfig, NotificationPreference

admin.site.register(Branding)
admin.site.register(WidgetConfig)
admin.site.register(NotificationPreference)
