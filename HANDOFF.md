# HANDOFF — BuddyFit revival

เอกสารส่งต่องาน สำหรับคนที่มารับช่วงต่อ
อัปเดตล่าสุด: 11 ส.ค. 2026 · branch `fix/challenge-game`

---

## 1. สถานะตอนนี้

โปรเจกต์ถูกปลุกกลับมาจาก stack ปี 2023 ที่หมดอายุแล้ว **เฟส 0 กับ 1 จบไปแล้ว** ที่เหลือคือเฟส 2–4

| เฟส | เนื้องาน | สถานะ |
|---|---|---|
| 0 | เขียน test คลุมพฤติกรรมเดิม | ✅ `782c7987` |
| 1 | อัพ Django + deps + settings ขับด้วย env | ✅ `e92bf0db` |
| 2 | ย้าย MediaPipe → Tasks Vision + รื้อ pose/game bridge | ⬜ **งานหลักที่เหลือ** |
| 3 | Phaser 3.90, Chart.js 4, ตัด jQuery, ลบ vendored phaser.js | ⬜ |
| 4 | deploy จริง (ต้องเป็น HTTPS) | ⬜ |

### stack ปัจจุบัน

| | เวอร์ชัน | หมายเหตุ |
|---|---|---|
| Python | 3.11 (venv) | Django 5.2 รับ 3.10–3.13 |
| Django | 5.2.17 LTS | security support ถึง เม.ย. 2028 |
| django-allauth | 65.19 | |
| Phaser | 3.54 จาก CDN | **ยังไม่ได้อัพ** (เฟส 3) |
| MediaPipe | `@mediapipe/pose@0.2` จาก CDN | **ตายแล้ว** publish ล่าสุด ก.พ. 2023 (เฟส 2) |
| Chart.js | 3.7 | **ยังไม่ได้อัพ** (เฟส 3) |

---

## 2. เริ่มยังไง

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver          # http://127.0.0.1:8000
```

ไม่ต้องตั้ง env อะไรเลยตอน dev ทุกตัวมีค่าปริยายให้แล้ว รายการ env ทั้งหมดอยู่ในตารางท้าย `README.md`

### คำสั่งที่ใช้ตรวจงาน

```bash
python manage.py test                                   # ต้องได้ 43 ผ่านหมด
python manage.py test pages.tests.ScoreUpdateTests      # เจาะเฉพาะคลาส

# จำลอง production ต้องไม่มี issue หลุดมา
DJANGO_DEBUG=0 DJANGO_SECRET_KEY=$(python -c 'from django.core.management.utils import get_random_secret_key as g;print(g())') \
  python manage.py check --deploy
