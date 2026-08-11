from datetime import date
from django.contrib.auth import login, authenticate
import json
from django.db.models import Window
from django.db.models.functions import DenseRank
from django.http import HttpResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from accounts.models import Buddy,ExHistory
from django.db.models.functions import DenseRank
from accounts.forms import BuddyForm
from django.core.serializers.json import DjangoJSONEncoder


@login_required
def home(request):
    # ดึงข้อมูล Buddy ของผู้ใช้งานปัจจุบัน
     # เช็คว่ามี Buddy ของผู้ใช้ปัจจุบันหรือไม่
    if not Buddy.objects.filter(owner=request.user).exists():
        # ถ้าไม่มี Buddy ให้เด้งไปยังหน้า create_buddy
        return redirect('create_buddy/')
    # ถ้ามี Buddy ให้ทำอะไรต่อที่คุณต้องการ
    buddies = Buddy.objects.filter(owner=request.user)
    context = {
        'buddies': buddies
    }
    return render(request, 'pages/home.html', context)

def leaderboard(request):
    # ดึงข้อมูล Buddy และเรียงลำดับตามคะแนน highScore
    buddies = Buddy.objects.all().order_by('-highScore')
    
    context = {
        'buddies': buddies
    }
    # ส่งข้อมูลไปยัง HTML template
    return render(request, 'pages/leaderboard.html', context)

@login_required
def ex_history(request):
    user = request.user
    ex_history = ExHistory.objects.filter(owner=user).order_by('-exData')
    
    pushup_data = [{'date': entry.exData, 'count': entry.exCount} for entry in ex_history if entry.exType == 'pushup']
    situp_data = [{'date': entry.exData, 'count': entry.exCount} for entry in ex_history if entry.exType == 'situp']
    squat_data = [{'date': entry.exData, 'count': entry.exCount} for entry in ex_history if entry.exType == 'squat']

    
    pushup_data_json = json.dumps(pushup_data, cls=DjangoJSONEncoder)
    situp_data_json = json.dumps(situp_data, cls=DjangoJSONEncoder)
    squat_data_json = json.dumps(squat_data, cls=DjangoJSONEncoder)
    

    context = {
        'pushup_data': pushup_data_json,
        'situp_data' : situp_data_json,
        'squat_data' : squat_data_json,
    }
    
    return render(request, 'pages/ex_history.html', context)

@login_required
def pushup(request):
    # ดึงข้อมูล Buddy ของผู้ใช้งานปัจจุบัน
    buddies = Buddy.objects.filter(owner=request.user)
    context = {
        'buddies': buddies
    }
    return render(request, 'pages/pushup.html', context)

@login_required
def situp(request):
    # ดึงข้อมูล Buddy ของผู้ใช้งานปัจจุบัน
    buddies = Buddy.objects.filter(owner=request.user)
    context = {
        'buddies': buddies
    }
    return render(request, 'pages/situp.html', context)

@login_required
def squat(request):
    # ดึงข้อมูล Buddy ของผู้ใช้งานปัจจุบัน
    buddies = Buddy.objects.filter(owner=request.user)
    context = {
        'buddies': buddies
    }
    return render(request, 'pages/squat.html', context)

#challenge
@login_required
def challenge(request):
    # ดึงข้อมูล Buddy ของผู้ใช้งานปัจจุบัน
    buddies = Buddy.objects.filter(owner=request.user)
    context = {
        'buddies': buddies
    }
    return render(request, 'pages/challenge.html', context)


@login_required
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

def _parse_count(raw):
    """แปลงค่า count จากฟอร์ม ถ้าว่าง/พัง ให้เป็น 0 แทนที่จะ 500"""
    try:
        return int(float(raw or 0))
    except (TypeError, ValueError):
        return 0


@login_required
def update_pushup(request):
    if request.method == 'POST':
        count = _parse_count(request.POST.get("pushup_count"))
        owner = request.user
        buddy = get_object_or_404(Buddy, owner=owner)
        buddy.armpower += count
        buddy.save()
        
        # บันทึกค่า count ลงใน ExHistory
        if count > 0:
            ex_history = ExHistory.objects.create(
                exType="pushup",
                exCount=count,
                exData=date.today(),  # สามารถใช้เวลาปัจจุบันหรือวิธีอื่นในการกำหนดเวลาได้
                owner=owner
        )

    return redirect('/')

@login_required
def update_situp(request):
    if request.method == 'POST':
        count = _parse_count(request.POST.get("situp_count"))
        owner = request.user
        buddy = get_object_or_404(Buddy, owner=owner)
        buddy.bodypower += count
        buddy.save()
        # บันทึกค่า count ลงใน ExHistory
        if count > 0:
            ex_history = ExHistory.objects.create(
                exType="situp",
                exCount=count,
                exData=date.today(),  # สามารถใช้เวลาปัจจุบันหรือวิธีอื่นในการกำหนดเวลาได้
                owner=owner
            )
    return redirect('/')

@login_required
def update_squat(request):
    if request.method == 'POST':
        count = _parse_count(request.POST.get("squat_count"))
        owner = request.user
        buddy = get_object_or_404(Buddy, owner=owner)
        buddy.legpower += count
        buddy.save()
        # บันทึกค่า count ลงใน ExHistory
        if count > 0:
            ex_history = ExHistory.objects.create(
                exType="squat",
                exCount=count,
                exData=date.today(),  # สามารถใช้เวลาปัจจุบันหรือวิธีอื่นในการกำหนดเวลาได้
                owner=owner
            )
    return redirect('/')

@login_required
def update_score(request):
    if request.method == 'POST':
        # หน้าเกมอาจส่งค่าว่าง "null" หรือทศนิยมมา ถ้าผู้เล่นยังไม่จบเกม
        score = _parse_count(request.POST.get("score"))
        owner = request.user
        buddy = get_object_or_404(Buddy, owner=owner)
        if(buddy.highScore <= score):
            buddy.highScore = score
            buddy.save()
    return redirect('/')


