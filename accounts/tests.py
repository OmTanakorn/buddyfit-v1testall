from datetime import date

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.urls import reverse

from .forms import BuddyForm
from .models import Buddy, ExHistory


class CustomUserTests(TestCase):
    def test_str_is_the_email(self):
        user = get_user_model().objects.create_user(
            username="somchai", email="somchai@example.com", password="testpass123"
        )
        self.assertEqual(str(user), "somchai@example.com")


class BuddyModelTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="somchai", email="somchai@example.com", password="testpass123"
        )

    def test_str_is_the_name(self):
        buddy = Buddy.objects.create(name="Duck", skinname="DODO", owner=self.user)
        self.assertEqual(str(buddy), "Duck")

    def test_all_stats_start_at_zero(self):
        buddy = Buddy.objects.create(name="Duck", skinname="DODO", owner=self.user)
        self.assertEqual(buddy.armpower, 0)
        self.assertEqual(buddy.bodypower, 0)
        self.assertEqual(buddy.legpower, 0)
        self.assertEqual(buddy.highScore, 0)

    def test_buddy_is_deleted_with_its_owner(self):
        Buddy.objects.create(name="Duck", skinname="DODO", owner=self.user)
        self.user.delete()
        self.assertEqual(Buddy.objects.count(), 0)


class ExHistoryModelTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="somchai", email="somchai@example.com", password="testpass123"
        )

    def test_str_mentions_the_exercise_and_the_count(self):
        entry = ExHistory.objects.create(
            exType="pushup", exCount=12, exData=date(2026, 8, 11), owner=self.user
        )
        self.assertIn("pushup", str(entry))
        self.assertIn("12", str(entry))

    def test_history_is_deleted_with_its_owner(self):
        ExHistory.objects.create(
            exType="pushup", exCount=12, exData=date(2026, 8, 11), owner=self.user
        )
        self.user.delete()
        self.assertEqual(ExHistory.objects.count(), 0)


@override_settings(
    STORAGES={
        "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
        "staticfiles": {
            "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"
        },
    }
)
class AllauthFlowTests(TestCase):
    """เทมเพลตใน templates/account/ ทับของ allauth ไว้ ต้องรอดหลังอัพเวอร์ชัน"""

    def test_login_page_renders_the_override_template(self):
        response = self.client.get(reverse("account_login"))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "account/login.html")

    def test_signup_page_renders_the_override_template(self):
        response = self.client.get(reverse("account_signup"))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "account/signup.html")

    def test_password_reset_page_renders(self):
        response = self.client.get(reverse("account_reset_password"))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "account/password_reset.html")

    def test_signup_creates_a_user_and_logs_them_in(self):
        response = self.client.post(
            reverse("account_signup"),
            {"email": "newbie@example.com", "password1": "sup3rSecret!pass"},
        )
        self.assertEqual(response.status_code, 302)
        user = get_user_model().objects.get(email="newbie@example.com")
        self.assertEqual(int(self.client.session["_auth_user_id"]), user.pk)

    def test_login_uses_the_email_not_the_username(self):
        get_user_model().objects.create_user(
            username="somchai", email="somchai@example.com", password="sup3rSecret!pass"
        )
        response = self.client.post(
            reverse("account_login"),
            {"login": "somchai@example.com", "password": "sup3rSecret!pass"},
        )
        self.assertEqual(response.status_code, 302)
        self.assertIn("_auth_user_id", self.client.session)

    def test_signup_rejects_a_duplicate_email(self):
        get_user_model().objects.create_user(
            username="somchai", email="somchai@example.com", password="sup3rSecret!pass"
        )
        self.client.post(
            reverse("account_signup"),
            {"email": "somchai@example.com", "password1": "an0therSecret!pass"},
        )
        self.assertEqual(
            get_user_model().objects.filter(email="somchai@example.com").count(), 1
        )


class BuddyFormTests(TestCase):
    def test_only_name_and_skinname_are_editable(self):
        # owner ถูกใส่ใน view ไม่ใช่ในฟอร์ม ห้ามให้ client ส่งมาเอง
        self.assertEqual(list(BuddyForm().fields), ["name", "skinname"])

    def test_skin_widget_always_renders_one_of_the_two_skins(self):
        # RandomSkinWidget สุ่มค่าตอน render ผู้ใช้เลือกเองไม่ได้
        for _ in range(20):
            html = str(BuddyForm()["skinname"])
            self.assertTrue(
                'value="MINOTOR"' in html or 'value="DODO"' in html,
                f"skin widget rendered an unexpected value: {html}",
            )
