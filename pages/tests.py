import json
from datetime import date

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.urls import reverse

from accounts.models import Buddy, ExHistory

PROTECTED_PAGES = [
    "pages:home",
    "pages:pushup",
    "pages:situp",
    "pages:squat",
    "pages:challenge",
    "pages:create_buddy",
    "pages:ex_history",
]

WRITE_ENDPOINTS = [
    ("pages:update_pushup", "pushup_count", "armpower"),
    ("pages:update_situp", "situp_count", "bodypower"),
    ("pages:update_squat", "squat_count", "legpower"),
]


@override_settings(
    STATICFILES_STORAGE="django.contrib.staticfiles.storage.StaticFilesStorage"
)
class BaseTestCase(TestCase):
    """ปิด manifest storage ระหว่างเทสต์

    เทสต์รันด้วย DEBUG=False ทำให้ WhiteNoise ใช้ manifest ซึ่งยังไม่มีถ้าไม่ได้
    collectstatic ทุกหน้าที่มี {% static %} จะพังทั้งที่ view ไม่ได้ผิด
    """


class BuddyTestCase(BaseTestCase):
    """ผู้ใช้หนึ่งคน + buddy หนึ่งตัว ซึ่งเป็นสมมติฐานของ view ทุกตัวใน pages"""

    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="somchai", email="somchai@example.com", password="testpass123"
        )
        self.buddy = Buddy.objects.create(
            name="Duck", skinname="DODO", owner=self.user
        )
        self.client.force_login(self.user)

    def reload_buddy(self):
        self.buddy.refresh_from_db()
        return self.buddy


class AuthGuardTests(BaseTestCase):
    def test_pages_require_login(self):
        for name in PROTECTED_PAGES:
            with self.subTest(view=name):
                response = self.client.get(reverse(name))
                self.assertEqual(response.status_code, 302)
                self.assertIn("/accounts/login/", response["Location"])

    def test_write_endpoints_require_login(self):
        # POST แบบไม่ล็อกอินเคยทำให้ get_object_or_404(owner=AnonymousUser) ระเบิด 500
        names = [name for name, _, _ in WRITE_ENDPOINTS] + ["pages:update_score"]
        for name in names:
            with self.subTest(view=name):
                response = self.client.post(reverse(name), {})
                self.assertEqual(response.status_code, 302)
                self.assertIn("/accounts/login/", response["Location"])

    def test_leaderboard_is_public(self):
        response = self.client.get(reverse("pages:leaderboard"))
        self.assertEqual(response.status_code, 200)


class HomeViewTests(BuddyTestCase):
    def test_renders_the_home_page_with_the_buddy(self):
        response = self.client.get(reverse("pages:home"))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "pages/home.html")
        self.assertEqual(list(response.context["buddies"]), [self.buddy])

    def test_redirects_to_create_buddy_when_the_user_has_none(self):
        self.buddy.delete()
        response = self.client.get(reverse("pages:home"))
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response["Location"], "create_buddy/")

    def test_does_not_leak_other_users_buddies(self):
        other = get_user_model().objects.create_user(
            username="somsri", email="somsri@example.com", password="testpass123"
        )
        Buddy.objects.create(name="Other", skinname="MINOTOR", owner=other)
        response = self.client.get(reverse("pages:home"))
        self.assertEqual(list(response.context["buddies"]), [self.buddy])


class TrainingPageTests(BuddyTestCase):
    def test_each_training_page_renders_with_the_buddy(self):
        for name, template in [
            ("pages:pushup", "pages/pushup.html"),
            ("pages:situp", "pages/situp.html"),
            ("pages:squat", "pages/squat.html"),
            ("pages:challenge", "pages/challenge.html"),
        ]:
            with self.subTest(view=name):
                response = self.client.get(reverse(name))
                self.assertEqual(response.status_code, 200)
                self.assertTemplateUsed(response, template)
                self.assertEqual(list(response.context["buddies"]), [self.buddy])


