from django.contrib.auth import get_user_model
from accounts.models import Organization

org, _ = Organization.objects.get_or_create(
    name="My Company",
    slug="my-company",
    defaults={"plan": "free"},
)

User = get_user_model()
user, created = User.objects.get_or_create(
    email="demo@connect.app",
    defaults={
        "username": "demo@connect.app",
        "first_name": "Demo",
        "organization": org,
        "role": "admin",
        "status": "active",
        "is_staff": True,
        "is_superuser": True,
    },
)
user.set_password("demo1234")
user.save()
status = "created" if created else "updated"
print(f"User {status}: demo@connect.app / demo1234")
