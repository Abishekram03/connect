from django.db import migrations


def assign_ticket_ids(apps, schema_editor):
    Conversation = apps.get_model("conversations", "Conversation")
    from django.db.models import Max

    orgs = Conversation.objects.values_list("organization_id", flat=True).distinct()
    for org_id in orgs:
        convs = Conversation.objects.filter(organization_id=org_id).order_by("created_at")
        for i, conv in enumerate(convs, start=1):
            Conversation.objects.filter(pk=conv.pk).update(ticket_id=i)


class Migration(migrations.Migration):

    dependencies = [
        ("conversations", "0005_conversation_ticket_id"),
    ]

    operations = [
        migrations.RunPython(assign_ticket_ids, migrations.RunPython.noop),
    ]