class CreateBuddyTests(BaseTestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="somchai", email="somchai@example.com", password="testpass123"
        )
        self.client.force_login(self.user)

    def test_get_renders_the_form(self):
        response = self.client.get(reverse("pages:create_buddy"))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "pages/create.html")

    def test_post_creates_a_buddy_owned_by_the_request_user(self):
        response = self.client.post(
            reverse("pages:create_buddy"), {"name": "Duck", "skinname": "DODO"}
        )
        self.assertRedirects(response, "/", fetch_redirect_response=False)
        buddy = Buddy.objects.get()
        self.assertEqual(buddy.name, "Duck")
        self.assertEqual(buddy.owner, self.user)

    def test_owner_cannot_be_spoofed_through_the_form(self):
        victim = get_user_model().objects.create_user(
            username="somsri", email="somsri@example.com", password="testpass123"
        )
        self.client.post(
            reverse("pages:create_buddy"),
            {"name": "Duck", "skinname": "DODO", "owner": victim.pk},
        )
        self.assertEqual(Buddy.objects.get().owner, self.user)

    def test_invalid_post_does_not_create_anything(self):
        response = self.client.post(reverse("pages:create_buddy"), {"name": ""})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Buddy.objects.count(), 0)


class ExerciseUpdateTests(BuddyTestCase):
    def test_a_valid_count_raises_the_matching_stat(self):
        for name, field, stat in WRITE_ENDPOINTS:
            with self.subTest(view=name):
                before = getattr(self.reload_buddy(), stat)
                self.client.post(reverse(name), {field: "7"})
                self.assertEqual(getattr(self.reload_buddy(), stat), before + 7)

    def test_only_the_matching_stat_moves(self):
        self.client.post(reverse("pages:update_pushup"), {"pushup_count": "7"})
        buddy = self.reload_buddy()
        self.assertEqual(buddy.armpower, 7)
        self.assertEqual(buddy.bodypower, 0)
        self.assertEqual(buddy.legpower, 0)

    def test_a_valid_count_writes_one_history_row(self):
        for name, field, _ in WRITE_ENDPOINTS:
            with self.subTest(view=name):
                self.client.post(reverse(name), {field: "7"})
        self.assertEqual(ExHistory.objects.count(), 3)
        self.assertEqual(
            sorted(ExHistory.objects.values_list("exType", flat=True)),
            ["pushup", "situp", "squat"],
        )
        for entry in ExHistory.objects.all():
            self.assertEqual(entry.exCount, 7)
            self.assertEqual(entry.exData, date.today())
            self.assertEqual(entry.owner, self.user)

    def test_junk_payloads_are_treated_as_zero(self):
        # หน้าเกมส่งค่าพวกนี้มาจริงเมื่อผู้เล่นยังไม่จบเซ็ต เคยทำให้ int() พัง 500
        for payload in ["", "null", "undefined", "NaN", "abc", None]:
            for name, field, stat in WRITE_ENDPOINTS:
                with self.subTest(view=name, payload=payload):
                    data = {} if payload is None else {field: payload}
                    response = self.client.post(reverse(name), data)
                    self.assertEqual(response.status_code, 302)
                    self.assertEqual(getattr(self.reload_buddy(), stat), 0)
        self.assertEqual(ExHistory.objects.count(), 0)

    def test_a_float_count_is_truncated(self):
        self.client.post(reverse("pages:update_pushup"), {"pushup_count": "5.7"})
        self.assertEqual(self.reload_buddy().armpower, 5)

    def test_zero_does_not_write_a_history_row(self):
        self.client.post(reverse("pages:update_pushup"), {"pushup_count": "0"})
        self.assertEqual(self.reload_buddy().armpower, 0)
        self.assertEqual(ExHistory.objects.count(), 0)

    def test_get_changes_nothing(self):
        for name, _, stat in WRITE_ENDPOINTS:
            with self.subTest(view=name):
                response = self.client.get(reverse(name))
                self.assertEqual(response.status_code, 302)
                self.assertEqual(getattr(self.reload_buddy(), stat), 0)
        self.assertEqual(ExHistory.objects.count(), 0)

    def test_counts_accumulate_across_sessions(self):
        self.client.post(reverse("pages:update_pushup"), {"pushup_count": "7"})
        self.client.post(reverse("pages:update_pushup"), {"pushup_count": "3"})
        self.assertEqual(self.reload_buddy().armpower, 10)
        self.assertEqual(ExHistory.objects.count(), 2)


