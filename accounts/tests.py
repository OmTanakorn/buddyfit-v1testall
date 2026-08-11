from datetime import date

from django.contrib.auth import get_user_model
from django.test import TestCase

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
