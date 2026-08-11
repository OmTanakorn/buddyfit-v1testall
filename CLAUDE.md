# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Python dependencies live in `pyproject.toml` and are locked by `uv.lock`. `uv run`
automatically keeps the project `.venv` in sync.

```bash
uv sync
uv run python manage.py runserver            # http://127.0.0.1:8000
uv run python manage.py migrate
uv run python manage.py makemigrations accounts   # only `accounts` holds models
uv run python manage.py createsuperuser
uv run python manage.py collectstatic        # required before serving with DJANGO_DEBUG=0

uv run python manage.py test                 # all
uv run python manage.py test pages           # one app
uv run python manage.py test pages.tests.ScoreUpdateTests.test_a_lower_score_is_ignored

# what a production boot looks like; must stay clean
DJANGO_DEBUG=0 DJANGO_SECRET_KEY=... uv run python manage.py check --deploy
```

Settings are environment-driven (`DJANGO_DEBUG`, `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`, `DJANGO_CSRF_TRUSTED_ORIGINS`, `DATABASE_URL`, `DJANGO_SECURE_SSL`, `CORS_ALLOWED_ORIGINS`) — see the table in README.md. Defaults are tuned for local development; `DJANGO_DEBUG=0` refuses to boot without an explicit secret key and turns on HTTPS-only cookies and redirects.

Two settings branch on `DEBUG` at import time, which is worth knowing before changing either: `debug_toolbar` is only appended to `INSTALLED_APPS`/`MIDDLEWARE` when debugging, and static files only go through WhiteNoise's manifest storage when not debugging. Tests run with `DEBUG=False`, so `BaseTestCase` in `pages/tests.py` overrides `STORAGES` back to plain storage — otherwise every page using `{% static %}` fails on a missing manifest entry unless `collectstatic` has run.

## Architecture

Django 5.2 project `buddyfit` with two apps:

- **`accounts`** — owns every model (`CustomUser`, `Buddy`, `ExHistory`), the allauth forms, and admin. No URLs of its own; auth routes come from `allauth.urls`.
- **`pages`** — owns every view and URL. Page views (`home`, `pushup`, `situp`, `squat`, `challenge`, `leaderboard`, `ex_history`, `create_buddy`) plus four write endpoints (`update_pushup`, `update_situp`, `update_squat`, `update_score`).

Data model: one `Buddy` per user is enforced by a `OneToOneField`, and `home`
redirects to `create_buddy` when none exists. `Buddy` stores cumulative `armpower` /
`bodypower` / `legpower` / `highScore`; each submission also appends an
`ExHistory` row (`exType`, `exCount`, `exData` date) for the chart page. "Level"
is not stored — templates compute `power / 10` in JS.

All write endpoints are `@login_required`, run untrusted POST values through
`pages/views.py:_parse_count` (browser can post `""`/`"null"`/floats), clamp the
result to 0–1000, and redirect to `/`. Keep these properties when adding endpoints.

### Pose ↔ game bridge

Every exercise page and the challenge page render two canvases side by side. The
shared ES module `static/js/pose/detector.js` owns `getUserMedia`, MediaPipe Tasks
Vision `PoseLandmarker`, drawing, FPS sampling, and GPU→CPU fallback. Exercise
modules contain only their landmark/rep logic.

Communication is event-driven; do not reintroduce globals, polling, or
`sessionStorage`:

| Event | Producer | Consumer |
|---|---|---|
| `buddyfit:rep` | exercise pose module | `trainingGame.js` |
| `buddyfit:workout-progress` | `trainingGame.js` | `workoutForm.js` |
| `buddyfit:workout-complete` | `trainingGame.js` | `workoutForm.js` |
| `buddyfit:pose-state` | `challenge.js` | `gameChallenge.js` |
| `buddyfit:challenge-complete` | `gameChallenge.js` | challenge form script |

`result.landmarks` is nested by detected person; the shared detector passes
`result.landmarks[0]` (or `null`) to each exercise callback. Pages load Phaser
3.90 and MediaPipe Tasks Vision 0.10.35 from pinned CDN URLs.

### Conventions

- Code comments and commit-message prose in this repo are written in Thai. Match the surrounding language when editing a file.
- Templates reference game assets with hardcoded relative paths (`../static/images/...`) inside JS strings rather than `{% static %}`. `collectstatic` keeps an unhashed copy of every file, so these still resolve in production — they just lose cache busting, and they break if `STATIC_URL` ever stops being root-mounted. Anything going through `{% static %}` must not carry a `./` prefix; the manifest has no entry for `./images/x.png`.
- The email backend still writes to the console, so password-reset links only appear in the server log. Real delivery is unconfigured.
- Auth is email-based allauth over `AUTH_USER_MODEL = "accounts.CustomUser"`; login/signup/password templates are overridden in `templates/account/`.
- Buddy skin is not user-chosen — `accounts/forms.py:RandomSkinWidget` picks `MINOTOR` or `DODO` at render time inside a hidden input.
