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
    armpower = models.IntegerField()
    legpower = models.IntegerField()
    bodypower = models.IntegerField()
    owner = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    
    def __str__(self):
        return self.name
    
class ExHistory(models.Model):
    exType = models.CharField(max_length=255)
    exCount = models.IntegerField(10)
    exData = models.DateTimeField()
    owner = models.ForeignKey(get_user_model() , on_delete=models.CASCADE)
    def __str__(self):
        return str(self.owner) + " เล่นท่า " +self.exType+ ' จำนวน : ' + str(self.exCount)


