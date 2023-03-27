from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from accounts.models import Buddy

@login_required
def home(request):
    # ดึงข้อมูล Buddy ของผู้ใช้งานปัจจุบัน
    buddies = Buddy.objects.filter(owner=request.user)
    context = {
        'buddies': buddies
    }
    return render(request, 'pages\home.html', context)
