# Generated by Django 4.2.5 on 2023-10-10 17:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0007_alter_buddy_armpower_alter_buddy_bodypower_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='buddy',
            name='highScore',
            field=models.IntegerField(default=0),
        ),
    ]
