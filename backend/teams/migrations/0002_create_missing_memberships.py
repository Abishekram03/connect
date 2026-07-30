from django.db import migrations


def create_missing_memberships(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    Membership = apps.get_model("teams", "Membership")

    for user in User.objects.filter(organization__isnull=False):
        Membership.objects.get_or_create(
            user=user,
            organization=user.organization,
            defaults={"role": user.role if user.role in ("admin", "agent") else "owner", "status": "active"},
        )


def reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ("teams", "0001_initial"),
        ("accounts", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(create_missing_memberships, reverse),
    ]
