# HANDOFF — BuddyFit revival

เอกสารส่งต่องานสำหรับคนที่มารับช่วงต่อ
อัปเดตล่าสุด: 11 ส.ค. 2026 · branch `feature/phaser-4-migration`

---

## 1. สถานะปัจจุบัน

| เฟส | เนื้องาน | สถานะ |
|---|---|---|
| 0 | เขียน test คลุมพฤติกรรมเดิม | ✅ |
| 1 | อัป Django + dependencies + settings ขับด้วย env | ✅ |
| 2 | MediaPipe Tasks Vision + pose/game event bridge | ✅ |
| 3 | Phaser 4.2.1, Chart.js 4, Bootstrap 5.3, ตัด jQuery | ✅ |
| 4 | deploy จริงบน HTTPS | ⬜ ต้องมี domain/credentials ของ environment จริง |

### stack ปัจจุบัน

| | เวอร์ชัน |
|---|---|
| Python | 3.11 จาก `.python-version` (รองรับ 3.10–3.13) |
| Package manager | uv + `uv.lock` |
| Django | 5.2.17 LTS |
| django-allauth | 65.19 |
| MediaPipe | `@mediapipe/tasks-vision@0.10.35` + Pose Landmarker Full |
| Phaser | 4.2.1 |
| Chart.js | 4.5.1 |
| Bootstrap | 5.3.8 |

---

## 2. เริ่มใช้งาน

```bash
uv sync
uv run python manage.py migrate
uv run python manage.py createsuperuser
uv run python manage.py runserver
```

เปิด `http://127.0.0.1:8000` ได้เลย ค่า dev ทุกตัวมี default แล้ว
รายการ environment variables อยู่ใน `README.md`

### คำสั่งตรวจงาน

```bash
uv lock --check
uv run python manage.py makemigrations --check
uv run python manage.py test

DJANGO_DEBUG=0 \
DJANGO_SECRET_KEY=$(uv run python -c 'from django.core.management.utils import get_random_secret_key as g;print(g())') \
uv run python manage.py check --deploy
```

ตอนนี้มี **48 tests** และทุกตัวต้องเขียวก่อนส่งงานต่อ

---

## 3. สิ่งที่แก้ในรอบล่าสุด

### ปิด KnownGapTests

- `_parse_count()` จำกัด payload จาก client ให้อยู่ในช่วง 0–1,000 และรับมือ
  ค่าเสีย, infinity, float และค่าติดลบโดยไม่เกิด 500
- `Buddy.owner` เปลี่ยนเป็น `OneToOneField` เพื่อบังคับหนึ่ง Buddy ต่อหนึ่ง user
- migration `0011` รวม power ของ Buddy ที่ซ้ำ, เก็บ high score ที่สูงสุด แล้วจึง
  บังคับ unique constraint
- `create_buddy` redirect กลับหน้าแรกทันทีถ้าผู้ใช้มี Buddy อยู่แล้ว

### MediaPipe Tasks Vision

ชั้นกล้องและ detector อยู่ที่ `static/js/pose/detector.js` เพียงไฟล์เดียว:

- `getUserMedia()` + `requestAnimationFrame()`
- `FilesetResolver` + `PoseLandmarker` ในโหมด `VIDEO`
- อ่าน landmark จาก `results.landmarks[0]`
- วาดด้วย `DrawingUtils`
- ลอง GPU ก่อนและ fallback ไป CPU
- หยุด camera tracks และปิด landmarker ตอน `pagehide`
- แสดงข้อความบน canvas เมื่อเปิดกล้องไม่ได้

ไฟล์ `PushUp.js`, `SitUp.js`, `Squat.js`, `challenge.js` เหลือเฉพาะ logic
แปล landmarks เป็น rep/state จึงสลับ detector ภายหลังได้จากไฟล์กลางไฟล์เดียว

### Pose ↔ game bridge

ไม่มี global state, `sessionStorage`, countdown sentinel หรือ polling แล้ว
ทุกส่วนคุยกันด้วย `CustomEvent`:

| Event | Producer | Consumer |
|---|---|---|
| `buddyfit:rep` | pose script ของแต่ละท่า | `trainingGame.js` |
| `buddyfit:workout-progress` | `trainingGame.js` | `workoutForm.js` |
| `buddyfit:workout-complete` | `trainingGame.js` | `workoutForm.js` |
| `buddyfit:pose-state` | `challenge.js` | `gameChallenge.js` |
| `buddyfit:challenge-complete` | `gameChallenge.js` | form ใน `challenge.html` |

เกมฝึกทั้งสามท่าใช้ `trainingGame.js` ร่วมกันแล้ว ต่างกันเพียง config ของชื่อท่า
และช่วง animation frames

### Frontend และ tooling

- Phaser 4.2.1, Chart.js 4.5.1 และ Bootstrap 5.3.8 ใช้ URL แบบ pin version
- เปลี่ยน Phaser renderer จาก `CANVAS` เป็น `AUTO` เพื่อให้ Phaser 4 เลือก WebGL
  เมื่ออุปกรณ์รองรับ และ fallback ไป Canvas ได้
