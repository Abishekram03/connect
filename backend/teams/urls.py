from django.urls import path
from . import views

urlpatterns = [
    path("members", views.list_members, name="list-members"),
    path("members/invite", views.invite_member, name="invite-member"),
    path("members/<uuid:pk>", views.update_member_role, name="update-member-role"),
    path("members/<uuid:pk>/remove", views.remove_member, name="remove-member"),
    path("invitations", views.list_invitations, name="list-invitations"),
    path("invitations/<uuid:pk>/resend", views.resend_invitation, name="resend-invitation"),
    path("invitations/<uuid:pk>", views.cancel_invitation, name="cancel-invitation"),
    path("invitations/accept", views.accept_invitation, name="accept-invitation"),
    path("invitations/info", views.get_invitation_by_token, name="invitation-info"),
    path("teams", views.list_teams, name="list-teams"),
    path("teams/create", views.create_team, name="create-team"),
    path("teams/<uuid:pk>", views.get_team, name="get-team"),
    path("teams/<uuid:pk>/update", views.update_team, name="update-team"),
    path("teams/<uuid:pk>/delete", views.delete_team, name="delete-team"),
    path("teams/<uuid:pk>/members", views.add_team_members, name="add-team-members"),
    path("teams/<uuid:pk>/members/<uuid:user_id>", views.remove_team_member, name="remove-team-member"),
    path("teams/<uuid:pk>/members/<uuid:user_id>/role", views.update_team_member_role, name="update-team-member-role"),
    path("teams/<uuid:pk>/analytics", views.team_analytics, name="team-analytics"),
    path("conversations/<uuid:pk>/auto-assign", views.auto_assign, name="auto-assign"),
    path("user-orgs", views.user_orgs, name="user-orgs"),
    path("switch-org", views.switch_org, name="switch-org"),
]
