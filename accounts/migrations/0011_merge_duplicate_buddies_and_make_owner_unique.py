from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


def merge_duplicate_buddies(apps, schema_editor):
    Buddy = apps.get_model("accounts", "Buddy")
    owner_ids = (
        Buddy.objects.values_list("owner_id", flat=True)
        .order_by()
        .distinct()
    )

    for owner_id in owner_ids:
        buddies = list(Buddy.objects.filter(owner_id=owner_id).order_by("id"))
        if len(buddies) < 2:
            continue

        primary = buddies[0]
        primary.armpower = sum(buddy.armpower for buddy in buddies)
        primary.bodypower = sum(buddy.bodypower for buddy in buddies)
        primary.legpower = sum(buddy.legpower for buddy in buddies)
        primary.highScore = max(buddy.highScore for buddy in buddies)
        primary.save(
            update_fields=["armpower", "bodypower", "legpower", "highScore"]
        )
        Buddy.objects.filter(id__in=[buddy.id for buddy in buddies[1:]]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0010_alter_exhistory_excount"),
    ]

    operations = [
        migrations.RunPython(merge_duplicate_buddies, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="buddy",
            name="owner",
            field=models.OneToOneField(
                on_delete=django.db.models.deletion.CASCADE,
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
