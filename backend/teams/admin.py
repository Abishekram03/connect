from django.contrib import admin
from .models import Membership, Team, TeamMembership, Invitation

admin.site.register(Membership)
admin.site.register(Team)
admin.site.register(TeamMembership)
admin.site.register(Invitation)
