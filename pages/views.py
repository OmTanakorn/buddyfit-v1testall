from django.contrib.auth import login, authenticate
from django.contrib.auth.forms import UserCreationForm
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from accounts.models import Buddy

from accounts.forms import SignUpForm


@login_required
def home(request):
    # ดึงข้อมูล Buddy ของผู้ใช้งานปัจจุบัน
    buddies = Buddy.objects.filter(owner=request.user)
    context = {
        'buddies': buddies
    }
    return render(request, 'pages\home.html', context)

def pushup(request):
    # ดึงข้อมูล Buddy ของผู้ใช้งานปัจจุบัน
    buddies = Buddy.objects.filter(owner=request.user)
    context = {
        'buddies': buddies
    }
    return render(request, 'pages\pushup.html', context)

def situp(request):
    # ดึงข้อมูล Buddy ของผู้ใช้งานปัจจุบัน
    buddies = Buddy.objects.filter(owner=request.user)
    context = {
        'buddies': buddies
    }
    return render(request, 'pages\situp.html', context)

def squat(request):
    # ดึงข้อมูล Buddy ของผู้ใช้งานปัจจุบัน
    buddies = Buddy.objects.filter(owner=request.user)
    context = {
        'buddies': buddies
    }
    return render(request, 'pages\squat.html', context)

def signup(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            buddy_name = form.cleaned_data.get('buddy_name')  # อ่านข้อมูลชื่อ Buddy Name จากฟอร์ม
            buddy = Buddy.objects.create(name=buddy_name, owner=user)  # สร้างโมเดล Buddy และเชื่อมต่อกับผู้ใช้

            # Login user
            login(request, user)
            return redirect('home')
    else:
        form = SignUpForm()
    return render(request, 'account/signup.html', {'form': form})