- ตัด jQuery ออกและใช้ `fetch()` สำหรับบันทึกคะแนนก่อน replay
- ลบ `static/js/phaser.js` ที่ไม่เคยถูกอ้างถึง (ประมาณ 217,000 บรรทัด)
- asset URL ของเกมฝึกส่งจาก `{% static %}` ผ่าน `data-*` เพื่อให้ได้ cache busting
- ย้าย Python dependencies จาก `requirements.txt` ไป `pyproject.toml` + `uv.lock`

### Challenge runner

- ความเร็วเริ่มต้นเพิ่มจาก 200 เป็น 340 px/s และค่อย ๆ เร่งได้ถึง 500 px/s
- animation วิ่งเพิ่มเป็น 12 FPS และ parallax ใช้ `delta` จึงเร็วเท่ากันทุก refresh rate
- การแยกท่าใช้ Pose Landmark หมายเลข 0 (จมูก) เฉพาะแกน `y` ซึ่งเป็น normalized
  coordinate (`0` = ขอบบน, `1` = ขอบล่าง): `nose.y <= 0.4` คือกระโดด,
  `0.4 < nose.y < 0.8` คือวิ่งปกติ และ `nose.y >= 0.8` คือย่อ
- ภาพกล้องมีเส้นและสีแบ่งทั้งสามโซน โดยใช้ constants ชุดเดียวกับเงื่อนไขเกม
  เพื่อไม่ให้ตำแหน่งเส้นกับ action ที่เกิดขึ้นคลาดกัน
- โดนัทเปลี่ยนจากวัตถุทำดาเมจเป็น collectible ชุดละ 6–8 ชิ้น มีแพตเทิร์น
  เส้นตรง โค้ง และคลื่น
- เก็บโดนัทได้ชิ้นละ 10 คะแนน พร้อม counter และเอฟเฟกต์ `+10`
- platform/gap สร้างต่อเนื่องด้วยระยะที่กระโดดข้ามได้ แทนการสุ่ม spawn ทุก frame

---

## 4. งานที่เหลือ

### 4.1 Smoke test ด้วยกล้องจริง

Automated tests ตรวจ Django, templates, migrations และ static manifest ได้ แต่ CI
จำลองท่าทางหน้ากล้องจริงไม่ได้ ก่อน deploy ให้เปิดทั้ง 4 หน้าใน Chrome/Firefox:

1. อนุญาตกล้องและเช็กว่า skeleton แสดงบน canvas
2. ทดสอบ push-up, sit-up และ squat อย่างน้อยท่าละ 2 reps
3. เช็กว่าเลขในเกมเพิ่มเฉพาะช่วงจับเวลา และปุ่ม Done บันทึกเลขล่าสุด
4. ใน challenge ทดสอบยืน/กระโดด/ย่อ และเช็กคะแนนตอนจบกับ Replay/Done
5. ปิดสิทธิ์กล้องหนึ่งรอบเพื่อเช็กข้อความ error และให้เกมไม่ค้าง

### 4.2 Deploy จริง

```bash
export DJANGO_DEBUG=0
export DJANGO_SECRET_KEY=<สุ่มใหม่ ห้ามใช้ค่าใน repo>
export DJANGO_ALLOWED_HOSTS=buddyfit.example.com
export DJANGO_CSRF_TRUSTED_ORIGINS=https://buddyfit.example.com
export DATABASE_URL=postgres://user:pass@host:5432/dbname
```

```bash
uv sync --locked --no-dev
uv run --locked --no-dev python manage.py migrate
uv run --locked --no-dev python manage.py collectstatic --noinput
uv run --locked --no-dev gunicorn buddyfit.wsgi
```

ต้องวางหลัง HTTPS เท่านั้น เพราะ browser อนุญาต `getUserMedia` เฉพาะ secure origin
(`localhost` เป็นข้อยกเว้นสำหรับ dev)

### 4.3 แนวทาง Pose Classification (ยังไม่ได้ implement)

เป้าหมายระยะถัดไปคือแยกกิจกรรม `standing`, `squat` และ `jump` จาก Pose Landmarks
ปัจจุบัน challenge ดูเฉพาะ `nose.y` จึงเป็น screen-position control ไม่ใช่ exercise
classifier ที่เข้าใจท่าทางจริง

แนวทางที่เหมาะกับ POC คือ **Hybrid Temporal Pose Classifier**:

```text
camera -> MediaPipe 33 landmarks -> normalized features/angles
       -> buffer 15-30 frames -> state machine -> action + confidence
```

- ใช้หัวไหล่ สะโพก เข่า ข้อเท้า ส้นเท้า และปลายเท้าแทนการดูจมูกจุดเดียว
- features หลักคือมุมเข่า/สะโพก, ความเอียงลำตัว, ตำแหน่งกึ่งกลางสะโพก,
  vertical velocity และตำแหน่งเท้าเทียบ floor baseline จาก calibration
