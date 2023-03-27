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
    armpower = models.FloatField(10)
    legpowr = models.FloatField(10)
    bodypower = models.FloatField(10)
    owner = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    
    def __str__(self):
        return self.name