```

**กติกาเดียวของงานนี้: test 43 ตัวต้องเขียวก่อนและหลังทุก commit** ถ้าจะแก้ test ให้แก้เพราะตั้งใจเปลี่ยนพฤติกรรม ไม่ใช่เพราะมันแดง

---

## 3. ทำอะไรไปแล้ว (สรุปสั้น)

**เฟส 0** — `accounts/tests.py` กับ `pages/tests.py` เดิมว่างเปล่าทั้งคู่ ตอนนี้มี 43 tests เน้นหนักที่ 4 write endpoints เพราะเป็นจุดที่เคยพัง 500 มาแล้ว (junk payload, anonymous POST, GET, count=0)

**เฟส 1** — อัพเป็นขั้น 4.1 → 4.2 → allauth 65 → 5.2 รัน test ทุกขั้น, settings ย้ายไป env var, ปิด `CORS_ALLOW_ALL_ORIGINS`, `debug_toolbar` โหลดเฉพาะตอน DEBUG, `STATICFILES_STORAGE` → `STORAGES`

เจอบั๊กจริง 2 ตัวและแก้แล้ว: หน้า login/signup ใช้ `{% static './images/...' %}` ซึ่งพัง ValueError ทั้งหน้าตอน `DEBUG=0` และ `ExHistory.exCount = IntegerField(10)` ที่เลข 10 ไปตกเป็น `verbose_name`

อ่านเหตุผลเต็มได้จาก `git show e92bf0db` — commit message เขียนละเอียดไว้แล้ว

---

## 4. งานถัดไป เรียงตามลำดับที่ควรทำ

### 4.1 งานอุ่นเครื่อง — ปิด KnownGapTests (ประมาณครึ่งวัน)

`pages/tests.py` มีคลาส `KnownGapTests` ที่ **ล็อกบั๊กที่ยังไม่แก้ไว้ 2 ตัว** จงใจให้มันเขียวกับพฤติกรรมผิด ๆ เพื่อให้เห็นชัดว่ายังไม่ได้แก้ พอแก้แล้วต้องเขียน test พวกนี้ใหม่

1. **ค่าติดลบดูดพลังลง** — client POST `pushup_count=-50` ได้ตรง ๆ `_parse_count()` ที่ `pages/views.py` ไม่กันค่าติดลบ แก้ที่ `_parse_count` ให้ clamp ขั้นต่ำเป็น 0 (และควรมี upper bound ด้วย ไม่งั้นยิง 999999 ขึ้นอันดับ 1 บน leaderboard ได้เลย)
2. **buddy ตัวที่สองทำให้ทุก write endpoint พัง** — `create_buddy` ไม่กันการสร้างซ้ำ แต่ `update_*` ใช้ `get_object_or_404(Buddy, owner=...)` ซึ่งโยน `MultipleObjectsReturned` = 500 เลือกทางใดทางหนึ่งแล้วทำให้สุด: กันไม่ให้สร้างตัวที่สอง หรือรองรับหลาย buddy จริง ๆ (ต้องแก้ทั้ง view, template, และ URL ให้ระบุ buddy id)

ทำข้อนี้ก่อนเพราะได้ทำความรู้จักโค้ดฝั่ง Django โดยไม่ต้องแตะ pose

---

### 4.2 เฟส 2 — ย้าย MediaPipe (งานหลัก)

**ปัญหา**: `@mediapipe/pose` เป็น Legacy Solutions ที่ Google หยุด maintain ตั้งแต่ ก.พ. 2023 ทั้งหน้าโหลดจาก CDN ถ้าวันไหน jsDelivr เอาลง แอปตายทันที

**ข่าวดี**: ตัวใหม่ (`@mediapipe/tasks-vision`, `PoseLandmarker`) ใช้โมเดล BlazePose ตัวเดิม landmark 33 จุด index เดิมเป๊ะ (nose = 0, right_index = 20) **logic นับ rep ไม่ต้องเขียนใหม่** ที่ต้องเขียนใหม่คือชั้น glue เท่านั้น

#### ตารางแปลง API

| ของเดิม | ของใหม่ |
|---|---|
| `new Pose({locateFile})` + `pose.onResults(cb)` | `FilesetResolver.forVisionTasks()` → `PoseLandmarker.createFromOptions({runningMode:'VIDEO', delegate:'GPU'})` |
| `new Camera(video, {onFrame})` จาก `camera_utils` | `getUserMedia()` + `requestAnimationFrame` → `detectForVideo(video, timestamp)` |
| `results.poseLandmarks[i]` | `results.landmarks[0][i]` ← **shape เปลี่ยน ระวังตรงนี้ที่สุด** |
| `drawConnectors` / `drawLandmarks` จาก `drawing_utils` | `DrawingUtils` ที่มากับ `tasks-vision` |
| `new FPS()` จาก `control_utils` | เขียนเอง 5 บรรทัด ไม่ต้องพึ่ง lib |

#### ไฟล์ที่ต้องแตะ

| ไฟล์ | จุดที่เกี่ยวข้อง |
|---|---|
| `static/js/PushUp.js` | `onResultsPose` (บรรทัด 24), `new Pose` (96), `new Camera` (103) |
| `static/js/SitUp.js` | `onResultsPose` (36), `new Pose` (111), `new Camera` (119) |
| `static/js/Squat.js` | โครงเดียวกับ SitUp.js |
| `static/js/challenge.js` | เหมือนกัน แต่มี guard เพิ่มจากรอบแก้บั๊กที่แล้ว ใช้เป็นตัวอย่างได้ |
| `templates/pages/{pushup,situp,squat,challenge}.html` | `<script>` tag ของ MediaPipe ทั้ง 4 ตัว |

**สำคัญ**: 4 ไฟล์ pose นี้ copy-paste logic เดียวกันคนละก๊อป **อย่าย้ายทีละไฟล์ให้ครบ 4 รอบ** ให้แยก pose layer ออกเป็น module กลางก่อน (เช่น `static/js/pose/detector.js`) แล้วให้ทั้ง 4 หน้าเรียกใช้ร่วมกัน ไม่งั้นได้ของซ้ำ 4 ก๊อปแบบเดิมแต่เวอร์ชันใหม่

#### รื้อ bridge ไปพร้อมกัน (จุดสำคัญกว่าการอัพเวอร์ชัน)

ตอนนี้ pose script กับ Phaser scene คุยกันผ่าน **global variable + `sessionStorage` + `setInterval` polling** ซึ่งเปราะมากและเป็นต้นตอของบั๊กเกมค้างรอบที่แล้วทั้งดุ้น (ดู `git show 705264e1`)

flow ปัจจุบัน:
```
MediaPipe onResultsPose  →  เขียน global (stage, count, nose_y)
                         →  Phaser update() อ่าน global ทุกเฟรม
                         →  scene เขียน sessionStorage
                         →  inline JS ใน template poll ทุก 500ms เช็ค sentinel countdown === 10
                         →  copy ค่าลง hidden input
                         →  form POST
