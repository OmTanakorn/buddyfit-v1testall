# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

A `.venv` already exists in the repo root (the README also documents a pipenv flow).

```bash
source .venv/bin/activate

python manage.py runserver            # http://127.0.0.1:8000
python manage.py migrate
python manage.py makemigrations accounts   # only `accounts` holds models
python manage.py createsuperuser
python manage.py collectstatic        # required before serving with DEBUG=False
```

Tests use Django's runner (`accounts/tests.py` and `pages/tests.py` are still empty stubs):

```bash
python manage.py test                 # all
python manage.py test pages           # one app
python manage.py test pages.tests.SomeTest.test_case   # single test
```

Dependency files have drifted: `requirements.txt` is the current one (allauth 0.52, crispy-forms 2.0, `django-cors-headers`); `Pipfile` still pins older versions and omits corsheaders. Prefer `requirements.txt`.

## Architecture

Django 4.1 project `buddyfit` with two apps:

- **`accounts`** — owns every model (`CustomUser`, `Buddy`, `ExHistory`), the allauth forms, and admin. No URLs of its own; auth routes come from `allauth.urls`.
- **`pages`** — owns every view and URL. Page views (`home`, `pushup`, `situp`, `squat`, `challenge`, `leaderboard`, `ex_history`, `create_buddy`) plus four write endpoints (`update_pushup`, `update_situp`, `update_squat`, `update_score`).

Data model: one `Buddy` per user is assumed — the update views call `get_object_or_404(Buddy, owner=request.user)` with no `.filter()`, and `home` redirects to `create_buddy` when none exists. `Buddy` stores cumulative `armpower` / `bodypower` / `legpower` / `highScore`; each submission also appends an `ExHistory` row (`exType`, `exCount`, `exData` date) for the chart page. "Level" is not stored — templates compute `power / 10` in JS.

All write endpoints are `@login_required`, run untrusted POST values through `pages/views.py:_parse_count` (browser can post `""`/`"null"`/floats), and redirect to `/`. Keep both properties when adding endpoints.

### Pose ↔ game bridge (the part that needs multiple files to understand)

Every exercise page and the challenge page render **two canvases side by side**: a Phaser game canvas and a MediaPipe pose-detection canvas. They are separate plain `<script>` tags — no modules, no bundler — so they communicate through **window globals and `sessionStorage`**:

| Page | Pose script (writes globals) | Phaser script (reads them) | sessionStorage key | POST target |
|---|---|---|---|---|
| pushup | `PushUp.js` | `gamePush.js` | `pushup_count` | `/update_pushup` |
| situp | `SitUp.js` | `gameSitUp.js` | `situp_count` | `/update_situp` |
| squat | `Squat.js` | `gameSquat.js` | `squat_count` | `/update_squat` |
| challenge | `challenge.js` | `gameChallenge.js` (+ `gameChallengeStart.js`, `gameChallengeEnd.js`) | `score` | `/update_score` |

Flow: MediaPipe's `onResultsPose` updates globals (`stage`, `count`, `nose_y`, `right_index_x`) → the Phaser scene's `update()` reads them each frame → the scene writes the result into `sessionStorage` → inline JS in the template copies it into a hidden form input → form/AJAX POST.

Consequences to respect when editing these files:

- **Script order in the template is load-bearing.** The pose script shares scope with the game script; anything a scene reads in `update()` must be declared with `var` at the top of the pose file, *before* any CDN-dependent call (`FPS()`, `Pose()`). MediaPipe comes from jsDelivr, so a CDN failure kills the rest of the file — declarations above that line still survive. Scenes additionally guard with `typeof stage === 'undefined'` fallbacks.
- **`onResultsPose` must null-check `results.poseLandmarks`.** MediaPipe leaves it undefined when nobody is in frame; an unguarded index throws every frame and freezes the pose state.
- **Read `sessionStorage` at button-press time, not page load** — the game writes it only when the run ends.
- The exercise pages hand off via a countdown sentinel: the Phaser scene sets `countdown = 10` when the set finishes, and the template polls `window.getPushupCountdown()` (etc.) to know when to copy the count.
- `static/js/phaser.js` is a 217k-line vendored bundle. Never read or edit it; pages load Phaser from the CDN anyway.

### Conventions

- Code comments and commit-message prose in this repo are written in Thai. Match the surrounding language when editing a file.
- Templates reference game assets with hardcoded relative paths (`../static/images/...`) inside JS strings rather than `{% static %}`. These bypass WhiteNoise's `CompressedManifestStaticFilesStorage` hashing, so they only resolve under the dev server / root-mounted `STATIC_URL`.
- `buddyfit/settings.py` is a DjangoX-derived starter: `DEBUG = True`, hardcoded `SECRET_KEY`, `CORS_ALLOW_ALL_ORIGINS = True`, console email backend, commented-out Postgres block. Treat it as dev-only config.
- Auth is email-based allauth over `AUTH_USER_MODEL = "accounts.CustomUser"`; login/signup/password templates are overridden in `templates/account/`.
- Buddy skin is not user-chosen — `accounts/forms.py:RandomSkinWidget` picks `MINOTOR` or `DODO` at render time inside a hidden input.
