import os
from pathlib import Path

from django.core.exceptions import ImproperlyConfigured

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


def env_flag(name, default):
    """อ่าน env var แบบ boolean รับได้ทั้ง 1/true/yes/on"""
    return os.environ.get(name, str(default)).strip().lower() in {
        "1",
        "true",
        "yes",
        "on",
    }


# https://docs.djangoproject.com/en/dev/ref/settings/#debug
# ค่าปริยายเป็น True เพื่อให้ runserver ใช้งานได้ทันที
# ตอน deploy ต้องตั้ง DJANGO_DEBUG=0 เสมอ
DEBUG = env_flag("DJANGO_DEBUG", True)

# https://docs.djangoproject.com/en/dev/ref/settings/#std:setting-SECRET_KEY
# key ที่ commit ไว้ใช้ได้เฉพาะตอน DEBUG ถ้าปิด DEBUG แล้วไม่ตั้ง env จะไม่ยอมบูต
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY")
if not SECRET_KEY:
    if not DEBUG:
        raise ImproperlyConfigured(
            "DJANGO_SECRET_KEY must be set when DJANGO_DEBUG is off"
        )
    SECRET_KEY = "django-insecure-0peo@#x9jur3!h$ryje!$879xww8y1y66jx!%*#ymhg&jkozs2"

# https://docs.djangoproject.com/en/dev/ref/settings/#allowed-hosts
# DJANGO_ALLOWED_HOSTS="buddyfit.example.com,www.buddyfit.example.com"
ALLOWED_HOSTS = [
    host.strip()
    for host in os.environ.get(
        "DJANGO_ALLOWED_HOSTS", "localhost,0.0.0.0,127.0.0.1"
    ).split(",")
    if host.strip()
]

# https://docs.djangoproject.com/en/dev/ref/settings/#csrf-trusted-origins
# ต้องใส่ origin แบบเต็ม (มี scheme) เมื่อรันหลัง reverse proxy / HTTPS
CSRF_TRUSTED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get("DJANGO_CSRF_TRUSTED_ORIGINS", "").split(",")
    if origin.strip()
]

# https://docs.djangoproject.com/en/dev/ref/settings/#installed-apps
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "whitenoise.runserver_nostatic",
    "django.contrib.staticfiles",
    "django.contrib.sites",
    # Third-party
    "corsheaders",
    "allauth",
    "allauth.account",
    "crispy_forms",
    "crispy_bootstrap5",
    # Local
    "accounts",
    "pages",
]

# https://docs.djangoproject.com/en/dev/ref/settings/#middleware
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    # CorsMiddleware ต้องอยู่เหนือ CommonMiddleware ไม่งั้น header ไม่ถูกใส่
    # ตอน CommonMiddleware ตอบ redirect เอง
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    # allauth >= 0.56 บังคับให้มีตัวนี้ ต้องอยู่หลัง AuthenticationMiddleware
    "allauth.account.middleware.AccountMiddleware",
]

# debug-toolbar เป็นเครื่องมือ dev เท่านั้น อย่าให้ติดไปกับ production
if DEBUG:
    INSTALLED_APPS.append("debug_toolbar")
    MIDDLEWARE.insert(
        MIDDLEWARE.index("django.middleware.common.CommonMiddleware"),
        "debug_toolbar.middleware.DebugToolbarMiddleware",
    )

# https://docs.djangoproject.com/en/dev/ref/settings/#root-urlconf
ROOT_URLCONF = "buddyfit.urls"

# https://docs.djangoproject.com/en/dev/ref/settings/#wsgi-application
WSGI_APPLICATION = "buddyfit.wsgi.application"

# https://docs.djangoproject.com/en/dev/ref/settings/#templates
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# https://docs.djangoproject.com/en/dev/ref/settings/#databases
# ปริยายเป็น SQLite สำหรับ dev ตอน deploy ตั้ง DATABASE_URL แบบ
# postgres://user:password@host:5432/dbname แล้วจะสลับไป psycopg ให้เอง
DATABASE_URL = os.environ.get("DATABASE_URL")
if DATABASE_URL:
    from urllib.parse import unquote, urlparse

    url = urlparse(DATABASE_URL)
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": url.path.lstrip("/"),
            "USER": unquote(url.username or ""),
            "PASSWORD": unquote(url.password or ""),
            "HOST": url.hostname or "",
            "PORT": str(url.port or 5432),
            "CONN_MAX_AGE": 600,
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

