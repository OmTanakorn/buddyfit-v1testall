<p align="center">
  <img src="logo.png" alt="BuddyFit Logo" width="200"/>
</p>

<h1 align="center">BuddyFit</h1>
<p align="center">
  <strong>Level up your workout. Grow your buddy.</strong><br/>
  A gamified fitness tracker where your real-world exercise powers up a virtual character.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10--3.13-blue?logo=python" alt="Python"/>
  <img src="https://img.shields.io/badge/Django-5.2_LTS-green?logo=django" alt="Django"/>
  <img src="https://img.shields.io/badge/Phaser-3.90-orange" alt="Phaser"/>
  <img src="https://img.shields.io/badge/MediaPipe-Tasks_Vision-red?logo=google" alt="MediaPipe"/>
  <img src="https://img.shields.io/badge/version-1.0.0-brightgreen" alt="Version"/>
</p>

---

## About

BuddyFit is a graduation project that makes working out fun by turning exercise into a game. Each rep you do in the real world earns your virtual buddy experience points and grows their stats. Complete challenges, climb the leaderboard, and watch your buddy evolve as you get stronger.

Built with love by two students who wanted to make fitness less boring. 💪

---

## Features

| Feature | Description |
|---------|-------------|
| 🥚 **Buddy Creation** | Hatch a unique buddy (MINOTOR or DODO) with a random skin |
| 💪 **Push-up Training** | Real reps → arm-power XP, tracked via webcam |
| 🔥 **Sit-up Training** | Real reps → body-power XP, tracked via webcam |
| 🦵 **Squat Training** | Real reps → leg-power XP, tracked via webcam |
| ⚔️ **Challenge Mode** | Boss battle game powered by your buddy's stats |
| 🤖 **AI Pose Detection** | MediaPipe counts your reps automatically — no buttons needed |
| 📊 **Exercise History** | Line charts showing your training trends over time |
| 🏆 **Leaderboard** | Top 10 global rankings by high score |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Django 5.2 LTS, Python 3.10+ |
| **Auth** | django-allauth 65 (email-based) |
| **Game Engine** | Phaser 4.2.1 |
| **Pose Detection** | MediaPipe Tasks Vision 0.10.35 (Pose Landmarker) |
| **Charts** | Chart.js 4.5 |
| **Frontend** | Bootstrap 5.3, vanilla JS modules |
| **Database** | SQLite (dev) / PostgreSQL (prod) |
| **Static Files** | WhiteNoise |
| **Python tooling** | uv + locked dependencies |
| **Production** | Gunicorn over HTTPS |

---

## Getting Started

### Prerequisites

- [uv](https://docs.astral.sh/uv/getting-started/installation/)
- A webcam (for exercise tracking)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/omtanakorn/buddyfit-v1testall.git
cd buddyfit-v1testall

# 2. Install the locked Python version and dependencies
uv sync

# 3. Apply database migrations
uv run python manage.py migrate

# 4. Create an admin account
uv run python manage.py createsuperuser

# 5. Run the development server
uv run python manage.py runserver
```

Open your browser at **http://127.0.0.1:8000** and create your first buddy!

### Running the tests

```bash
uv run python manage.py test              # everything
uv run python manage.py test pages        # a single app
```

### Configuration

Everything runs out of the box for local development. For anything else, the
settings read these environment variables:

| Variable | Default | Notes |
|---|---|---|
| `DJANGO_DEBUG` | `1` | **Must be `0` in production.** Turning it off also enables HTTPS-only cookies and redirects |
| `DJANGO_SECRET_KEY` | insecure dev key | Required once `DJANGO_DEBUG=0` — the app refuses to start without it |
| `DJANGO_ALLOWED_HOSTS` | `localhost,0.0.0.0,127.0.0.1` | Comma-separated hostnames |
| `DJANGO_CSRF_TRUSTED_ORIGINS` | empty | Full origins with scheme, needed behind a reverse proxy |
| `DATABASE_URL` | unset (SQLite) | `postgres://user:pass@host:5432/dbname` switches to PostgreSQL |
| `DJANGO_SECURE_SSL` | on when `DJANGO_DEBUG=0` | Set to `0` to test a non-debug build over plain HTTP locally |
| `CORS_ALLOWED_ORIGINS` | empty | Only needed if another origin calls this app |

> **The camera needs HTTPS.** Browsers only grant `getUserMedia` on a secure
> origin, so every deployment must be served over TLS. `localhost` is the one
> exception, which is why development works without it.

```bash
# Before serving with DJANGO_DEBUG=0
uv run python manage.py collectstatic
```

---

## How to Play

1. **Sign up** with your email and create your buddy
2. **Train** — pick Push-ups, Sit-ups, or Squats and let your webcam count your reps
3. **Earn XP** — each rep adds power to your buddy's corresponding stat
4. **Challenge** — battle through boss stages using your accumulated stats
5. **Compete** — check the leaderboard and aim for the top 10

---

## Project Structure

```
buddyfit-v1testall/
├── buddyfit/          # Django project config (settings, urls, wsgi)
├── accounts/          # User auth, Buddy & ExHistory models
├── pages/             # Main app views (training, challenge, leaderboard)
├── templates/         # HTML templates
├── static/            # JS game scripts, CSS, images, MediaPipe detectors
├── manage.py
├── pyproject.toml      # Direct Python dependencies and project metadata
└── uv.lock             # Fully resolved, reproducible dependency lock
```

---

## Contributors

This project was built as a Computer Science graduation project.

| Name | GitHub |
|------|--------|
| Tanakorn Aphiwan | [@OmTanakorn](https://github.com/OmTanakorn) |
| Nak_last | [@Nak_last(https://github.com/NakLast)] |

---

## License

This project is open source under the [MIT License](LICENSE).
