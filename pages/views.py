from django.contrib.auth import login, authenticate
from django.contrib.auth.forms import UserCreationForm
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from accounts.models import Buddy

from accounts.forms import BuddyForm


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

def create_buddy(request):
    if request.method == 'POST':
        form = BuddyForm(request.POST)
        if form.is_valid():
            buddy = form.save(commit=False)
            buddy.owner = request.user
            buddy.save()
            return redirect('/')
    else:
        form = BuddyForm()
    return render(request, 'pages/create.html', {'form': form, 'buddy': None})

# def create_buddy(request):
#     if request.method == 'POST':
#         form = BuddyForm(request.POST)
#         if form.is_valid():
#             buddy = form.save(commit=False)
#             buddy.owner = request.user
#             buddy.save()
#             return redirect('/')
#     else:
#         form = BuddyForm()
#     return render(request, 'pages\create.html', {'form': form})

def update_pushup(request):
    if request.method == 'POST':
        count = int(request.POST["pushup_count"]);
        print("Get post with push up count = ", count)
        owner = request.user
        buddy = get_object_or_404(Buddy, owner=owner)
        buddy.armpower += count
        buddy.save()
    return redirect('/')

def update_situp(request):
    if request.method == 'POST':
        count = int(request.POST["situp_count"]);
        print("Get post with sit up count = ", count)
        owner = request.user
        buddy = get_object_or_404(Buddy, owner=owner)
        buddy.bodypower += count
        buddy.save()
    return redirect('/')

def update_squat(request):
    if request.method == 'POST':
        count = int(request.POST["squat_count"]);
        print("Get post with squat count = ", count)
        owner = request.user
        buddy = get_object_or_404(Buddy, owner=owner)
        buddy.legpower += count
        buddy.save()
    return redirect('/')