# Generated by Django 4.1.7 on 2023-03-26 09:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_buddy'),
    ]

    operations = [
        migrations.AddField(
            model_name='buddy',
            name='armpower',
            field=models.FloatField(default=0.0, verbose_name=10),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='buddy',
            name='bodypower',
            field=models.FloatField(default=0.0, verbose_name=10),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='buddy',
            name='legpowr',
            field=models.FloatField(default=0.0, verbose_name=10),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='buddy',
            name='skinname',
            field=models.CharField(default=1, max_length=255),
            preserve_default=False,
        ),
    ]