- state ภายในควรมี `STANDING`, `DESCENDING`, `SQUAT_HOLD`, `RISING`,
  `TAKEOFF`, `AIRBORNE`, `LANDING`, `UNKNOWN` แล้วค่อย map เป็นชื่อ action
- ใช้ hysteresis/EMA และให้เงื่อนไขคงอยู่ 3-5 เฟรมก่อนเปลี่ยน state
- squat คือเข่า/สะโพกงอแล้วกลับขึ้นโดยเท้ายังอยู่บนพื้น ส่วน jump ต้องเห็น sequence
  ย่อ -> เคลื่อนขึ้น -> เท้าทั้งสองพ้น baseline -> ลงพื้น จึงห้ามตัดสิน jump จากเฟรมเดียว
- ควรส่ง `result.worldLandmarks[0]` ออกจาก `pose/detector.js` เพิ่มในอนาคตเพื่อช่วย
  คำนวณมุม 3D แต่ห้ามใช้ world Y วัดความสูงกระโดดโดยตรง เพราะ origin อยู่กลางสะโพก

ตัวเลือกที่สำรวจไว้:

1. [Google ML Kit Pose Classifier](https://github.com/googlesamples/mlkit/blob/master/android/vision-quickstart/app/src/main/java/com/google/mlkit/vision/demo/java/posedetector/classification/PoseClassifierProcessor.java)
   เป็น k-NN sample พร้อม `squats_down`, `pushups_down`, EMA และ rep counter;
   ใกล้โจทย์ที่สุดแต่เป็น Android/Java และไม่มี jump
2. [TensorFlow MoveNet Pose Classification](https://blog.tensorflow.org/2021/08/pose-estimation-and-classification-on-edge-devices-with-MoveNet-and-TensorFlow-Lite.html)
   เป็นต้นแบบ keypoints -> normalize -> small classifier (ประมาณ 30 KB) แต่ใช้ 17 จุด
   และต้องฝึกคลาสของเราเอง
3. [NVIDIA TAO PoseClassificationNet](https://docs.nvidia.com/tao/tao-toolkit/latest/text/cv_finetuning/pytorch/pose_classification/pose_classification.html)
   เป็น ST-GCN หลายเฟรม มีตัวอย่างคลาส `standing`/`jumping` แต่ใช้ skeleton 34 จุด,
   sequence สูงสุด 300 เฟรม และเหมาะกับ ONNX/TensorRT/Jetson มากกว่า browser
4. [OpenMMLab MMAction2 ST-GCN](https://github.com/open-mmlab/mmaction2/blob/main/configs/skeleton/stgcn/README.md)
   มี pretrained checkpoints บน NTU60/NTU120 แต่ topology/labels ไม่ตรง MediaPipe
   จึงต้องแปลง landmarks และ fine-tune

ลำดับที่แนะนำ: พอร์ตแนวคิด k-NN ของ Google มาทดลอง standing/squat ก่อน, ใช้ temporal
state machine สำหรับ jump และเก็บคลิปที่ติด label; เมื่อจำนวนท่าเพิ่มจึงค่อย fine-tune
temporal model เช่น ST-GCN โดยต้อง split validation ตามผู้ใช้ ไม่ใช่สุ่มเฟรมจากคนเดียวกัน

---

## 5. ข้อควรรู้

1. MediaPipe JS/WASM, pose model, Phaser, Chart.js และ Bootstrap ยังโหลดจาก CDN
   ภายนอก ถ้าต้องการ deploy แบบไม่พึ่ง third party ให้ vendor ไฟล์เหล่านี้เป็นงานแยก
2. เพดาน score 1,000 ลด payload เกินจริง แต่ score ยังมาจาก client จึงไม่ใช่ระบบ
   anti-cheat เต็มรูปแบบ ถ้าต้องการ leaderboard ที่เชื่อถือได้ต้องออกแบบการยืนยัน run
   ฝั่ง server เพิ่ม
3. test รันด้วย `DEBUG=False`; test class ที่ render template ต้องสืบทอด
   `BaseTestCase` เพื่อไม่ให้ WhiteNoise manifest ที่ยังไม่ได้ collect ทำให้ test พัง
4. `{% static %}` ห้ามมี `./` นำหน้า เพราะ manifest ไม่มี key รูปแบบนั้น
5. `ExHistory.exData` สะกดผิดจาก `exDate` มาตั้งแต่ schema เดิม ถ้าจะ rename ให้ทำ
   migration และแก้ view/template เป็นงานแยก
6. production ต้องรัน `collectstatic` ทุกครั้งก่อน start Gunicorn

---

## 6. เอกสารหลัก

| ไฟล์ | เนื้อหา |
|---|---|
| `CLAUDE.md` | architecture, event bridge, conventions และคำสั่งพัฒนา |
| `README.md` | setup ด้วย uv, environment variables และ feature overview |
| `pyproject.toml` | direct dependencies |
| `uv.lock` | dependency graph ที่ resolve แล้ว |
