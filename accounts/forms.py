from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import CustomUser
from .models import Buddy
from django.contrib.auth.models import User


class CustomUserCreationForm(UserCreationForm):

    class Meta(UserCreationForm.Meta):
        model = CustomUser
        fields = ('email', 'username',)

class CustomUserChangeForm(UserChangeForm):

    class Meta:
        model = CustomUser
        fields = ('email', 'username',)

class BuddyForm(forms.ModelForm):
    class Meta:
        model = Buddy
        fields = ('name', 'skinname', 'armpower', 'legpower', 'bodypower')


class SignUpForm(UserCreationForm):
    buddy_name = forms.CharField(max_length=30, required=False, help_text='Optional.')

    class Meta:
        model = User
        fields = ('username', 'buddy_name', 'password1', 'password2')

    def save(self, commit=True):
        user = super(SignUpForm, self).save(commit=False)
        user.save()

        buddy_name = self.cleaned_data.get('buddy_name')
        if buddy_name:
            buddy = Buddy.objects.create(name=buddy_name, owner=user)
            buddy.save()

        return user