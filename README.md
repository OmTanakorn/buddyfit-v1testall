<p align="center">
  <img src="logo.png" alt="BuddyFit Logo" width="200"/>
</p>

<h1 align="center">BuddyFit</h1>
<p align="center">
  <strong>Level up your workout. Grow your buddy.</strong><br/>
  A gamified fitness tracker where your real-world exercise powers up a virtual character.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10%2B-blue?logo=python" alt="Python"/>
  <img src="https://img.shields.io/badge/Django-4.1-green?logo=django" alt="Django"/>
  <img src="https://img.shields.io/badge/Phaser-3.54-orange" alt="Phaser"/>
  <img src="https://img.shields.io/badge/MediaPipe-Pose-red?logo=google" alt="MediaPipe"/>
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
| **Backend** | Django 4.1, Python 3.10 |
| **Auth** | django-allauth (email-based) |
| **Game Engine** | Phaser 3.54 |
| **Pose Detection** | MediaPipe (Google ML) |
| **Charts** | Chart.js 3.7 |
| **Frontend** | Bootstrap 5.2, vanilla JS |
| **Database** | SQLite (dev) / PostgreSQL (prod) |
| **Static Files** | WhiteNoise |
| **Production** | Gunicorn |

---

## Getting Started

### Prerequisites

- Python 3.10+
- [Pipenv](https://pipenv.pypa.io/en/latest/)
- A webcam (for exercise tracking)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/omtanakorn/buddyfit-v1testall.git
cd buddyfit-v1testall

# 2. Install dependencies
pipenv install

# 3. Activate the virtual environment
pipenv shell

# 4. Apply database migrations
python manage.py migrate

# 5. Create an admin account
python manage.py createsuperuser

# 6. Run the development server
python manage.py runserver
```

Open your browser at **http://127.0.0.1:8000** and create your first buddy!

### With pip (alternative)

```bash
python -m venv .venv
source .venv/bin/activate        # macOS/Linux
# .venv\Scripts\Activate.ps1    # Windows

pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
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
└── requirements.txt
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
