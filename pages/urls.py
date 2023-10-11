from django.urls import path
from .views import home
from . import views

app_name = 'pages'

urlpatterns = [
    path('', home, name='home'),
    path('pushup/', views.pushup, name='pushup'),
    path('situp/', views.situp, name='situp'),
    path('squat/', views.squat, name='squat'),
    path('challenge/', views.challenge, name='challenge'),
    path('create_buddy/', views.create_buddy, name='create_buddy'),
    path('leaderboard/', views.leaderboard, name='leaderboard'),

    path('update_pushup',views.update_pushup,name='update_pushup'),
    path('update_situp',views.update_situp,name='update_situp'),
    path('update_squat',views.update_squat,name='update_squat'),
    path('update_score',views.update_score,name='update_score'),
    
    path('ex_history/', views.ex_history, name='ex_history'),

]
