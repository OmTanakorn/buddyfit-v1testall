from django.urls import path
from .views import home
from . import views

app_name = 'pages'

urlpatterns = [
    path('', home, name='home'),
    path('pushup/', views.pushup, name='pushup'),
    path('situp/', views.situp, name='situp'),
    path('squat/', views.squat, name='squat'),
    path('signup/', views.signup, name='signup'),
]