class ScoreUpdateTests(BuddyTestCase):
    def test_a_higher_score_replaces_the_high_score(self):
        self.client.post(reverse("pages:update_score"), {"score": "120"})
        self.assertEqual(self.reload_buddy().highScore, 120)

    def test_a_lower_score_is_ignored(self):
        self.buddy.highScore = 120
        self.buddy.save()
        self.client.post(reverse("pages:update_score"), {"score": "30"})
        self.assertEqual(self.reload_buddy().highScore, 120)

    def test_an_empty_score_does_not_crash_or_lower_the_record(self):
        # ปุ่ม Done ถูกกดได้ก่อนเกมจบ แล้วจะ POST score=""
        self.buddy.highScore = 120
        self.buddy.save()
        response = self.client.post(reverse("pages:update_score"), {"score": ""})
        self.assertEqual(response.status_code, 302)
        self.assertEqual(self.reload_buddy().highScore, 120)

    def test_score_never_touches_the_training_stats(self):
        self.client.post(reverse("pages:update_score"), {"score": "120"})
        buddy = self.reload_buddy()
        self.assertEqual((buddy.armpower, buddy.bodypower, buddy.legpower), (0, 0, 0))


class ExHistoryViewTests(BuddyTestCase):
    def setUp(self):
        super().setUp()
        ExHistory.objects.create(
            exType="pushup", exCount=10, exData=date(2026, 8, 1), owner=self.user
        )
        ExHistory.objects.create(
            exType="situp", exCount=20, exData=date(2026, 8, 2), owner=self.user
        )
        ExHistory.objects.create(
            exType="squat", exCount=30, exData=date(2026, 8, 3), owner=self.user
        )

    def test_context_holds_valid_json_split_by_exercise(self):
        response = self.client.get(reverse("pages:ex_history"))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "pages/ex_history.html")
        for key, expected in [
            ("pushup_data", 10),
            ("situp_data", 20),
            ("squat_data", 30),
        ]:
            with self.subTest(series=key):
                series = json.loads(response.context[key])
                self.assertEqual(len(series), 1)
                self.assertEqual(series[0]["count"], expected)
                self.assertIn("date", series[0])

    def test_only_the_request_users_history_is_returned(self):
        other = get_user_model().objects.create_user(
            username="somsri", email="somsri@example.com", password="testpass123"
        )
        ExHistory.objects.create(
            exType="pushup", exCount=999, exData=date(2026, 8, 4), owner=other
        )
        response = self.client.get(reverse("pages:ex_history"))
        counts = [row["count"] for row in json.loads(response.context["pushup_data"])]
        self.assertEqual(counts, [10])

    def test_empty_history_renders_empty_series(self):
        ExHistory.objects.all().delete()
        response = self.client.get(reverse("pages:ex_history"))
        for key in ["pushup_data", "situp_data", "squat_data"]:
            self.assertEqual(json.loads(response.context[key]), [])


class LeaderboardTests(BaseTestCase):
    def test_buddies_are_ordered_by_high_score_descending(self):
        for index, score in enumerate([50, 300, 150]):
            user = get_user_model().objects.create_user(
                username=f"player{index}",
                email=f"player{index}@example.com",
                password="testpass123",
            )
            Buddy.objects.create(
                name=f"buddy{index}", skinname="DODO", highScore=score, owner=user
            )
        response = self.client.get(reverse("pages:leaderboard"))
        scores = [buddy.highScore for buddy in response.context["buddies"]]
        self.assertEqual(scores, [300, 150, 50])


class KnownGapTests(BuddyTestCase):
    """พฤติกรรมที่ยังผิดอยู่ ล็อกไว้ให้เห็นชัด ถ้าแก้เมื่อไหร่ test พวกนี้ต้องถูกเขียนใหม่"""

    def test_a_negative_count_still_drains_the_stat(self):
        # client ส่ง -50 ได้ตรง ๆ _parse_count ไม่กันค่าติดลบ
        self.buddy.armpower = 100
        self.buddy.save()
        self.client.post(reverse("pages:update_pushup"), {"pushup_count": "-50"})
        self.assertEqual(self.reload_buddy().armpower, 50)

    def test_a_second_buddy_breaks_every_write_endpoint(self):
        # create_buddy ไม่กันการสร้าง buddy ตัวที่สอง แต่ update_* ใช้ get_object_or_404
        Buddy.objects.create(name="Second", skinname="MINOTOR", owner=self.user)
        # assertLogs กลืน traceback ของ django.request ไม่ให้รกผลเทสต์
        with self.assertLogs("django.request", level="ERROR"):
            with self.assertRaises(Buddy.MultipleObjectsReturned):
                self.client.post(reverse("pages:update_pushup"), {"pushup_count": "7"})
