from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import CustomUser
from .models import Buddy
import random


class CustomUserCreationForm(UserCreationForm):

    class Meta(UserCreationForm.Meta):
        model = CustomUser
        fields = ('email', 'username',)

class CustomUserChangeForm(UserChangeForm):

    class Meta:
        model = CustomUser
        fields = ('email', 'username',)

class RandomSkinWidget(forms.HiddenInput):
    def render(self, name, value, attrs=None, renderer=None):
        choices = ['MINOTOR', 'DODO']
        value = random.choice(choices)
        return super().render(name, value, attrs)

class BuddyForm(forms.ModelForm):
    class Meta:
        model = Buddy
        fields = ['name', 'skinname']
        widgets = {
            'owner': forms.HiddenInput(),
            'skinname': RandomSkinWidget()
        }