```

เปลี่ยนเป็น ES module + `CustomEvent` หรือ store object ตัวเดียว ตัด `setInterval` polling กับ sentinel `countdown = 10` ทิ้ง (sentinel อยู่ที่ `static/js/gamePush.js:114`, ตัว poll อยู่ใน `templates/pages/pushup.html`)

#### ถ้าเจอปัญหา FPS

MediaPipe BlazePose บน browser ได้ราว 11–12 FPS ส่วน MoveNet Lightning (TFJS `pose-detection`) ได้ 34+ FPS แต่มี 17 จุด COCO เท่านั้น — ซึ่ง**พอสำหรับโปรเจกต์นี้** เพราะใช้แค่ nose/wrist/hip/knee ถ้าแยก pose layer ไว้ดีตามข้อบน การสลับ detector จะเป็นงานแก้ไฟล์เดียว

---

### 4.3 เฟส 3 — Frontend

- Phaser 3.54 → **3.90** เท่านั้น **อย่าไป 4.x** (ออก เม.ย. 2026, breaking เยอะ เขียนใหม่ ไม่คุ้ม)
- **ลบ `static/js/phaser.js` ทิ้ง** — vendored bundle 217k บรรทัด แต่ทุกหน้าโหลด Phaser จาก CDN อยู่แล้ว ไม่มีไฟล์ไหนอ้างถึงมันเลย
- Chart.js 3.7 → 4.5 (แก้ที่ `templates/pages/ex_history.html`)
- ตัด jQuery ทิ้ง ใช้ที่ `templates/pages/challenge.html` ที่เดียว เปลี่ยนเป็น `fetch()`
- Bootstrap 5.2.3 → 5.3
- path `../static/images/...` ที่ hardcode ใน JS string ควรเปลี่ยนไปส่งผ่าน `{% static %}` เป็น data-attribute — **แต่นี่เป็น optimization ไม่ใช่ของพัง** `collectstatic` เก็บสำเนาชื่อเดิมไว้คู่กับชื่อ hash อยู่แล้ว สิ่งที่เสียคือ cache-busting เท่านั้น จัดลำดับความสำคัญให้ถูก

---

### 4.4 เฟส 4 — Deploy

settings พร้อมแล้วจากเฟส 1 ตั้ง env แล้วขึ้นได้เลย

```bash
DJANGO_DEBUG=0
DJANGO_SECRET_KEY=<สุ่มมา ห้ามใช้ค่าใน repo>
DJANGO_ALLOWED_HOSTS=buddyfit.example.com
DJANGO_CSRF_TRUSTED_ORIGINS=https://buddyfit.example.com
DATABASE_URL=postgres://user:pass@host:5432/dbname
```

```bash
python manage.py collectstatic     # ต้องรันก่อนเสมอเมื่อ DEBUG=0
gunicorn buddyfit.wsgi
```

⚠️ **ต้องเป็น HTTPS เท่านั้น** เบราว์เซอร์ให้สิทธิ์ `getUserMedia` เฉพาะ secure origin ถ้า deploy เป็น HTTP กล้องจะไม่ขึ้น หน้า training ใช้ไม่ได้ทั้งหมด (`localhost` เป็นข้อยกเว้นเดียว จึงเทสต์บนเครื่องได้)

---

## 5. กับดักที่ต้องรู้ก่อนแตะโค้ด

อ่านข้อนี้ให้จบก่อนเริ่ม ทุกข้อเคยทำให้เสียเวลามาแล้ว

1. **ลำดับ `<script>` ในเทมเพลตมีผลต่อการทำงาน** pose script กับ game script แชร์ scope กัน (ไม่มี module ไม่มี bundler) ตัวแปรที่ scene อ่านใน `update()` ต้องประกาศด้วย `var` ไว้บนสุดของไฟล์ pose **ก่อน**บรรทัดที่เรียกของจาก CDN (`FPS()`, `Pose()`) เพราะถ้า CDN ล่ม ไฟล์จะตายกลางทางแต่ตัวแปรที่ประกาศไว้ก่อนหน้ายังอยู่

   `challenge.js` แก้ตรงนี้ไปแล้ว **แต่ `PushUp.js:14-17`, `SitUp.js:15-17`, `Squat.js:14-16` ยังใช้ `let` อยู่** = บั๊กเกมค้างแบบเดียวกันยังฝังอยู่ในหน้า training ทั้ง 3 หน้า ถ้าเฟส 2 ยังไม่ได้ทำ ตรงนี้แก้ก่อนได้เลย

2. **`onResultsPose` ต้องเช็ค `results.poseLandmarks` ก่อนใช้เสมอ** MediaPipe ส่ง `undefined` มาเมื่อไม่มีคนอยู่ในเฟรม ถ้าไม่เช็คจะ throw ทุกเฟรม แล้ว `stage` ค้าง = กระโดด/สไลด์ไม่ได้ถาวร (ของใหม่คือ `results.landmarks` ที่เป็น array ซ้อน array)

3. **อ่าน `sessionStorage` ตอนกดปุ่ม ไม่ใช่ตอนโหลดหน้า** เกมเพิ่งเขียนค่าตอนจบรอบ อ่านตอนโหลดหน้าจะได้ `null` แล้ว POST ค่าว่างไปที่ server

4. **`static/js/phaser.js` มี 217,000 บรรทัด อย่าเปิด อย่าแก้** ทุกหน้าโหลด Phaser จาก CDN ไฟล์นี้ไม่ถูกใช้

5. **test รันด้วย `DEBUG=False`** ทำให้ WhiteNoise ใช้ manifest storage ซึ่งยังไม่มีถ้าไม่ได้ `collectstatic` `BaseTestCase` ใน `pages/tests.py` เลย override `STORAGES` กลับเป็นตัวธรรมดาไว้ **test class ใหม่ที่ render หน้าเว็บต้องสืบทอดจาก `BaseTestCase`** ไม่ใช่ `TestCase` เปล่า ๆ ไม่งั้นจะเจอ `ValueError: Missing staticfiles manifest entry`

6. **`{% static %}` ห้ามมี `./` นำหน้า** manifest ไม่มี entry ของ `./images/x.png` จะพังเฉพาะตอน `DEBUG=0` เท่านั้น (ตอน dev ไม่เห็นอะไรผิด) นี่คือบั๊กที่ทำให้หน้า login ใช้ไม่ได้บน production มาตลอด

7. **`ExHistory.exData` สะกดผิด** ตั้งใจจะเป็น `exDate` ถ้าจะ rename ต้องแก้ทั้ง model, migration, `pages/views.py`, และ template ทำเป็น commit แยกอย่าปนกับงานอื่น

8. **comment กับข้อความในโค้ดเป็นภาษาไทย** เขียนเพิ่มให้กลมกลืนกับของเดิม ส่วน **commit message กับชื่อตัวแปร/ฟังก์ชันเป็นอังกฤษ**

---

## 6. เอกสารอื่นในโปรเจกต์

| ไฟล์ | เนื้อหา |
|---|---|
| `CLAUDE.md` | architecture, คำสั่ง, ตาราง pose↔game bridge ต่อหน้า — อ่านก่อนเริ่มเขียนโค้ด |
| `README.md` | วิธีติดตั้ง, ตาราง env var ทั้งหมด, feature list |
| `git show 705264e1` | ที่มาของบั๊กเกมค้าง 5 จุด อ่านแล้วจะเข้าใจว่าทำไม bridge ถึงต้องรื้อ |
| `git show e92bf0db` | เหตุผลของทุกการเปลี่ยนแปลงในเฟส 1 |