# https://docs.djangoproject.com/en/dev/ref/settings/#security
# หน้า training ต้องเรียก getUserMedia ซึ่งเบราว์เซอร์ยอมให้ทำเฉพาะบน HTTPS
# (ยกเว้น localhost) production จึงต้องเป็น HTTPS อยู่แล้ว
# ตั้ง DJANGO_SECURE_SSL=0 ถ้าอยากรันแบบปิด DEBUG บนเครื่องตัวเองเพื่อลองของ
SECURE_SSL_REDIRECT = env_flag("DJANGO_SECURE_SSL", not DEBUG)
SESSION_COOKIE_SECURE = SECURE_SSL_REDIRECT
CSRF_COOKIE_SECURE = SECURE_SSL_REDIRECT
SECURE_HSTS_SECONDS = 31536000 if SECURE_SSL_REDIRECT else 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = SECURE_SSL_REDIRECT
SECURE_HSTS_PRELOAD = SECURE_SSL_REDIRECT
# reverse proxy (Railway/Fly/nginx) เป็นตัวตัด TLS แล้วส่ง header นี้มาบอก
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# https://docs.djangoproject.com/en/dev/ref/settings/#auth-password-validators
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# https://docs.djangoproject.com/en/dev/topics/i18n/
# https://docs.djangoproject.com/en/dev/ref/settings/#language-code
LANGUAGE_CODE = "en-us"

# https://docs.djangoproject.com/en/dev/ref/settings/#time-zone
TIME_ZONE = "UTC"

# https://docs.djangoproject.com/en/dev/ref/settings/#std:setting-USE_I18N
USE_I18N = True

# https://docs.djangoproject.com/en/dev/ref/settings/#use-l10n
USE_L10N = True

# https://docs.djangoproject.com/en/dev/ref/settings/#use-tz
USE_TZ = True

# https://docs.djangoproject.com/en/dev/ref/settings/#static-root
STATIC_ROOT = BASE_DIR / "staticfiles"

# https://docs.djangoproject.com/en/dev/ref/settings/#static-url
STATIC_URL = "/static/"

# https://docs.djangoproject.com/en/dev/ref/contrib/staticfiles/#std:setting-STATICFILES_DIRS
STATICFILES_DIRS = [BASE_DIR / "static"]

# https://docs.djangoproject.com/en/dev/ref/settings/#storages
# manifest storage ต้องผ่าน collectstatic ก่อน จึงเปิดเฉพาะตอนไม่ DEBUG
# ไม่งั้น runserver จะพังทุกหน้าที่ใช้ {% static %}
STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": (
            "django.contrib.staticfiles.storage.StaticFilesStorage"
            if DEBUG
            else "whitenoise.storage.CompressedManifestStaticFilesStorage"
        ),
    },
}


# django-crispy-forms
# https://django-crispy-forms.readthedocs.io/en/latest/install.html#template-packs
CRISPY_TEMPLATE_PACK = "bootstrap5"

# https://docs.djangoproject.com/en/dev/ref/settings/#email-backend
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# django-debug-toolbar
# https://django-debug-toolbar.readthedocs.io/en/latest/installation.html
# https://docs.djangoproject.com/en/dev/ref/settings/#internal-ips
INTERNAL_IPS = ["127.0.0.1"]

# https://docs.djangoproject.com/en/dev/topics/auth/customizing/#substituting-a-custom-user-model
AUTH_USER_MODEL = "accounts.CustomUser"

# django-allauth config
# https://docs.djangoproject.com/en/dev/ref/settings/#site-id
SITE_ID = 1

# https://docs.djangoproject.com/en/dev/ref/settings/#login-redirect-url
LOGIN_REDIRECT_URL = "/"

# https://django-allauth.readthedocs.io/en/latest/views.html#logout-account-logout
ACCOUNT_LOGOUT_REDIRECT_URL = "/"

# https://django-allauth.readthedocs.io/en/latest/installation.html?highlight=backends
AUTHENTICATION_BACKENDS = (
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
)
# https://docs.allauth.org/en/latest/account/configuration.html
# allauth 65 ยุบ ACCOUNT_AUTHENTICATION_METHOD / ACCOUNT_EMAIL_REQUIRED /
# ACCOUNT_USERNAME_REQUIRED / ACCOUNT_SIGNUP_PASSWORD_ENTER_TWICE มาไว้ที่
# สองตัวข้างล่างนี้ พฤติกรรมเดิมคือ ล็อกอินด้วยอีเมล ไม่ต้องกรอก username
# และไม่ต้องยืนยันรหัสผ่านซ้ำ (ไม่มี password2)
ACCOUNT_LOGIN_METHODS = {"email"}
ACCOUNT_SIGNUP_FIELDS = ["email*", "password1*"]
ACCOUNT_SESSION_REMEMBER = True
ACCOUNT_UNIQUE_EMAIL = True

# django-cors-headers
# ปัจจุบันไม่มี client ข้าม origin มาเรียก ถ้าต้องมีจริงค่อยใส่ผ่าน env
# CORS_ALLOWED_ORIGINS="https://app.example.com,https://admin.example.com"
CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get("CORS_ALLOWED_ORIGINS", "").split(",")
    if origin.strip()
]
