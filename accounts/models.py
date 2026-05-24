from django.contrib.auth.models import AbstractUser
from django.db import models
from django.contrib.auth import get_user_model


class CustomUser(AbstractUser):
    pass

    def __str__(self):
        return self.email


class Buddy(models.Model):
    name = models.CharField(max_length=255)
    skinname = models.CharField(max_length=255)
    armpower = models.IntegerField(default=0)
    legpower = models.IntegerField(default=0)
    bodypower = models.IntegerField(default=0)
    highScore = models.IntegerField(default=0)
    owner = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)

    class Meta:
        indexes = [
            models.Index(fields=["-highScore"], name="buddy_highscore_idx"),
            models.Index(fields=["owner"], name="buddy_owner_idx"),
        ]

    def __str__(self):
        return self.name


class ExHistory(models.Model):
    class ExerciseType(models.TextChoices):
        PUSHUP = "pushup", "Push-up"
        SITUP = "situp", "Sit-up"
        SQUAT = "squat", "Squat"

    exType = models.CharField(max_length=10, choices=ExerciseType.choices)
    exCount = models.PositiveIntegerField(default=0)
    exData = models.DateField(auto_now_add=True)
    owner = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)

    class Meta:
        indexes = [
            models.Index(fields=["owner", "exType", "-exData"], name="exhistory_owner_type_idx"),
        ]

    def __str__(self):
        return f"{self.owner} เล่นท่า {self.exType} จำนวน : {self.exCount}"
