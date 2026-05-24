from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0009_alter_exhistory_exdata"),
    ]

    operations = [
        # Fix exCount: was IntegerField(10) which set verbose_name=10 — now PositiveIntegerField
        migrations.AlterField(
            model_name="exhistory",
            name="exCount",
            field=models.PositiveIntegerField(default=0),
        ),
        # Fix exData: add auto_now_add so date is set automatically on creation
        migrations.AlterField(
            model_name="exhistory",
            name="exData",
            field=models.DateField(auto_now_add=True),
        ),
        # Fix exType: add choices for validation (existing data is compatible)
        migrations.AlterField(
            model_name="exhistory",
            name="exType",
            field=models.CharField(
                choices=[("pushup", "Push-up"), ("situp", "Sit-up"), ("squat", "Squat")],
                max_length=10,
            ),
        ),
        # Add leaderboard index on Buddy
        migrations.AddIndex(
            model_name="buddy",
            index=models.Index(fields=["-highScore"], name="buddy_highscore_idx"),
        ),
        migrations.AddIndex(
            model_name="buddy",
            index=models.Index(fields=["owner"], name="buddy_owner_idx"),
        ),
        # Add composite index on ExHistory for history queries
        migrations.AddIndex(
            model_name="exhistory",
            index=models.Index(
                fields=["owner", "exType", "-exData"], name="exhistory_owner_type_idx"
            ),
        ),
    ]
