import html
import re
import uuid
import logging
from decimal import Decimal as D
from datetime import timedelta
from urllib.parse import urljoin, urlparse

from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from django.shortcuts import get_object_or_404, render
from django.core.management import call_command
from django.conf import settings
from django.db.models import Case, IntegerField, Value, When
from django.db import transaction
from django.urls import reverse
from django.utils import timezone
from django.utils.html import strip_tags
from django.views.decorators.clickjacking import xframe_options_exempt
from django.views.decorators.cache import never_cache
from django.views.decorators.http import require_safe
from django.views.decorators.vary import vary_on_headers
from .models import (
    Course,
    Lesson,
    Enrollment,
    Review,
    CoursePayment,
    Coupon,
    Currency,
    UserSubscription,
)
from .serializers import (
    CourseListSerializer,
    CourseDetailSerializer,
    CourseLearnSerializer,
    ReviewSerializer,
    CurrencySerializer,
    CourseEnrollmentSerializer,
)
from api.pesapal import pesapal_service
from .utils import notify_discord
from .visibility import (
    lesson_is_visible_to_user,
    quiz_is_visible_to_user,
    same_week_lessons,
    user_can_manage_course,
)


logger = logging.getLogger(__name__)

LINK_PREVIEW_USER_AGENTS = (
    "facebookexternalhit",
    "facebot",
    "twitterbot",
    "linkedinbot",
    "whatsapp",
    "telegrambot",
    "slackbot",
    "discordbot",
    "pinterest",
    "iframely",
    "embedly",
    "skypeuripreview",
    "vkshare",
)


def _is_link_preview_bot(request):
    user_agent = request.META.get("HTTP_USER_AGENT", "").lower()
    return any(identifier in user_agent for identifier in LINK_PREVIEW_USER_AGENTS)


def _truncate_at_word(text, max_length=200):
    if len(text) <= max_length:
        return text
    shortened = text[: max_length - 3].rsplit(" ", 1)[0].rstrip()
    return f"{shortened}..."


def _course_social_description(course):
    source = course.subtitle or course.description or ""
    clean = html.unescape(strip_tags(source))
    clean = re.sub(r"!\[([^\]]*)\]\([^)]*\)", r"\1", clean)
    clean = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", clean)
    clean = re.sub(r"[#*_`>~]+", " ", clean)
    clean = re.sub(r"\s+", " ", clean).strip()
    instructor = course.instructor_name or "Peter Gordon Ekebu"

    parts = [f"Study {course.title} online with {instructor}."]
    if clean:
        parts.append(clean)
    parts.append("Build practical skills and learn at your own pace.")
    return _truncate_at_word(" ".join(parts))


def _validated_public_image_url(raw_url, site_url):
    if not raw_url:
        return None

    parsed = urlparse(raw_url)
    if parsed.scheme in {"http", "https"} and parsed.netloc:
        return raw_url
    if not parsed.scheme and raw_url.startswith("/"):
        return urljoin(f"{site_url}/", raw_url.lstrip("/"))
    return None


def _course_social_image_url(course, site_url):
    if course.thumbnail_upload:
        try:
            if course.thumbnail_upload.storage.exists(course.thumbnail_upload.name):
                uploaded_url = _validated_public_image_url(
                    course.thumbnail_upload.url,
                    site_url,
                )
                if uploaded_url:
                    return uploaded_url
        except Exception:
            logger.warning(
                "Unable to resolve stored thumbnail for course %s",
                course.slug,
                exc_info=True,
            )

    external_url = _validated_public_image_url(course.thumbnail, site_url)
    if external_url:
        return external_url

    return urljoin(f"{site_url}/", "icon-512.png")


@require_safe
@vary_on_headers("User-Agent")
@never_cache
def og_course_preview(request, slug):
    if not _is_link_preview_bot(request):
        return render(request, "index.html")

    course = get_object_or_404(Course, slug=slug, is_published=True)
    site_url = settings.PUBLIC_SITE_URL.rstrip("/")
    page_path = reverse("og-course-preview", kwargs={"slug": course.slug})
    page_url = urljoin(f"{site_url}/", page_path.lstrip("/"))
    description = _course_social_description(course)
    image_url = _course_social_image_url(course, site_url)

    response = render(
        request,
        "social/course_preview.html",
        {
            "course": course,
            "meta_title": f"{course.title} | Online Course",
            "description": description,
            "image_url": image_url,
            "page_url": page_url,
        },
    )
    response["Content-Security-Policy"] = (
        "default-src 'none'; img-src https: http:; base-uri 'none'; form-action 'none'"
    )
    response["X-Content-Type-Options"] = "nosniff"
    return response


class CourseListView(generics.ListAPIView):
    """List all published courses with computed fields."""

    serializer_class = CourseListSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        response["Cache-Control"] = "no-store, max-age=0"
        response["Pragma"] = "no-cache"
        return response

    def get_queryset(self):
        queryset = (
            Course.objects.filter(is_published=True)
            .annotate(
                catalogue_group=Case(
                    When(past_paper__isnull=True, then=Value(0)),
                    default=Value(1),
                    output_field=IntegerField(),
                )
            )
            .order_by("catalogue_group", "-updated_at", "-id")
        )
        category = self.request.query_params.get("category")
        level = self.request.query_params.get("level")
        search = self.request.query_params.get("search")

        if category:
            queryset = queryset.filter(category__iexact=category)
        if level:
            queryset = queryset.filter(level=level)
        if search:
            queryset = queryset.filter(title__icontains=search)

        enrolled = self.request.query_params.get("enrolled")
        if enrolled and enrolled.lower() == "true" and self.request.user.is_authenticated:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(enrollments__user=self.request.user, enrollments__is_active=True) | Q(assigned_instructor=self.request.user)
            ).distinct()

        return queryset


class CourseDetailView(generics.RetrieveAPIView):
    """Full course detail for the landing page (public)."""

    serializer_class = CourseDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"

    def get_queryset(self):
        return Course.objects.filter(is_published=True)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def course_learn(request, slug):
    """Full course content for enrolled students (includes video URLs)."""
    course = get_object_or_404(Course, slug=slug, is_published=True)

    if not Enrollment.objects.filter(user=request.user, course=course, is_active=True).exists():
        if not user_can_manage_course(request.user, course):
            return Response(
                {"error": "You are not enrolled in this course."},
                status=status.HTTP_403_FORBIDDEN,
            )

    serializer = CourseLearnSerializer(course, context={"request": request})
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([AllowAny])
def validate_coupon(request):
    """Validate a coupon against a list of course IDs."""
    logger = logging.getLogger(__name__)

    try:
        code = request.data.get("coupon_code")
        course_ids = request.data.get("course_ids", [])

        if not code:
            return Response({"error": "Coupon code is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            coupon = Coupon.objects.get(code__iexact=code)
            if not coupon.is_active:
                return Response({"error": f"The coupon code '{code.upper()}' is no longer active."}, status=status.HTTP_400_BAD_REQUEST)
        except Coupon.DoesNotExist:
            return Response({"error": f"The coupon code '{code.upper()}' does not exist. Please check for typos."}, status=status.HTTP_400_BAD_REQUEST)

        # Check validity dates
        now = timezone.now()
        if coupon.valid_until and now > coupon.valid_until:
            return Response({"error": f"The coupon '{code.upper()}' expired on {coupon.valid_until.strftime('%b %d, %Y')}."}, status=status.HTTP_400_BAD_REQUEST)

        # Check max uses
        if coupon.max_uses and coupon.current_uses >= coupon.max_uses:
            return Response({"error": f"The coupon '{code.upper()}' has reached its maximum usage limit of {coupon.max_uses}."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if user has already used it AND is already enrolled in all the requested courses
        if request.user.is_authenticated and coupon.used_by.filter(id=request.user.id).exists():
            # Only block if the user is already FULLY enrolled in ALL courses they're trying to buy
            already_enrolled_ids = set(
                Enrollment.objects.filter(user=request.user, course_id__in=course_ids, max_modules__isnull=True).values_list('course_id', flat=True)
            )
            if already_enrolled_ids and set(int(cid) for cid in course_ids).issubset(already_enrolled_ids):
                return Response({"error": "You have already used this coupon and are enrolled in all selected courses."}, status=status.HTTP_400_BAD_REQUEST)
            # If they used the coupon before but are NOT enrolled, let them retry

        # Check if coupon is restricted to specific users
        if coupon.allowed_users.exists() and (not request.user.is_authenticated or not coupon.allowed_users.filter(id=request.user.id).exists()):
            return Response({"error": "You are not authorized to use this coupon."}, status=status.HTTP_400_BAD_REQUEST)

        courses = Course.objects.filter(id__in=course_ids, is_published=True)
        if not courses.exists():
            return Response({"error": "Invalid courses selected."}, status=status.HTTP_400_BAD_REQUEST)

        # Calculate discount using Decimal arithmetic to avoid Decimal * float TypeError
        total_amount = sum(c.price_ugx for c in courses)
        discount_percent = 0

        if coupon.applicable_courses.exists():
            valid_courses = courses.filter(id__in=coupon.applicable_courses.all())
            if valid_courses.exists():
                # Discount only applies to valid courses in the cart
                discount_amount = sum(c.price_ugx for c in valid_courses) * D(coupon.discount_percent) / D(100)
                new_total = total_amount - discount_amount
                discount_percent = coupon.discount_percent
            else:
                return Response({"error": f"The coupon '{code.upper()}' is not applicable to any of the selected courses."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            discount_percent = coupon.discount_percent
            new_total = total_amount * (D(1) - D(coupon.discount_percent) / D(100))

        if new_total < 0:
            new_total = D(0)

        return Response({
            "valid": True,
            "discount_percent": discount_percent,
            "original_total": float(total_amount),
            "new_total": float(new_total),
            "message": f"Coupon applied: {discount_percent}% off!"
        })

    except Exception as e:
        logger.error(f"Coupon validation error: {e}", exc_info=True)
        return Response(
            {"error": "An unexpected error occurred while validating the coupon."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

@api_view(["POST"])
@permission_classes([AllowAny])
def validate_ekebu_ai_coupon(request):
    """Validate a coupon specifically for EkebuAI Pro Passes, independent of course restrictions."""
    logger = logging.getLogger(__name__)

    try:
        code = request.data.get("coupon_code")
        plan = request.data.get("plan", "MONTHLY")  # MONTHLY, QUARTERLY, ANNUAL
        
        if not code:
            return Response({"error": "Coupon code is required."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            coupon = Coupon.objects.get(code__iexact=code)
            if not coupon.is_active:
                return Response({"error": f"The coupon code '{code.upper()}' is no longer active."}, status=status.HTTP_400_BAD_REQUEST)
        except Coupon.DoesNotExist:
            return Response({"error": f"The coupon code '{code.upper()}' does not exist. Please check for typos."}, status=status.HTTP_400_BAD_REQUEST)

        # Check validity dates
        now = timezone.now()
        if coupon.valid_until and now > coupon.valid_until:
            return Response({"error": f"The coupon '{code.upper()}' expired on {coupon.valid_until.strftime('%b %d, %Y')}."}, status=status.HTTP_400_BAD_REQUEST)

        # Check max uses
        if coupon.max_uses and coupon.current_uses >= coupon.max_uses:
            return Response({"error": f"The coupon '{code.upper()}' has reached its maximum usage limit of {coupon.max_uses}."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if user has already used it (for Pro Passes, a single use per user is standard)
        if request.user.is_authenticated and coupon.used_by.filter(id=request.user.id).exists():
            return Response({"error": "You have already used this coupon."}, status=status.HTTP_400_BAD_REQUEST)

        # Base prices
        from decimal import Decimal as D
        prices = {
            "MONTHLY": D(15000),
            "QUARTERLY": D(40000),
            "ANNUAL": D(120000)
        }
        
        base_price = prices.get(plan, D(15000))
        discount_percent = coupon.discount_percent
        new_total = base_price * (D(1) - D(discount_percent) / D(100))
        
        if new_total < 0:
            new_total = D(0)
            
        return Response({
            "valid": True,
            "discount_percent": discount_percent,
            "original_total": float(base_price),
            "new_total": float(new_total),
            "message": f"Coupon applied: {discount_percent}% off!"
        })
        
    except Exception as e:
        logger.error(f"EkebuAI Coupon validation error: {e}", exc_info=True)
        return Response(
            {"error": "An unexpected error occurred while validating the coupon."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def course_checkout(request):
    """Initiate Pesapal checkout for one or more courses in cart."""
    import logging
    logger = logging.getLogger(__name__)

    try:
        course_ids = request.data.get("course_ids", [])
        phone_number = request.data.get("phone_number", "")

        if not course_ids:
            return Response({"error": "No courses provided for checkout."}, status=status.HTTP_400_BAD_REQUEST)

        courses = Course.objects.filter(id__in=course_ids, is_published=True)
        if not courses.exists():
            return Response({"error": "Invalid courses selected."}, status=status.HTTP_400_BAD_REQUEST)

        # Filter out courses already fully enrolled
        enrolled_course_ids = set(Enrollment.objects.filter(user=request.user, course__in=courses, max_modules__isnull=True).values_list('course_id', flat=True))
        courses_to_buy = [c for c in courses if c.id not in enrolled_course_ids]

        if not courses_to_buy:
            return Response({"error": "You are already enrolled in all selected courses.", "already_enrolled": True}, status=status.HTTP_400_BAD_REQUEST)

        coupon_code = request.data.get("coupon_code")
        discount_percent = 0
        coupon_obj = None
        now = timezone.now()

        if coupon_code:
            try:
                coupon_obj = Coupon.objects.get(code__iexact=coupon_code)
                if not coupon_obj.is_active:
                    return Response({"error": f"The coupon code '{coupon_code.upper()}' is no longer active."}, status=status.HTTP_400_BAD_REQUEST)
                
                if coupon_obj.valid_until and now > coupon_obj.valid_until:
                    return Response({"error": f"The coupon '{coupon_code.upper()}' expired on {coupon_obj.valid_until.strftime('%b %d, %Y')}."}, status=status.HTTP_400_BAD_REQUEST)
                
                if coupon_obj.max_uses and coupon_obj.current_uses >= coupon_obj.max_uses:
                    return Response({"error": f"The coupon '{coupon_code.upper()}' has reached its maximum usage limit of {coupon_obj.max_uses}."}, status=status.HTTP_400_BAD_REQUEST)

                if request.user.is_authenticated and coupon_obj.used_by.filter(id=request.user.id).exists():
                    # Only block if user is already FULLY enrolled in ALL the courses they're checking out
                    enrolled_with_coupon = set(
                        Enrollment.objects.filter(user=request.user, course__in=courses_to_buy, max_modules__isnull=True).values_list('course_id', flat=True)
                    )
                    cart_ids = set(c.id for c in courses_to_buy)
                    if cart_ids.issubset(enrolled_with_coupon):
                        return Response({"error": "You have already used this coupon and are enrolled in all selected courses."}, status=status.HTTP_400_BAD_REQUEST)
                    # Otherwise let them retry - they used the coupon but didn't complete enrollment

                if coupon_obj.allowed_users.exists() and (not request.user.is_authenticated or not coupon_obj.allowed_users.filter(id=request.user.id).exists()):
                    return Response({"error": "You are not authorized to use this coupon."}, status=status.HTTP_400_BAD_REQUEST)

                if coupon_obj.applicable_courses.exists():
                    valid_for_cart = any(c in coupon_obj.applicable_courses.all() for c in courses_to_buy)
                    if valid_for_cart:
                        discount_percent = coupon_obj.discount_percent
                    else:
                        return Response({"error": f"The coupon '{coupon_code.upper()}' is not applicable to any of the selected courses."}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    discount_percent = coupon_obj.discount_percent
            except Coupon.DoesNotExist:
                return Response({"error": f"The coupon code '{coupon_code.upper()}' does not exist. Please check for typos."}, status=status.HTTP_400_BAD_REQUEST)

        original_total = sum(c.price_ugx for c in courses_to_buy)
        total_amount_ugx = original_total * (D(1) - D(discount_percent) / D(100))
        if total_amount_ugx < 0:
            total_amount_ugx = D(0)

        # Free courses only or 100% discount
        if total_amount_ugx == 0:
            for c in courses_to_buy:
                Enrollment.objects.update_or_create(
                    user=request.user, 
                    course=c,
                    defaults={'max_modules': coupon_obj.max_modules if coupon_obj else None}
                )

            # Mark coupon as used
            if coupon_obj and discount_percent > 0:
                coupon_obj.current_uses += 1
                coupon_obj.used_by.add(request.user)
                coupon_obj.save()

            course_names = ", ".join([c.title for c in courses_to_buy])
            notify_discord(f"New Free Enrollment: {request.user.email} enrolled in {course_names} using a coupon.")

            return Response({"message": "Enrolled successfully.", "is_free": True})

        # Process Currency
        currency_code = request.data.get("currency_code", "UGX").upper()
        billing_currency = "UGX"
        billing_amount = total_amount_ugx
        exchange_rate = D(1)

        if currency_code != "UGX":
            try:
                currency_obj = Currency.objects.get(code=currency_code, is_active=True)
                billing_currency = currency_obj.code
                exchange_rate = currency_obj.exchange_rate_to_ugx
                billing_amount = total_amount_ugx * exchange_rate
            except Currency.DoesNotExist:
                # Fallback to UGX if currency not found
                pass

        # Paid courses: initiate Pesapal checkout
        merchant_reference = f"CART-{request.user.id}-{uuid.uuid4().hex[:8]}"

        # Save pending payments sharing the same merchant_reference
        payments = []
        for c in courses_to_buy:
            # Create a payment record for each course but they all share the merchant_reference
            payments.append(CoursePayment(
                user=request.user,
                course=c,
                merchant_reference=merchant_reference,
                amount=c.price_ugx * exchange_rate if billing_currency != "UGX" else c.price_ugx,
                status="PENDING",
                coupon=coupon_obj,
            ))
        CoursePayment.objects.bulk_create(payments)

        try:
            callback_url = request.data.get(
                "callback_url",
                request.build_absolute_uri("/support/success"),  # Generic success page for now
            )

            # Register IPN
            ipn_url = request.build_absolute_uri("/api/courses/webhook/")
            ipn_id = pesapal_service.register_ipn(ipn_url)

            # Submit order to Pesapal
            order_data = {
                "id": merchant_reference,
                "currency": billing_currency,
                "amount": float(billing_amount),
                "description": f"Cart Checkout ({len(courses_to_buy)} items)",
                "callback_url": callback_url,
                "notification_id": ipn_id,
                "billing_address": {
                    "email_address": request.user.email or "student@example.com",
                    "phone_number": phone_number,
                    "first_name": request.user.first_name or request.user.username,
                    "last_name": request.user.last_name or "",
                },
            }

            result = pesapal_service.submit_order(order_data)

            # Save tracking ID for all payments in this transaction
            tracking_id = result.get("order_tracking_id", "")
            CoursePayment.objects.filter(merchant_reference=merchant_reference).update(order_tracking_id=tracking_id)

            return Response({
                "redirect_url": result.get("redirect_url"),
                "merchant_reference": merchant_reference,
            })

        except Exception as e:
            logger.error(f"Pesapal checkout error for user {request.user.id}: {e}", exc_info=True)
            CoursePayment.objects.filter(merchant_reference=merchant_reference).update(status="FAILED")
            return Response(
                {"error": f"Payment gateway error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    except Exception as e:
        logger.error(f"Unexpected checkout error for user {request.user.id}: {e}", exc_info=True)
        return Response(
            {"error": "An unexpected error occurred during checkout. Please try again."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def pro_pass_checkout(request):
    """Initiates Pesapal checkout or free grant for EkebuAI Pro subscription passes."""
    plan = request.data.get("plan", "MONTHLY").upper()
    phone_number = request.data.get("phone_number", "").strip()
    coupon_code = (request.data.get("coupon_code") or "").strip().upper()

    PLAN_PRICES_UGX = {
        "MONTHLY": D(15000),
        "QUARTERLY": D(40000),
        "ANNUAL": D(120000),
    }

    if plan not in PLAN_PRICES_UGX:
        return Response({"error": "Invalid plan selected."}, status=400)

    amount_ugx = PLAN_PRICES_UGX[plan]

    coupon_obj = None
    if coupon_code:
        coupon_obj = Coupon.objects.filter(code__iexact=coupon_code).first()
        if coupon_obj is None:
            return Response({"error": "Coupon code does not exist."}, status=400)
        now = timezone.now()
        if not coupon_obj.is_active:
            return Response({"error": "Coupon is no longer active."}, status=400)
        if coupon_obj.valid_until and coupon_obj.valid_until < now:
            return Response({"error": "Coupon has expired."}, status=400)
        if coupon_obj.max_uses and coupon_obj.current_uses >= coupon_obj.max_uses:
            return Response({"error": "Coupon usage limit has been reached."}, status=400)
        if coupon_obj.allowed_users.exists() and not coupon_obj.allowed_users.filter(
            id=request.user.id
        ).exists():
            return Response({"error": "You are not authorised to use this coupon."}, status=403)
        if coupon_obj.used_by.filter(id=request.user.id).exists():
            return Response({"error": "You have already used this coupon."}, status=400)
        amount_ugx = amount_ugx * (
            D(1) - D(coupon_obj.discount_percent) / D(100)
        )
        amount_ugx = max(D(0), amount_ugx)

    merchant_reference = f"PROPASS-{request.user.id}-{plan}-{uuid.uuid4().hex[:6]}"

    # Handle 100% Discount / Free Pass directly without Pesapal redirect
    if amount_ugx <= D(0):
        try:
            from datetime import timedelta

            duration_days = 30
            if plan == "QUARTERLY":
                duration_days = 90
            elif plan == "ANNUAL":
                duration_days = 365

            with transaction.atomic():
                if coupon_obj:
                    coupon_obj = Coupon.objects.select_for_update().get(pk=coupon_obj.pk)
                    if coupon_obj.max_uses and coupon_obj.current_uses >= coupon_obj.max_uses:
                        return Response(
                            {"error": "Coupon usage limit has been reached."},
                            status=400,
                        )
                fallback_course = Course.objects.first()
                CoursePayment.objects.create(
                    user=request.user,
                    course=fallback_course,
                    merchant_reference=merchant_reference,
                    order_tracking_id=f"FREE-{uuid.uuid4().hex[:8]}",
                    amount=D(0),
                    status="COMPLETED",
                )
                now = timezone.now()
                current_sub = UserSubscription.objects.filter(user=request.user).first()
                start_base = (
                    current_sub.expires_at
                    if current_sub and current_sub.is_valid()
                    else now
                )
                subscription, _ = UserSubscription.objects.update_or_create(
                    user=request.user,
                    defaults={
                        "plan": plan,
                        "expires_at": start_base + timedelta(days=duration_days),
                        "is_active": True,
                        "merchant_reference": merchant_reference,
                    },
                )
                if coupon_obj:
                    from notifications.models import Notification
                    from notifications.services import notify_user

                    # A fully discounted Pro Pass is a coupon redemption, not a
                    # customer payment. Replace the generic payment event with a
                    # clear coupon notification.
                    payment_notification = Notification.objects.filter(
                        recipient=request.user,
                        dedupe_key__startswith="payment:",
                        metadata__payment_id__isnull=False,
                        metadata__status="COMPLETED",
                    ).order_by("-created_at").first()
                    if payment_notification:
                        payment_notification.delete()
                    notify_user(
                        request.user,
                        event_type="coupon.used",
                        category=Notification.Category.ACCOUNT,
                        priority=Notification.Priority.SUCCESS,
                        title="Coupon used successfully",
                        message=f"Your coupon {coupon_obj.code} was applied and EkebuAI Pro is now active.",
                        action_url="/ekebu-ai",
                        metadata={"coupon_code": coupon_obj.code, "plan": plan},
                        dedupe_key=f"coupon:{coupon_obj.pk}:{request.user.pk}",
                    )
                    coupon_obj.current_uses += 1
                    coupon_obj.save(update_fields=["current_uses"])
                    coupon_obj.used_by.add(request.user)

            return Response({
                "free_grant": True,
                "message": "Pro Pass activated successfully!",
                "merchant_reference": merchant_reference,
                "subscription": {
                    "is_pro": subscription.is_valid(),
                    "plan": subscription.plan,
                    "expires_at": subscription.expires_at,
                },
            })
        except Exception as e:
            logger.error(f"Free Pro Pass activation error: {e}", exc_info=True)
            return Response({"error": f"Failed to activate free pass: {str(e)}"}, status=500)

    try:
        ipn_url = request.build_absolute_uri("/api/courses/webhook/")
        ipn_id = pesapal_service.register_ipn(ipn_url)

        frontend_domain = getattr(settings, 'PUBLIC_SITE_URL', 'https://petergordonekebu.com').rstrip('/')
        callback_url = request.data.get("callback_url") or f"{frontend_domain}/dashboard/my-learning?payment_status=check"

        order_data = {
            "id": merchant_reference,
            "currency": "UGX",
            "amount": float(amount_ugx),
            "description": f"EkebuAI Pro Pass ({plan} Subscription)",
            "callback_url": callback_url,
            "notification_id": ipn_id,
            "billing_address": {
                "email_address": request.user.email or "student@example.com",
                "phone_number": phone_number,
                "first_name": request.user.first_name or request.user.username,
                "last_name": request.user.last_name or "",
            },
        }

        result = pesapal_service.submit_order(order_data)
        tracking_id = result.get("order_tracking_id", "")

        fallback_course = Course.objects.first()
        CoursePayment.objects.create(
            user=request.user,
            course=fallback_course,
            merchant_reference=merchant_reference,
            order_tracking_id=tracking_id,
            amount=amount_ugx,
            status="PENDING",
        )

        return Response({
            "redirect_url": result.get("redirect_url"),
            "merchant_reference": merchant_reference,
        })
    except Exception as e:
        logger.error(f"Pro Pass checkout error: {e}", exc_info=True)
        return Response({"error": f"Payment error: {str(e)}"}, status=500)


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def course_webhook(request):
    """Pesapal IPN callback -- verifies payment and creates enrollment."""
    order_tracking_id = (
        request.data.get("OrderTrackingId")
        or request.query_params.get("OrderTrackingId")
    )

    if not order_tracking_id:
        return Response({"error": "Missing OrderTrackingId"}, status=400)

    payments = CoursePayment.objects.filter(order_tracking_id=order_tracking_id)
    if not payments.exists():
        return Response({"error": "Payment not found"}, status=404)

    try:
        tx_status = pesapal_service.get_transaction_status(order_tracking_id)
        payment_status_code = tx_status.get("payment_status_code")

        if payment_status_code == 1:  # Completed
            for payment in payments:
                if payment.status != "COMPLETED":
                    payment.status = "COMPLETED"
                    payment.save(update_fields=["status"])
            from datetime import timedelta
            
            # Create enrollments or activate Pro subscriptions
            for payment in payments:
                if payment.merchant_reference and payment.merchant_reference.startswith("PROPASS"):
                    parts = payment.merchant_reference.split("-")
                    plan_code = parts[2] if len(parts) >= 3 else "MONTHLY"
                    days = 30 if plan_code == "MONTHLY" else (90 if plan_code == "QUARTERLY" else 365)
                    now = timezone.now()
                    current_sub = UserSubscription.objects.filter(user=payment.user, is_active=True).first()
                    start_base = current_sub.expires_at if (current_sub and current_sub.is_valid()) else now
                    new_expiry = start_base + timedelta(days=days)
                    
                    UserSubscription.objects.update_or_create(
                        user=payment.user,
                        defaults={
                            "plan": plan_code,
                            "expires_at": new_expiry,
                            "is_active": True,
                            "merchant_reference": payment.merchant_reference,
                        }
                    )
                    notify_discord(f"✨ New EkebuAI Pro Pass: {payment.user.email} unlocked {plan_code} pass!")
                elif payment.course:
                    Enrollment.objects.update_or_create(
                        user=payment.user, 
                        course=payment.course,
                        defaults={'max_modules': payment.coupon.max_modules if payment.coupon else None}
                    )
                
            user_email = payments.first().user.email
            paid_item_names = ", ".join([p.course.title for p in payments if p.course] or ["EkebuAI Pro Pass"])
            notify_discord(f"New Paid Order: {user_email} completed payment for {paid_item_names}!")

            return Response({"status": "COMPLETED"})
        elif payment_status_code == 2:  # Failed
            for payment in payments:
                if payment.status != "FAILED":
                    payment.status = "FAILED"
                    payment.save(update_fields=["status"])
            return Response({"status": "FAILED"})
        else:
            return Response({"status": "PENDING"})

    except Exception as e:
        logger.error(f"Pesapal webhook error: {e}", exc_info=True)
        return Response({"error": str(e)}, status=500)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def check_payment_status(request):
    """Check payment status from frontend after redirect"""
    order_tracking_id = request.query_params.get("OrderTrackingId")
    if not order_tracking_id:
        return Response({"error": "Missing OrderTrackingId"}, status=400)
    
    payments = CoursePayment.objects.filter(order_tracking_id=order_tracking_id, user=request.user)
    if not payments.exists():
        return Response({"error": "Payment not found"}, status=404)
        
    payment = payments.first()
    
    # If the webhook hasn't processed it yet, check Pesapal manually
    if payment.status == "PENDING":
        try:
            tx_status = pesapal_service.get_transaction_status(order_tracking_id)
            payment_status_code = tx_status.get("payment_status_code")
            
            if payment_status_code == 1:
                for p in payments:
                    if p.status != "COMPLETED":
                        p.status = "COMPLETED"
                        p.save(update_fields=["status"])
                from datetime import timedelta
                for p in payments:
                    if p.merchant_reference and p.merchant_reference.startswith("PROPASS"):
                        parts = p.merchant_reference.split("-")
                        plan_code = parts[2] if len(parts) >= 3 else "MONTHLY"
                        days = 30 if plan_code == "MONTHLY" else (90 if plan_code == "QUARTERLY" else 365)
                        now = timezone.now()
                        current_sub = UserSubscription.objects.filter(user=p.user, is_active=True).first()
                        start_base = current_sub.expires_at if (current_sub and current_sub.is_valid()) else now
                        new_expiry = start_base + timedelta(days=days)
                        UserSubscription.objects.update_or_create(
                            user=p.user,
                            defaults={
                                "plan": plan_code,
                                "expires_at": new_expiry,
                                "is_active": True,
                                "merchant_reference": p.merchant_reference,
                            }
                        )
                    elif p.course:
                        Enrollment.objects.get_or_create(user=p.user, course=p.course)
            elif payment_status_code == 2:
                for p in payments:
                    if p.status != "FAILED":
                        p.status = "FAILED"
                        p.save(update_fields=["status"])
            elif payment_status_code == 3:
                for p in payments:
                    if p.status != "REVERSED":
                        p.status = "REVERSED"
                        p.save(update_fields=["status"])
        except Exception:
            pass
            
    # Refresh payment
    payment = payments.first()
    
    return Response({
        "status": payment.status,
        "amount": payment.amount,
        "merchant_reference": payment.merchant_reference,
        "courses": [{"id": p.course.id, "title": p.course.title, "slug": p.course.slug} for p in payments]
    })



@api_view(["POST"])
@permission_classes([IsAuthenticated])
def toggle_lesson_complete(request, slug, lesson_id):
    """Toggle a lesson's completion status for the authenticated user."""
    course = get_object_or_404(Course, slug=slug, is_published=True)
    enrollment = Enrollment.objects.filter(user=request.user, course=course).first()
    if not enrollment:
        if user_can_manage_course(request.user, course):
            enrollment, _ = Enrollment.objects.get_or_create(user=request.user, course=course)
        else:
            return Response(
                {"error": "You are not enrolled in this course."},
                status=status.HTTP_403_FORBIDDEN,
            )

    lesson = get_object_or_404(Lesson, id=lesson_id, module__course=course)
    if not lesson_is_visible_to_user(lesson, request.user):
        return Response(
            {"error": "This lesson is hidden. You cannot mark it complete."},
            status=status.HTTP_403_FORBIDDEN,
        )
    previous_progress = enrollment.progress_percent

    if enrollment.completed_lessons.filter(id=lesson.id).exists():
        enrollment.completed_lessons.remove(lesson)
        completed = False
    else:
        enrollment.completed_lessons.add(lesson)
        completed = True

    # If student is part of a cohort team or paired, sync completion to teammates' enrollments
    try:
        from .models import LessonPairing, CohortTeam
        teammates = set()
        
        cohort_teams = CohortTeam.objects.filter(cohort__course=course, students=request.user)
        for team in cohort_teams:
            for s in team.students.exclude(id=request.user.id):
                teammates.add(s)

        pairing = LessonPairing.objects.filter(
            lesson=lesson,
            is_active=True
        ).filter(Q(host_student=request.user) | Q(partner_student=request.user)).first()
        if pairing:
            partner = pairing.partner_student if pairing.host_student == request.user else pairing.host_student
            if partner and partner != request.user:
                teammates.add(partner)

        for teammate in teammates:
            t_enrollment = Enrollment.objects.filter(user=teammate, course=course).first()
            if t_enrollment:
                if completed:
                    t_enrollment.completed_lessons.add(lesson)
                else:
                    t_enrollment.completed_lessons.remove(lesson)
    except Exception as e:
        logger.warning(f"Error syncing team/partner completion for lesson {lesson.id}: {e}")

    current_progress = enrollment.progress_percent
    if completed:
        reached_milestones = [
            milestone
            for milestone in (25, 50, 75, 100)
            if previous_progress < milestone <= current_progress
        ]
        if reached_milestones:
            from notifications.models import Notification
            from notifications.services import notify_user

            milestone = max(reached_milestones)
            notify_user(
                request.user,
                event_type="course.progress_milestone",
                category=Notification.Category.ACHIEVEMENT,
                priority=Notification.Priority.SUCCESS,
                title=(
                    "Course completed"
                    if milestone == 100
                    else f"{milestone}% course milestone"
                ),
                message=(
                    f"You completed {course.title}. Congratulations!"
                    if milestone == 100
                    else f"You have completed {milestone}% of {course.title}."
                ),
                action_url=f"/courses/{course.slug}/learn",
                metadata={"course_id": course.pk, "progress_percent": milestone},
                dedupe_key=f"course-progress:{course.pk}:{request.user.pk}:{milestone}",
                queue_email=milestone == 100,
            )

    response_data = {
        "lesson_id": lesson.id,
        "completed": completed,
        "progress_percent": current_progress,
    }

    if current_progress == 100:
        from .models import Certificate
        cert = Certificate.objects.filter(user=request.user, course=course).first()
        if cert and cert.pdf_file:
            response_data["certificate_url"] = request.build_absolute_uri(cert.pdf_file.url) if request else cert.pdf_file.url

    return Response(response_data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def sync_video_progress(request, slug, lesson_id):
    """Sync video watch time progress."""
    course = get_object_or_404(Course, slug=slug, is_published=True)
    
    # Must be enrolled
    if not Enrollment.objects.filter(user=request.user, course=course).exists():
        return Response({"error": "Not enrolled"}, status=403)
        
    lesson = get_object_or_404(Lesson, id=lesson_id, module__course=course)
    timestamp_seconds = request.data.get("timestamp_seconds", 0)
    
    from .models import VideoProgress
    progress, _ = VideoProgress.objects.update_or_create(
        user=request.user,
        lesson=lesson,
        defaults={"timestamp_seconds": int(timestamp_seconds)}
    )
    
    return Response({"status": "synced", "timestamp_seconds": progress.timestamp_seconds})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def submit_review(request, slug):
    """Submit or update a course review."""
    course = get_object_or_404(Course, slug=slug, is_published=True)

    is_enrolled = Enrollment.objects.filter(user=request.user, course=course).exists()
    if not is_enrolled and not request.user.is_staff and not request.user.is_superuser:
        return Response(
            {"error": "You must be enrolled to review this course."},
            status=status.HTTP_403_FORBIDDEN,
        )

    rating = request.data.get("rating")
    comment = request.data.get("comment", "")

    try:
        rating_val = int(rating)
    except (ValueError, TypeError):
        rating_val = 0

    if rating_val not in range(1, 6):
        return Response(
            {"error": "Rating must be between 1 and 5."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    auto_approve = bool(request.user.is_staff or request.user.is_superuser)
    existing = Review.objects.filter(user=request.user, course=course).first()
    is_approved_val = existing.is_approved if (existing and existing.is_approved) else auto_approve

    review, created = Review.objects.update_or_create(
        user=request.user,
        course=course,
        defaults={"rating": rating_val, "comment": comment, "is_approved": is_approved_val},
    )

    try:
        from notifications.models import Notification
        from django.contrib.auth.models import User
        
        superadmins = User.objects.filter(is_superuser=True)
        for admin in superadmins:
            Notification.objects.create(
                recipient=admin,
                event_type="course.review_submitted",
                category=Notification.Category.COURSE,
                title="New Course Review",
                message=f"{request.user.first_name or request.user.username} submitted a {rating_val}-star review for {course.title}.",
                action_url="/dashboard/reviews",
            )
    except Exception as notif_err:
        logger.warning(f"Could not dispatch review notification: {notif_err}")

    serializer = ReviewSerializer(review, context={"request": request})
    return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


def _serialize_ai_conversation(conversation, include_messages=False):
    data = {
        "id": str(conversation.id),
        "title": conversation.title,
        "course_slug": conversation.course.slug,
        "created_at": conversation.created_at,
        "updated_at": conversation.updated_at,
    }
    if include_messages:
        data["messages"] = [
            {
                "id": message.id,
                "role": message.role,
                "text": message.text,
                "type": message.response_type,
                "artifact": message.artifact,
                "created_at": message.created_at,
            }
            for message in conversation.messages.all()
        ]
    return data


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def ai_conversations(request, slug):
    from .models import AIConversation

    course = get_object_or_404(Course, slug=slug, is_published=True)
    if request.method == "POST":
        conversation = AIConversation.objects.create(
            user=request.user,
            course=course,
            title="New conversation",
        )
        return Response(
            _serialize_ai_conversation(conversation, include_messages=True),
            status=status.HTTP_201_CREATED,
        )
    conversations = AIConversation.objects.filter(
        user=request.user, course=course, is_deleted_by_user=False
    )[:50]
    return Response([_serialize_ai_conversation(item) for item in conversations])


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def ai_conversation_detail(request, slug, conversation_id):
    from .models import AIConversation

    conversation = get_object_or_404(
        AIConversation.objects.select_related("course").prefetch_related("messages"),
        id=conversation_id,
        user=request.user,
        course__slug=slug,
    )
    if request.method == "DELETE":
        conversation.is_deleted_by_user = True
        conversation.save(update_fields=["is_deleted_by_user", "updated_at"])
        return Response(status=status.HTTP_204_NO_CONTENT)
    if request.method == "PATCH":
        title = str(request.data.get("title", "")).strip()
        if title:
            conversation.title = title[:160]
            conversation.save(update_fields=["title", "updated_at"])
    return Response(_serialize_ai_conversation(conversation, include_messages=True))


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def course_assistant(request, slug):
    """AI Course Assistant Endpoint."""
    course = get_object_or_404(Course, slug=slug, is_published=True)
    
    # ── Subscription & Daily Quota Checks ─────────────────────
    from .models import UserSubscription, DailyAIUsage
    from django.utils import timezone
    
    from .entitlements import get_ai_entitlement

    entitlement = get_ai_entitlement(request.user)
    is_pro_user = entitlement["is_pro"]
    
    is_enrolled = Enrollment.objects.filter(user=request.user, course=course).exists()
    
    if not request.user.is_staff and not is_enrolled and not is_pro_user:
        return Response({"error": "You must be enrolled or have an active EkebuAI Pro subscription to access the course assistant."}, status=403)
        
    usage = None
    try:
        today = timezone.now().date()
        usage, _ = DailyAIUsage.objects.get_or_create(user=request.user, date=today)
    except Exception as e:
        logger.warning(f"DailyAIUsage lookup error: {e}")
    
    daily_limit = 30 if is_enrolled else 5
    if usage and not is_pro_user and usage.query_count >= daily_limit:
        return Response({
            "type": "pro_required",
            "reply": f"**Daily query limit reached**\n\nYou have used all {daily_limit} free EkebuAI queries available today. An active EkebuAI Pro Pass includes unlimited chats, document exports, and AI image generation.",
            "model_used": "quota-exceeded",
            "limit_reached": True,
            "queries_used": usage.query_count,
            "daily_limit": daily_limit
        })
        
    query = request.data.get("query", "")
    lesson_id = request.data.get("lesson_id")
    video_timestamp = request.data.get("video_timestamp")
    history = request.data.get("history", [])

    query = str(query or "").strip()
    history = history if isinstance(history, list) else []
    
    target_language = request.data.get("language", "eng")
    original_query = query
    
    # PRE-GEMINI TRANSLATION: Local -> English
    if target_language != "eng" and query:
        trans_query = None
        from ekebuai.client import AgentUnavailable, gateway_configured, translate as ekebuai_translate
        if gateway_configured():
            try:
                trans_query = (ekebuai_translate(query, target_language, "eng") or {}).get("text")
            except AgentUnavailable:
                trans_query = None
        if not trans_query:
            from api.sunbird import SunbirdClient
            sunbird = SunbirdClient()
            if target_language == "kum":
                sys_prompt = "You are a professional translator. Translate the following Kumam text to English. Output only the exact English translation without any conversational filler."
                trans_query = sunbird.chat_completion(sys_prompt, query)
            else:
                trans_query = sunbird.translate(query, target_language, "eng")
        if trans_query:
            query = trans_query

    if not query:
        return Response(
            {
                "type": "error",
                "reply": "Please enter a question or describe the image you want.",
                "error_code": "empty_request",
            },
            status=400,
        )

    from .models import AIConversation, AIMessage

    conversation_id = request.data.get("conversation_id")
    conversation = None
    if conversation_id:
        conversation = AIConversation.objects.filter(
            id=conversation_id,
            user=request.user,
            course=course,
            is_archived=False,
        ).first()
    if conversation is None:
        conversation = AIConversation.objects.create(
            user=request.user,
            course=course,
            title=query[:80] or "New conversation",
        )
    AIMessage.objects.create(
        conversation=conversation,
        role=AIMessage.Role.USER,
        text=query,
    )

    import re

    image_request = bool(
        re.search(
            r"\b(generate|create|make|draw|design|produce)\b.{0,45}\b(images?|pictures?|illustrations?|posters?|graphics?|photos?)\b",
            query,
            flags=re.IGNORECASE,
        )
        or re.search(
            r"\b(images?|pictures?|illustrations?|posters?|graphics?|photos?)\b.{0,30}\b(of|showing|for|with)\b",
            query,
            flags=re.IGNORECASE,
        )
    )
    if image_request:
        if not entitlement["capabilities"]["image_generate"]:
            pro_reply = "Image generation is available with an active EkebuAI Pro Pass."
            AIMessage.objects.create(
                conversation=conversation,
                role=AIMessage.Role.ASSISTANT,
                text=pro_reply,
                response_type="pro_required",
            )
            conversation.save(update_fields=["updated_at"])
            return Response(
                {
                    "type": "pro_required",
                    "reply": pro_reply,
                    "limit_reached": True,
                    "conversation_id": str(conversation.id),
                }
            )
        from .ai_tools.images import create_image_artifact

        artifact = create_image_artifact(user=request.user, course=course, prompt=query)
        if artifact.status != artifact.Status.READY:
            error_reply = (
                "I could not create that image right now. Your prompt is safe, "
                "so please try again in a moment."
            )
            AIMessage.objects.create(
                conversation=conversation,
                role=AIMessage.Role.ASSISTANT,
                text=error_reply,
                response_type="error",
            )
            conversation.save(update_fields=["updated_at"])
            return Response(
                {
                    "type": "error",
                    "reply": error_reply,
                    "error_code": "image_generation_failed",
                    "conversation_id": str(conversation.id),
                },
                status=503,
            )
        image_url = request.build_absolute_uri(artifact.image.url)
        image_payload = {
            "id": artifact.pk,
            "url": image_url,
            "download_url": request.build_absolute_uri(
                f"/api/courses/ekebu-ai/images/{artifact.pk}/download/"
            ),
            "prompt": artifact.prompt,
        }
        AIMessage.objects.create(
            conversation=conversation,
            role=AIMessage.Role.ASSISTANT,
            text="Your image is ready.",
            response_type="image",
            artifact=image_payload,
            model_used=artifact.provider_model,
        )
        conversation.save(update_fields=["updated_at"])
        return Response(
            {
                "type": "image",
                "reply": "Your image is ready.",
                "image": image_payload,
                "model_used": artifact.provider_model,
                "conversation_id": str(conversation.id),
            }
        )
    
    context_text = f"Course: {course.title}. "
    if lesson_id:
        lesson = Lesson.objects.filter(id=lesson_id, module__course=course).first()
        if lesson:
            safe_content = lesson.content or ""
            script_text = lesson.video_script or "No explicit narration script uploaded for this video."
            notes_text = lesson.lesson_text or "No separate lesson notes uploaded."
            
            timestamp_str = ""
            if video_timestamp is not None:
                try:
                    ts_num = int(float(video_timestamp))
                    mins = ts_num // 60
                    secs = ts_num % 60
                    timestamp_str = f"Current Video Timestamp: {mins:02d}:{secs:02d} ({ts_num} seconds)."
                except ValueError:
                    timestamp_str = f"Current Video Timestamp: {video_timestamp}."

            context_text += (
                f"\n=== CURRENT LESSON: {lesson.title} ===\n"
                f"{timestamp_str}\n"
                f"Video Narration Script (What Peter speaks in the video):\n{script_text}\n\n"
                f"Lesson Notes:\n{notes_text}\n\n"
                f"Summary Overview:\n{safe_content[:1000]}"
            )

    import requests
    import os
    
    # Fetch user memory - grouped by category for clearer AI context
    from .models import UserMemory
    memories = UserMemory.objects.filter(user=request.user).order_by('category', 'created_at')
    
    memory_sections = {}
    for m in memories:
        label = dict(UserMemory.CATEGORY_CHOICES).get(m.category, 'General')
        memory_sections.setdefault(label, []).append(m.fact)
    
    memory_text = ""
    if memory_sections:
        for section, facts in memory_sections.items():
            memory_text += f"\n  {section}:\n"
            for f in facts:
                memory_text += f"    - {f}\n"
    else:
        memory_text = "  (No memories yet - this is a new student.)"
    
    from .utils import user_display_name
    student_name = user_display_name(request.user)
    first_name = (request.user.first_name or "").strip() or student_name.split()[0]

    prompt_text = (
        f"You are EkebuAI, the digital teaching assistant and highly intelligent AI clone of Peter Gordon Ekebu. "
        f"You are currently mentoring and assisting your student, {student_name} (preferred first name: {first_name}), in the course '{course.title}'.\n"
        f"Your tone is warm, personal, highly encouraging, and professional with a distinct touch of friendly humor. "
        f"Always address {first_name} warmly by their name throughout your conversations (e.g. 'Hey {first_name}!', 'Great question, {first_name}!', 'Let us break this down together, {first_name}'). Speak naturally and humanely like a passionate, caring mentor rather than a robotic generic system.\n\n"
        f"If anyone asks about you or Peter, you know the following facts very well: "
        f"Peter studied for a Bachelor of Information and Communication Technology at Gulu University (2019-2023), "
        f"and is currently pursuing a Master in Instructional Design and Technology at Makerere University (2025-Present). "
        f"He currently works as an ICT Teacher and IT Specialist at Orel Vine International School - Mukono.\n\n"
        
        f"=== YOUR LONG-TERM MEMORY ABOUT THIS STUDENT ({student_name}) ===\n{memory_text}\n"
        f"=== END MEMORY ===\n\n"
        
        f"Context for the current lesson:\n{context_text}\n\n"
        
        "INSTRUCTIONS:\n"
        f"1. PERSONALIZE & HUMANAIZE: Call {first_name} by their name naturally. Never break character. Never use robotic phrases like 'As an AI language model...' or 'I am an AI...'. Converse like a passionate, real human mentor who genuinely cares about {first_name}'s growth and mastery.\n"
        f"2. AGE AWARENESS: Pay close attention to the course title '{course.title}'. If the course targets young children (e.g., 'Ages 6-8', 'Ages 8-10'), use extremely simple vocabulary, fun engaging analogies, and high enthusiasm. If it targets teens or adults (e.g., 'A Level', 'Teachers', 'Advanced'), use a mature, academic, and professional tone.\n"
        "3. PEDAGOGY: Act as a true teacher. Provide a direct, helpful answer first, and then optionally offer a practical, real-world example to explain complex topics.\n"
        f"4. EMPATHY & ENCOURAGEMENT: If {first_name} is stuck or frustrated, validate their feelings first (e.g. 'I know this concept can be really tricky, {first_name}, but let us break it down together.'). Always celebrate their curiosity and progress!\n"
        "5. Use the provided context to answer course-related questions. If it's a general question about Peter, use your persona knowledge.\n"
        "6. IMPORTANT: The user already knows who you are. DO NOT give generic robotic introductions (e.g. do not say 'Hi, I am EkebuAI'). Greet them personally and answer directly.\n"
        "7. TOOL USE: If the user asks for an Excel spreadsheet or Word document, use the matching function immediately. Image requests are handled by the image pipeline. Never claim that a file or image was created unless a tool result confirms it.\n"
        "8. MEMORY: If the user shares personal info, a preference, a goal, or mentions something they struggle with, use the remember_fact tool to save it. "
        "Choose the most appropriate category. Do NOT remember trivial conversational things like 'they said hello'. Only remember meaningful facts.\n"
        f"9. Use your memory to personalize responses. For example, if you know {first_name} struggles with loops, give them extra support on loop-related topics.\n"
        "10. RESPONSE QUALITY: Always return a complete, direct response. Never output undefined, null, raw tool arguments, placeholder text, or an empty answer. If information is missing, ask one concise clarifying question.\n"
        "11. FORMATTING: Never use em dashes (the long dash character). Use regular hyphens (-) or commas instead. Feel free to use appropriate emojis to make the conversation friendlier!\n"
        "12. AVOID HALLUCINATIONS: If the user's prompt is ambiguous, confusing, or seems to lack context (especially if it was translated from a local language), DO NOT hallucinate an answer. Instead, explicitly ask the user to clarify or rephrase their question.\n"
    )
    
    api_key = (
        os.environ.get("GEMINI_API_KEY")
        or os.environ.get("GEMINI_API_KEY_LOCAL")
        or os.environ.get("GOOGLE_API_KEY")
        or os.environ.get("GEMINI_KEY")
        or ""
    ).strip()
    groq_key = (
        os.environ.get("GROQ_API_KEY")
        or os.environ.get("GROQ_API_KEY_LOCAL")
        or ""
    ).strip()
    
    # ── Helper: call Gemini ──────────────────────────────────
    def call_gemini():
        import logging
        from .ai_tools.gemini_quota import (
            MAX_HTTP_CALLS,
            QUOTA_USER_MESSAGE,
            is_quota_error,
            is_quota_tripped,
            trip_quota,
        )
        logger = logging.getLogger(__name__)
        
        if not api_key:
            logger.warning("GEMINI: No API key configured, skipping.")
            return None, "AI service is temporarily unavailable. Please try again later."

        if is_quota_tripped():
            logger.warning("GEMINI: Skipping call; quota circuit breaker is open.")
            return None, QUOTA_USER_MESSAGE
            
        gemini_contents = []
        for h in history:
            content_text = (h.get("content") or "").strip()
            if not content_text:
                continue
            role = "model" if h.get("role") in ["assistant", "model"] else "user"
            
            # Gemini API requires strictly alternating roles (user <-> model)
            if gemini_contents and gemini_contents[-1]["role"] == role:
                gemini_contents[-1]["parts"][0]["text"] += f"\n\n{content_text}"
            else:
                gemini_contents.append({
                    "role": role,
                    "parts": [{"text": content_text}]
                })

        # Ensure history starts with 'user' role
        if gemini_contents and gemini_contents[0]["role"] != "user":
            gemini_contents.pop(0)

        # Append current user query
        if gemini_contents and gemini_contents[-1]["role"] == "user":
            gemini_contents[-1]["parts"][0]["text"] += f"\n\n{query}"
        else:
            gemini_contents.append({"role": "user", "parts": [{"text": query}]})

        base_payload = {
            "systemInstruction": {"parts": [{"text": prompt_text}]},
            "contents": gemini_contents,
        }

        full_payload = {
            **base_payload,
            "tools": [
                {
                    "functionDeclarations": [
                        {
                            "name": "generate_spreadsheet",
                            "description": "Generates a downloadable Excel (.xlsx) spreadsheet for the user.",
                            "parameters": {
                                "type": "OBJECT",
                                "properties": {
                                    "title": {"type": "STRING", "description": "The title of the spreadsheet."},
                                    "rows": {"type": "ARRAY", "items": {"type": "ARRAY", "items": {"type": "STRING"}}, "description": "The data rows, first row is header."}
                                },
                                "required": ["title", "rows"]
                            }
                        },
                        {
                            "name": "generate_document",
                            "description": "Generates a downloadable Word (.docx) document for the user.",
                            "parameters": {
                                "type": "OBJECT",
                                "properties": {
                                    "title": {"type": "STRING", "description": "The title of the document."},
                                    "content": {"type": "STRING", "description": "The text content, newlines separate paragraphs."}
                                },
                                "required": ["title", "content"]
                            }
                        },
                        {
                            "name": "generate_image",
                            "description": "Generates an image for the user based on a prompt and displays it in the chat.",
                            "parameters": {
                                "type": "OBJECT",
                                "properties": {
                                    "prompt": {"type": "STRING", "description": "A detailed prompt for generating the image."}
                                },
                                "required": ["prompt"]
                            }
                        },
                        {
                            "name": "remember_fact",
                            "description": "Saves a meaningful fact, preference, goal, or struggle area about the student to long-term memory.",
                            "parameters": {
                                "type": "OBJECT",
                                "properties": {
                                    "fact": {"type": "STRING", "description": "The fact to remember."},
                                    "category": {
                                        "type": "STRING",
                                        "enum": ["preference", "personal", "academic", "goal", "struggle", "general"],
                                        "description": "Category: preference, personal, academic, goal, struggle, or general."
                                    }
                                },
                                "required": ["fact", "category"]
                            }
                        }
                    ]
                }
            ]
        }
        
        http_calls = 0
        last_error = "AI service is temporarily unavailable."

        def post_gemini(url, headers, json_payload, label):
            nonlocal http_calls, last_error
            if is_quota_tripped() or http_calls >= MAX_HTTP_CALLS:
                if is_quota_tripped():
                    last_error = QUOTA_USER_MESSAGE
                return None
            http_calls += 1
            logger.info(f"GEMINI ({label}): Attempting request {http_calls}/{MAX_HTTP_CALLS}")
            resp = requests.post(url, headers=headers, json=json_payload, timeout=45)
            body = resp.text[:400] if resp.text else ""
            logger.info(f"GEMINI ({label}): Status {resp.status_code}")
            if is_quota_error(resp.status_code, body):
                trip_quota()
                last_error = QUOTA_USER_MESSAGE
                logger.warning(f"GEMINI ({label}): quota exhausted; opening circuit breaker.")
                return None
            return resp

        # Attempt Google's OpenAI-compatible endpoint (specifically for new AQ.Ab... Bearer keys)
        for model in ["gemini-2.0-flash", "gemini-2.5-flash"]:
            if is_quota_tripped() or http_calls >= MAX_HTTP_CALLS:
                break
            try:
                oai_url = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
                oai_headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_key}"
                }
                oai_messages = [{"role": "system", "content": prompt_text}]
                for h in history:
                    c = (h.get("content") or "").strip()
                    if c:
                        r = "assistant" if h.get("role") in ["assistant", "model"] else "user"
                        oai_messages.append({"role": r, "content": c})
                oai_messages.append({"role": "user", "content": query})
                
                oai_payload = {
                    "model": model,
                    "messages": oai_messages
                }
                
                resp = post_gemini(oai_url, oai_headers, oai_payload, f"openai-{model}")
                if resp is None:
                    if is_quota_tripped():
                        return None, last_error
                    continue
                if resp.status_code == 200:
                    data = resp.json()
                    choices = data.get("choices") or []
                    text = (
                        (choices[0].get("message") or {}).get("content", "")
                        if choices
                        else ""
                    )
                    if text:
                        logger.info(f"GEMINI OpenAI-Endpoint: SUCCESS with {model}")
                        return {"candidates": [{"content": {"parts": [{"text": text}]}}]}, f"openai-{model}"
                else:
                    last_error = f"AI service error ({resp.status_code}). Please try again later."
                    logger.warning(f"GEMINI OpenAI-Endpoint ({model}): {resp.status_code} - {resp.text[:200]}")
            except Exception as e:
                last_error = "AI service encountered an error. Please try again later."
                logger.error(f"GEMINI OpenAI-Endpoint exception ({model}): {e}")

        models_to_try = ["gemini-flash-latest", "gemini-2.5-flash", "gemini-2.0-flash"]
        auth_configs = [
            {"label": "X-goog-api-key", "url_suffix": "", "headers": {"Content-Type": "application/json", "X-goog-api-key": api_key}},
            {"label": "query-param", "url_suffix": f"?key={api_key}", "headers": {"Content-Type": "application/json"}},
        ]
        
        for model in models_to_try:
            if is_quota_tripped() or http_calls >= MAX_HTTP_CALLS:
                break
            for auth in auth_configs:
                if is_quota_tripped() or http_calls >= MAX_HTTP_CALLS:
                    break
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent{auth['url_suffix']}"
                for payload_option in [full_payload, base_payload]:
                    if is_quota_tripped() or http_calls >= MAX_HTTP_CALLS:
                        break
                    try:
                        resp = post_gemini(
                            url, auth["headers"], payload_option, f"{model}/{auth['label']}"
                        )
                        if resp is None:
                            if is_quota_tripped():
                                return None, last_error
                            continue
                        if resp.status_code == 200:
                            logger.info(f"GEMINI: SUCCESS with {model} ({auth['label']})")
                            return resp.json(), model
                        last_error = f"AI service error ({resp.status_code}). Please try again later."
                        logger.error(f"GEMINI ({model}/{auth['label']}): Error {resp.status_code}: {resp.text[:200]}")
                        if resp.status_code in (401, 403):
                            break
                    except Exception as e:
                        last_error = "AI service encountered an error. Please try again later."
                        logger.error(f"GEMINI ({model}/{auth['label']}): Exception: {e}")
        
        logger.error(f"GEMINI: All Gemini requests failed ({last_error}). API key configured: {'YES' if api_key else 'NO'}")
        return None, last_error
    
    # ── Helper: call Groq (fallback) ─────────────────────────
    def call_groq():
        from .ai_tools.groq_chat import complete_chat

        return complete_chat(
            api_key=groq_key,
            system_prompt=prompt_text,
            history=history,
            query=query,
        )
    
    # ── Helper: process Gemini function calls ────────────────
    def process_gemini_response(data):
        candidates = data.get("candidates") or []
        parts = (
            ((candidates[0].get("content") or {}).get("parts") or [])
            if candidates
            else []
        )
        reply = ""
        memories_saved = 0
        
        for part in parts:
            if not isinstance(part, dict):
                continue
            if isinstance(part.get("text"), str):
                reply += part["text"]
            elif "functionCall" in part:
                function_call = part["functionCall"] or {}
                name = function_call.get("name")
                args = function_call.get("args", {})
                if not isinstance(args, dict):
                    args = {}
                
                if name in ["generate_spreadsheet", "generate_document", "generate_image"] and not is_pro_user:
                    reply += f"\n\n**EkebuAI Pro feature**\n\n{name.replace('_', ' ').capitalize()} requires an active EkebuAI Pro Pass.\n"
                    continue

                if name == "generate_spreadsheet":
                    from .ai_tools.artifacts import build_excel
                    dl_url = build_excel(args.get("title", "Spreadsheet"), args.get("rows", []))
                    if dl_url:
                        reply += f"\n\nI have created the spreadsheet for you! [Download Excel Spreadsheet]({dl_url})\n"
                    else:
                        reply += "\n\nSorry, I failed to create the spreadsheet.\n"
                
                elif name == "generate_document":
                    from .ai_tools.artifacts import build_word
                    dl_url = build_word(args.get("title", "Document"), args.get("content", ""))
                    if dl_url:
                        reply += f"\n\nI have created the document for you! [Download Word Document]({dl_url})\n"
                    else:
                        reply += "\n\nSorry, I failed to create the document.\n"
                        
                elif name == "generate_image":
                    img_prompt = args.get("prompt", "")
                    import urllib.parse
                    encoded_prompt = urllib.parse.quote(img_prompt)
                    image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=800&height=600&nologo=true"
                    reply += f"\n\nHere is your generated image:\n\n![{img_prompt}]({image_url})\n"
                
                elif name == "remember_fact":
                    fact = args.get("fact", "")
                    category = args.get("category", "general")
                    if fact:
                        UserMemory.add_memory(
                            user=request.user,
                            fact=fact,
                            category=category,
                            course=course
                        )
                        memories_saved += 1
        
        if not reply and memories_saved > 0:
            reply = "Got it. I will remember that for our future conversations."
        
        return reply
    
    # ── Main execution: droplet gateway, then Gemini/Groq fallback ──────────
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        reply = ""
        model_used = "unknown"
        gateway_ok = False

        logger.info(
            f"AI Assistant: query='{query[:80]}', gemini_key={'YES' if api_key else 'NO'}, groq_key={'YES' if groq_key else 'NO'}"
        )
        from ekebuai.client import (
            AgentUnavailable,
            chat as ekebuai_chat,
            gateway_configured,
            translate as ekebuai_translate,
        )
        if gateway_configured():
            messages = [{"role": "system", "content": prompt_text}]
            for h in history:
                content_text = (h.get("content") or "").strip()
                if not content_text:
                    continue
                role = "assistant" if h.get("role") in ["assistant", "model"] else "user"
                messages.append({"role": role, "content": content_text})
            messages.append({"role": "user", "content": query})
            try:
                from .ai_tools.groq_chat import groq_tools
                result = ekebuai_chat(messages, tools=groq_tools())
                parts = []
                if result.get("text"):
                    parts.append({"text": result["text"]})
                for tc in result.get("tool_calls") or []:
                    parts.append({"functionCall": {"name": tc.get("name"), "args": tc.get("args") or {}}})
                gemini_data = {"candidates": [{"content": {"parts": parts or [{"text": ""}]}}]}
                reply = process_gemini_response(gemini_data)
                model_used = result.get("model") or "ekebuai-gateway"
                gateway_ok = True
            except AgentUnavailable as e:
                logger.error("EkebuAI gateway unavailable: %s", e)
                return Response(
                    {
                        "type": "error",
                        "reply": "EkebuAI is restarting. Please try again in a moment.",
                        "error_code": "agent_unavailable",
                        "conversation_id": str(conversation.id),
                    },
                    status=503,
                )

        if not gateway_ok:
            gemini_data, result_or_error = call_gemini()
            if gemini_data is not None:
                logger.info(f"AI Assistant: Using Gemini response ({result_or_error})")
                reply = process_gemini_response(gemini_data)
                model_used = result_or_error
            else:
                logger.info(
                    f"AI Assistant: Gemini unavailable, falling back to Groq ({result_or_error})"
                )
                groq_data, groq_result = call_groq()
                if groq_data is not None:
                    logger.info(f"AI Assistant: Using Groq response ({groq_result})")
                    reply = process_gemini_response(groq_data)
                    model_used = groq_result
                else:
                    logger.error(
                        f"AI Assistant: Gemini and Groq failed ({result_or_error} / {groq_result})."
                    )
                    reply = f"**EkebuAI is temporarily unavailable.** {result_or_error}\n\nPlease try again in a moment."
                    model_used = "ai-error"

        if model_used != "ai-error" and usage and not request.user.is_staff:
            try:
                usage.query_count += 1
                usage.save()
            except Exception as usage_e:
                logger.warning(f"Failed to increment usage: {usage_e}")
        
        if not isinstance(reply, str) or not reply.strip() or reply.strip().lower() in {
            "undefined",
            "null",
            "none",
        }:
            reply = "I could not form a complete response. Please rephrase your request and try again."

        reply = re.sub(r"\n{3,}", "\n\n", reply).strip()
        if not reply:
            reply = "I could not form a complete response. Please rephrase your request and try again."
        
        # Strip em dashes from reply
        reply = reply.replace('\u2014', '-').replace('\u2013', '-')
        
        # POST-GEMINI TRANSLATION: English -> Local
        translated_reply = reply
        if target_language != "eng" and reply:
            trans_reply = None
            from ekebuai.client import AgentUnavailable, gateway_configured, translate as ekebuai_translate
            if gateway_configured():
                try:
                    trans_reply = (ekebuai_translate(reply, "eng", target_language) or {}).get("text")
                except AgentUnavailable:
                    trans_reply = None
            if not trans_reply:
                from api.sunbird import SunbirdClient
                sunbird = SunbirdClient()
                if target_language == "kum":
                    sys_prompt = "You are a professional translator. Translate the following English text to Kumam. Output only the exact Kumam translation without any conversational filler."
                    trans_reply = sunbird.chat_completion(sys_prompt, reply)
                else:
                    trans_reply = sunbird.translate(reply, "eng", target_language)
            if trans_reply:
                translated_reply = trans_reply

        # --- SAVE TO CHAT LOG ---
        from .models import ChatLog, DataCollectionItem
        try:
            ChatLog.objects.create(
                user=request.user,
                course=course,
                lesson_id=lesson_id,
                query=original_query,
                response=translated_reply,
                model_used=model_used
            )
        except Exception as log_e:
            logger.error(f"Failed to save ChatLog: {log_e}")
            
        if target_language != "eng":
            try:
                DataCollectionItem.objects.create(
                    user=request.user,
                    data_source=DataCollectionItem.DataSource.ASSISTANT_CHAT,
                    data_type=DataCollectionItem.DataType.TEXT_ONLY,
                    source_language=target_language,
                    original_text=original_query,
                    translated_prompt=query,
                    ai_response_candidate_1=reply,
                    context_metadata={"course": course.slug}
                )
            except Exception as e:
                logger.error(f"Failed to save DataCollectionItem: {e}")
            
        AIMessage.objects.create(
            conversation=conversation,
            role=AIMessage.Role.ASSISTANT,
            text=translated_reply,
            response_type="text",
            model_used=model_used,
        )
        conversation.save(update_fields=["updated_at"])
        return Response(
            {
                "type": "text",
                "reply": translated_reply,
                "model_used": model_used,
                "conversation_id": str(conversation.id),
            }
        )
        
    except Exception as e:
        logger.error(f"AI Assistant Error: {e}", exc_info=True)
        return Response(
            {
                "type": "error",
                "reply": "EkebuAI could not complete that request. Please try again in a moment.",
                "error_code": "assistant_unavailable",
            },
            status=503,
        )


def _serialize_ai_image(request, artifact):
    return {
        "id": artifact.pk,
        "url": request.build_absolute_uri(artifact.image.url) if artifact.image else "",
        "download_url": request.build_absolute_uri(
            f"/api/courses/ekebu-ai/images/{artifact.pk}/download/"
        ),
        "prompt": artifact.prompt,
        "edit_instruction": artifact.edit_instruction,
        "parent_id": artifact.parent_id,
        "created_at": artifact.created_at.isoformat(),
    }


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def edit_ai_image(request, image_id):
    from .ai_tools.images import create_image_artifact
    from .entitlements import get_ai_entitlement
    from .models import AIImageArtifact

    entitlement = get_ai_entitlement(request.user)
    if not entitlement["capabilities"]["image_edit"]:
        return Response(
            {"type": "pro_required", "reply": "Image editing requires an active EkebuAI Pro Pass."},
            status=403,
        )
    source = get_object_or_404(
        AIImageArtifact,
        pk=image_id,
        user=request.user,
        status=AIImageArtifact.Status.READY,
    )
    instruction = str(request.data.get("instruction") or "").strip()
    if not instruction:
        return Response(
            {"type": "error", "reply": "Describe what you want changed."},
            status=400,
        )
    edited = create_image_artifact(
        user=request.user,
        course=source.course,
        parent=source,
        prompt=source.prompt,
        instruction=instruction,
    )
    if edited.status != edited.Status.READY:
        return Response(
            {
                "type": "error",
                "reply": "I could not edit that image right now. Please try again.",
                "error_code": "image_edit_failed",
            },
            status=503,
        )
    return Response(
        {"type": "image", "reply": "Your edited image is ready.", "image": _serialize_ai_image(request, edited)}
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def download_ai_image(request, image_id):
    from django.http import FileResponse
    from django.utils.text import slugify
    from .models import AIImageArtifact

    artifact = get_object_or_404(
        AIImageArtifact,
        pk=image_id,
        user=request.user,
        status=AIImageArtifact.Status.READY,
    )
    extension = "jpg" if artifact.mime_type == "image/jpeg" else "png"
    filename = f"ekebuai-{slugify(artifact.prompt)[:50] or 'image'}-{artifact.pk}.{extension}"
    return FileResponse(
        artifact.image.open("rb"),
        as_attachment=True,
        filename=filename,
        content_type=artifact.mime_type,
    )


class CourseReviewListView(generics.ListAPIView):
    """Paginated list of reviews for a course."""

    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        slug = self.kwargs.get("slug")
        return Review.objects.filter(course__slug=slug, is_approved=True)

def check_certificate_pdf_exists(cert):
    """Check if the certificate PDF file actually exists in storage (S3/Local)."""
    if not cert.pdf_file:
        return False
    try:
        return cert.pdf_file.storage.exists(cert.pdf_file.name)
    except Exception:
        return False

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_certificates(request):
    """List all certificates earned by the authenticated user."""
    from .models import Certificate
    from .pdf_generator import generate_certificate_pdf
    from django.core.files.base import ContentFile
    import logging

    certs = Certificate.objects.filter(user=request.user).select_related("course", "module")
    data = []
    for c in certs:
        if not c.is_approved:
            c.is_approved = True
            c.save()

        if not check_certificate_pdf_exists(c):
            try:
                pdf_content_file = generate_certificate_pdf(
                    user=c.user,
                    course=c.course,
                    uuid_str=str(c.uuid),
                    name_on_certificate=c.name_on_certificate,
                    module=c.module
                )
                if pdf_content_file:
                    filename = f"certificate_{c.uuid}.pdf"
                    c.pdf_file.save(filename, pdf_content_file, save=True)
            except Exception as e:
                logging.getLogger(__name__).error(f"Error auto-generating PDF for cert {c.uuid}: {e}")

        pdf_url = f"/api/courses/certificates/download/{c.uuid}/"

        data.append({
            "uuid": str(c.uuid),
            "course_title": c.course.title,
            "module_title": c.module.title if c.module else None,
            "course_slug": c.course.slug,
            "issued_at": c.issued_at,
            "is_approved": c.is_approved,
            "pdf_url": pdf_url,
        })
    return Response(data)

@api_view(["GET"])
@permission_classes([AllowAny])
@xframe_options_exempt
def download_certificate_pdf(request, uuid_str):
    """Serve certificate PDF dynamically, regenerating if missing from S3/storage."""
    from .models import Certificate
    from .pdf_generator import generate_certificate_pdf
    from django.http import HttpResponse
    from django.core.files.base import ContentFile
    from django.views.decorators.clickjacking import xframe_options_exempt

    cert = get_object_or_404(Certificate, uuid=uuid_str)
    
    pdf_bytes = None
    if check_certificate_pdf_exists(cert):
        try:
            pdf_bytes = cert.pdf_file.read()
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Storage read error for cert {uuid_str}: {e}")

    if not pdf_bytes:
        try:
            pdf_content_file = generate_certificate_pdf(
                user=cert.user,
                course=cert.course,
                uuid_str=str(cert.uuid),
                name_on_certificate=cert.name_on_certificate,
                module=cert.module
            )
            if pdf_content_file:
                try:
                    filename = f"certificate_{cert.uuid}.pdf"
                    cert.pdf_file.save(filename, pdf_content_file, save=True)
                    pdf_bytes = cert.pdf_file.read()
                except Exception as e:
                    import logging
                    logging.getLogger(__name__).error(f"Failed to save generated cert PDF to storage: {e}")
                    pdf_content_file.seek(0)
                    pdf_bytes = pdf_content_file.read()
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Error generating PDF for certificate {cert.uuid}: {e}")

    if not pdf_bytes:
        # Fallback PDF if generation completely failed
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import landscape, A4
        from io import BytesIO
        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize=landscape(A4))
        c.setFont("Helvetica-Bold", 24)
        c.drawCentredString(landscape(A4)[0] / 2.0, landscape(A4)[1] / 2.0, "Certificate not available yet.")
        c.setFont("Helvetica", 16)
        c.drawCentredString(landscape(A4)[0] / 2.0, landscape(A4)[1] / 2.0 - 40, "Please check back later or contact support.")
        c.showPage()
        c.save()
        pdf_bytes = buffer.getvalue()

    response = HttpResponse(pdf_bytes, content_type="application/pdf")
    response["Content-Disposition"] = f'inline; filename="certificate_{cert.uuid}.pdf"'
    return response

@api_view(["GET"])
@permission_classes([AllowAny])
def verify_certificate(request, uuid_str):
    """Public endpoint to verify a certificate's authenticity."""
    from .models import Certificate
    cert = get_object_or_404(Certificate, uuid=uuid_str)
    return Response({
        "valid": True,
        "uuid": str(cert.uuid),
        "user_name": cert.name_on_certificate or f"{cert.user.first_name} {cert.user.last_name}".strip() or cert.user.username,
        "course_title": cert.course.title,
        "issued_at": cert.issued_at,
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def claim_certificate(request, slug):
    """Claim a certificate with a specific name after reaching 100% completion (or module completion)."""
    from .models import Course, Enrollment, Certificate, Module
    from .pdf_generator import generate_certificate_pdf
    from django.core.files.base import ContentFile
    import logging

    course = get_object_or_404(Course, slug=slug, is_published=True)
    enrollment = Enrollment.objects.filter(user=request.user, course=course).first()
    
    if not enrollment:
        return Response({"error": "Not enrolled."}, status=status.HTTP_400_BAD_REQUEST)

    module_id = request.GET.get("module_id")
    module_obj = None

    if module_id:
        module_obj = get_object_or_404(Module, id=module_id, course=course)
        # Require every lesson in the term, including weeks still hidden from students.
        module_lessons = set(module_obj.lessons.values_list("id", flat=True))
        completed = set(enrollment.completed_lessons.values_list("id", flat=True))
        if not module_lessons or not module_lessons.issubset(completed):
            return Response(
                {
                    "error": (
                        "This term is not finished yet. Complete every week in the term "
                        "(including weeks the instructor has not opened yet) before claiming."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
    else:
        total = course.total_lessons
        done = enrollment.completed_lessons.filter(module__course=course).count()
        if total == 0 or done < total:
            return Response(
                {"error": "Course not completed. Finish every lesson before claiming."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
    name_on_certificate = request.data.get("name_on_certificate", "").strip()
    if not name_on_certificate:
        name_on_certificate = f"{request.user.first_name} {request.user.last_name}".strip() or request.user.username
        
    cert = Certificate.objects.filter(user=request.user, course=course, module=module_obj).first()
    if not cert:
        cert = Certificate(
            user=request.user,
            course=course,
            module=module_obj,
            name_on_certificate=name_on_certificate,
            is_approved=True
        )
        cert.save()
    else:
        cert.name_on_certificate = name_on_certificate
        cert.is_approved = True
        cert.save()

    # Generate PDF if missing from storage
    if not check_certificate_pdf_exists(cert):
        try:
            pdf_content_file = generate_certificate_pdf(
                user=cert.user,
                course=cert.course,
                uuid_str=str(cert.uuid),
                name_on_certificate=cert.name_on_certificate,
                module=cert.module
            )
            if pdf_content_file:
                filename = f"certificate_{cert.uuid}.pdf"
                cert.pdf_file.save(filename, pdf_content_file, save=True)
        except Exception as e:
            logging.getLogger(__name__).error(f"Error generating PDF for certificate {cert.uuid}: {e}")

    certificate_url = f"/api/courses/certificates/download/{cert.uuid}/"
    return Response({
        "certificate_url": certificate_url,
        "uuid": str(cert.uuid),
        "is_approved": cert.is_approved,
        "message": "Certificate issued successfully!"
    })

class CurrencyListView(generics.ListAPIView):
    """List all active currencies and their exchange rates."""
    serializer_class = CurrencySerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        return Currency.objects.filter(is_active=True)

    def list(self, request, *args, **kwargs):
        from django.utils import timezone
        from datetime import timedelta
        import logging

        logger = logging.getLogger(__name__)

        active_currencies = self.get_queryset()

        if active_currencies.exists():
            first_currency = active_currencies.first()
            # If the rates are older than 12 hours, attempt a silent background sync
            if first_currency.updated_at and (timezone.now() - first_currency.updated_at > timedelta(hours=12)):
                try:
                    import requests
                    response = requests.get("https://open.er-api.com/v6/latest/UGX", timeout=5)
                    if response.status_code == 200:
                        data = response.json()
                        if data.get("result") == "success":
                            rates = data.get("rates", {})
                            for currency in active_currencies:
                                if currency.code in rates:
                                    currency.exchange_rate_to_ugx = rates[currency.code]
                                    currency.save(update_fields=['exchange_rate_to_ugx', 'updated_at'])
                except Exception as e:
                    logger.warning(f"Failed to fetch live exchange rates: {e}")
        
        return super().list(request, *args, **kwargs)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_quiz(request, slug, quiz_id):
    from .models import Quiz
    from .serializers import QuizSerializer
    course = get_object_or_404(Course, slug=slug, is_published=True)
    if not request.user.is_staff and not Enrollment.objects.filter(user=request.user, course=course).exists():
        return Response({"error": "Not enrolled"}, status=403)
        
    from django.db.models import Q
    quiz = get_object_or_404(Quiz, Q(id=quiz_id) & (Q(module__course=course) | Q(lesson__module__course=course)))
    if not quiz_is_visible_to_user(quiz, request.user):
        return Response(
            {"error": "This quiz is hidden. You cannot open it yet."},
            status=status.HTTP_403_FORBIDDEN,
        )
    serializer = QuizSerializer(quiz)
    return Response(serializer.data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def submit_quiz(request, slug, quiz_id):
    from .models import Quiz, QuizAttempt, Question, Choice, UserXP
    try:
        course = get_object_or_404(Course, slug=slug, is_published=True)
        if not request.user.is_staff and not Enrollment.objects.filter(user=request.user, course=course).exists():
            return Response({"error": "Not enrolled"}, status=403)

        from django.db.models import Q
        quiz = get_object_or_404(Quiz, Q(id=quiz_id) & (Q(module__course=course) | Q(lesson__module__course=course)))
        if not quiz_is_visible_to_user(quiz, request.user):
            return Response(
                {"error": "This quiz is hidden. You cannot submit it yet."},
                status=status.HTTP_403_FORBIDDEN,
            )
        answers = request.data.get("answers", {}) # dict of question_id: choice_id
        if not isinstance(answers, dict):
            return Response(
                {"detail": "Answers must be submitted as question and choice IDs."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        questions = quiz.questions.prefetch_related("choices").all()
        question_ids = {str(question.id) for question in questions}
        unknown_questions = set(map(str, answers.keys())) - question_ids
        if unknown_questions:
            return Response(
                {"detail": "One or more submitted questions do not belong to this quiz."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        for question in questions:
            choice_id = answers.get(str(question.id))
            if choice_id is not None and not question.choices.filter(id=choice_id).exists():
                return Response(
                    {
                        "detail": (
                            f"The selected answer for question {question.id} is invalid."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
        total_points = sum(q.points for q in questions)
        earned_points = 0

        correct_answers = {}
        explanations = {}

        for q in questions:
            explanations[str(q.id)] = q.explanation
            correct_choice = q.choices.filter(is_correct=True).first()
            if correct_choice:
                correct_answers[str(q.id)] = correct_choice.id
                user_choice_id = answers.get(str(q.id))
                if user_choice_id and str(user_choice_id) == str(correct_choice.id):
                    earned_points += q.points

        score_percentage = int((earned_points / total_points * 100)) if total_points > 0 else 0
        passed = score_percentage >= quiz.passing_score

        # Calculate previous attempts count for tiered XP allocation
        from .xp_rules import quiz_xp_for_pass_attempt

        previous_attempts_count = QuizAttempt.objects.filter(user=request.user, quiz=quiz).count()
        has_passed_previously = QuizAttempt.objects.filter(user=request.user, quiz=quiz, passed=True).exists()

        # Determine student's cohort for cohort-isolated XP tracking
        cohort_id = request.data.get("cohort_id") if isinstance(request.data, dict) else None
        cohort = None
        if cohort_id:
            cohort = request.user.enrolled_cohorts.filter(id=cohort_id, course=course).first()
        if not cohort:
            cohort = request.user.enrolled_cohorts.filter(course=course).first()

        # Check for active cohort team or pairing
        from .models import LessonPairing, CohortTeam
        pairing = None
        cohort_team = None

        if cohort:
            cohort_team = CohortTeam.objects.filter(cohort=cohort, students=request.user).first()
        if not cohort_team:
            cohort_team = CohortTeam.objects.filter(cohort__course=course, students=request.user).first()

        if quiz.lesson:
            pairing = LessonPairing.objects.filter(
                lesson=quiz.lesson,
                is_active=True
            ).filter(Q(host_student=request.user) | Q(partner_student=request.user)).first()

        is_group_work = bool(cohort_team or pairing)

        xp_awarded = 0
        attempt_tier = "retake"

        if passed and not has_passed_previously:
            base_xp = quiz_xp_for_pass_attempt(quiz.points_reward, previous_attempts_count)
            # +20% Collaboration XP bonus when actively paired or in a team
            xp_awarded = int(round(base_xp * 1.20)) if is_group_work else base_xp

            if previous_attempts_count == 0:
                attempt_tier = "1st_attempt"
            elif previous_attempts_count == 1:
                attempt_tier = "2nd_attempt"
            elif previous_attempts_count == 2:
                attempt_tier = "3rd_attempt"
            else:
                attempt_tier = "retake"

            if xp_awarded:
                from .xp_utils import get_or_create_course_xp
                target_user_cohort = cohort_team.cohort if cohort_team else cohort
                user_xp = get_or_create_course_xp(request.user, course, cohort=target_user_cohort)
                user_xp.total_xp += xp_awarded
                user_xp.save(update_fields=["total_xp"])

        attempt = QuizAttempt.objects.create(
            user=request.user,
            quiz=quiz,
            score=score_percentage,
            passed=passed,
            answers=answers,
            xp_awarded=xp_awarded
        )

        # Handle team and pair collaboration duplication for Quiz
        collaborators = set()
        if cohort_team:
            for s in cohort_team.students.exclude(id=request.user.id):
                collaborators.add(s)
        elif pairing:
            partner = pairing.partner_student if pairing.host_student == request.user else pairing.host_student
            if partner and partner != request.user:
                collaborators.add(partner)

        for collaborator in collaborators:
            collab_passed_before = QuizAttempt.objects.filter(
                user=collaborator, quiz=quiz, passed=True
            ).exclude(id=attempt.id).exists()
            collab_prev_count = QuizAttempt.objects.filter(user=collaborator, quiz=quiz).exclude(id=attempt.id).count()
            collab_xp_awarded = 0
            if passed and not collab_passed_before:
                collab_base_xp = quiz_xp_for_pass_attempt(
                    quiz.points_reward, collab_prev_count
                )
                collab_xp_awarded = int(round(collab_base_xp * 1.20))
            QuizAttempt.objects.create(
                user=collaborator,
                quiz=quiz,
                score=score_percentage,
                passed=passed,
                answers=answers,
                xp_awarded=collab_xp_awarded
            )
            if collab_xp_awarded:
                from .xp_utils import get_or_create_course_xp
                target_team_cohort = cohort_team.cohort if cohort_team else cohort
                collab_cohort = target_team_cohort if (target_team_cohort and collaborator.enrolled_cohorts.filter(id=target_team_cohort.id).exists()) else collaborator.enrolled_cohorts.filter(course=course).first()
                collab_xp = get_or_create_course_xp(collaborator, course, cohort=collab_cohort)
                collab_xp.total_xp += collab_xp_awarded
                collab_xp.save(update_fields=["total_xp"])

            if quiz.lesson and passed:
                collab_enr = Enrollment.objects.filter(user=collaborator, course=course).first()
                if collab_enr:
                    collab_enr.completed_lessons.add(quiz.lesson)

        return Response({
            "score": score_percentage,
            "passed": passed,
            "xp_awarded": xp_awarded,
            "collaboration_bonus": is_group_work,
            "attempt_tier": attempt_tier,
            "attempt_number": previous_attempts_count + 1,
            "correct_answers": correct_answers,
            "explanations": explanations
        })
    except Exception as e:
        logger.error(f"Quiz submission error for user {request.user.id}, quiz {quiz_id}: {e}", exc_info=True)
        return Response(
            {"error": "An unexpected error occurred while submitting this quiz. Please try again."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def quiz_attempts(request, slug, quiz_id):
    from .models import Quiz, QuizAttempt
    course = get_object_or_404(Course, slug=slug, is_published=True)
    if not request.user.is_staff and not Enrollment.objects.filter(user=request.user, course=course).exists():
        return Response({"error": "Not enrolled"}, status=403)
        
    from django.db.models import Q
    quiz = get_object_or_404(Quiz, Q(id=quiz_id) & (Q(module__course=course) | Q(lesson__module__course=course)))
    attempts = QuizAttempt.objects.filter(user=request.user, quiz=quiz).values("id", "score", "passed", "xp_awarded", "completed_at")
    return Response(list(attempts))

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_xp(request):
    from .models import UserXP
    # Aggregate total XP across all courses
    user_xps = UserXP.objects.filter(user=request.user)
    total_xp = sum(xp.total_xp for xp in user_xps)
    
    # Calculate a global level based on the same logic
    level = 1
    if total_xp >= 1500: level = 6
    elif total_xp >= 1000: level = 5
    elif total_xp >= 600: level = 4
    elif total_xp >= 300: level = 3
    elif total_xp >= 100: level = 2
    
    levels = {1: "Beginner", 2: "Learner", 3: "Achiever", 4: "Scholar", 5: "Expert", 6: "Master"}
    level_title = levels.get(level, "Master")
    
    return Response({
        "total_xp": total_xp,
        "level": level,
        "level_title": level_title
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def sample_certificate(request, slug):
    try:
        course = Course.objects.get(slug=slug)
    except Course.DoesNotExist:
        return Response({'detail': 'Course not found.'}, status=status.HTTP_404_NOT_FOUND)

    sample_uuid = 'SAMPLE-1234-5678-9012'
    
    if request.user.is_authenticated:
        name = f'{request.user.first_name} {request.user.last_name}'.strip() or request.user.username
    else:
        name = 'Student Name'
        
    from .pdf_generator import generate_certificate_pdf
    from django.http import FileResponse
    
    pdf_content_file = generate_certificate_pdf(
        user=request.user if request.user.is_authenticated else None,
        course=course,
        uuid_str=sample_uuid,
        name_on_certificate=name,
        is_sample=True
    )
    
    if pdf_content_file:
        return FileResponse(pdf_content_file.open("rb"), as_attachment=False, filename=f"Sample_Certificate_{course.slug}.pdf", content_type="application/pdf")
        
    return Response({'error': 'Failed to generate sample certificate'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def toggle_lesson_visibility(request, lesson_id):
    """Toggle lesson visibility for instructors/admins."""
    is_instructor = request.user.groups.filter(name='Instructors').exists()
    if not request.user.is_staff and not request.user.is_superuser and not is_instructor:
        return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
    try:
        from .models import Lesson
        lesson = Lesson.objects.get(id=lesson_id)
        new_visible = not lesson.is_visible
        week_lessons = list(same_week_lessons(lesson))
        for sibling in week_lessons:
            sibling.is_visible = new_visible
        Lesson.objects.bulk_update(week_lessons, ["is_visible"])
        week_label = f" ({len(week_lessons)} lessons)" if len(week_lessons) > 1 else ""
        return Response({
            "message": f"'{lesson.title}' is now {'visible' if new_visible else 'hidden'}{week_label}.",
            "is_visible": new_visible,
            "updated_lessons": [
                {"id": sibling.id, "is_visible": sibling.is_visible}
                for sibling in week_lessons
            ],
        })
    except Lesson.DoesNotExist:
        return Response({"error": "Lesson not found."}, status=status.HTTP_404_NOT_FOUND)

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def toggle_module_visibility(request, module_id):
    """Toggle module visibility for instructors/admins."""
    is_instructor = request.user.groups.filter(name='Instructors').exists()
    if not request.user.is_staff and not request.user.is_superuser and not is_instructor:
        return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
    try:
        from .models import Module
        module = Module.objects.get(id=module_id)
        module.is_visible = not module.is_visible
        module.save()
        return Response({
            "message": f"Module '{module.title}' is now {'visible' if module.is_visible else 'hidden'}.",
            "is_visible": module.is_visible
        })
    except Module.DoesNotExist:
        return Response({"error": "Module not found."}, status=status.HTTP_404_NOT_FOUND)

@api_view(["GET"])
@permission_classes([AllowAny])
def download_lesson_material(request, material_id):
    """Serve lesson material with proper Content-Disposition attachment header."""
    from .models import LessonMaterial
    from django.http import FileResponse
    import os, mimetypes
    material = get_object_or_404(LessonMaterial, id=material_id)
    
    from .serializers import request_is_instructor_or_admin, is_instructor_plan_material
    is_instructor = request_is_instructor_or_admin(request)
    
    if not is_instructor and (not material.lesson.is_visible or not material.lesson.module.is_visible):
        return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        
    if is_instructor_plan_material(material) and not is_instructor:
        return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
    
    if not material.file:
        return Response({"error": "File not found"}, status=status.HTTP_404_NOT_FOUND)

    raw_name = os.path.basename(material.file.name)
    ext = os.path.splitext(raw_name)[1]
    title_clean = material.title.strip().replace('/', '-').replace('\\', '-').replace('"', '')
    if ext and not title_clean.lower().endswith(ext.lower()):
        safe_filename = f"{title_clean}{ext}"
    else:
        safe_filename = title_clean or raw_name

    # Try local FileResponse first
    try:
        f = material.file.open("rb")
        ct, _ = mimetypes.guess_type(safe_filename)
        return FileResponse(f, as_attachment=True, filename=safe_filename, content_type=ct or 'application/octet-stream')
    except Exception as e:
        logger.warning(f"Could not open material file locally ({e}), falling back to storage/S3")

    # If S3, presign with Content-Disposition
    from django.conf import settings
    if getattr(settings, 'AWS_ACCESS_KEY_ID', None) and getattr(settings, 'AWS_STORAGE_BUCKET_NAME', None):
        try:
            import boto3
            s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=getattr(settings, 'AWS_S3_REGION_NAME', 'us-east-1'),
            )
            key = material.file.name
            url = s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': settings.AWS_STORAGE_BUCKET_NAME,
                    'Key': key,
                    'ResponseContentDisposition': f'attachment; filename="{safe_filename}"'
                },
                ExpiresIn=3600
            )
            from django.shortcuts import redirect
            return redirect(url)
        except Exception as e:
            logger.error(f"S3 presigned URL failed: {e}")

    from django.shortcuts import redirect
    return redirect(material.file.url)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_lesson_material(request, lesson_id):
    """Allow instructors/admins to upload supplementary files or lesson plans directly to a lesson."""
    import os
    from .models import Lesson, LessonMaterial
    from .serializers import request_is_instructor_or_admin, LessonMaterialSerializer

    if not request_is_instructor_or_admin(request):
        return Response({"error": "Instructor or Admin privileges required."}, status=status.HTTP_403_FORBIDDEN)

    lesson = get_object_or_404(Lesson, id=lesson_id)
    file_obj = request.FILES.get('file')
    if not file_obj:
        return Response({"error": "No file uploaded."}, status=status.HTTP_400_BAD_REQUEST)

    title = request.data.get('title', '').strip()
    if not title:
        title = os.path.splitext(file_obj.name)[0].replace('_', ' ').replace('-', ' ').title()

    is_inst_only = str(request.data.get('is_instructor_only', 'false')).lower() in ('true', '1')

    # Prevent duplicate records on the same lesson
    existing = LessonMaterial.objects.filter(lesson=lesson, title__iexact=title).first()
    if existing:
        existing.file = file_obj
        existing.is_instructor_only = is_inst_only
        existing.save()
        material = existing
    else:
        material = LessonMaterial.objects.create(
            lesson=lesson,
            file=file_obj,
            title=title,
            is_instructor_only=is_inst_only
        )
    serialized = LessonMaterialSerializer(material, context={"request": request}).data
    return Response({
        "message": "Material uploaded successfully.",
        "material": serialized,
        **serialized,
    }, status=status.HTTP_201_CREATED)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_lesson_material(request, material_id):
    """Allow instructors/admins to delete a lesson material."""
    from .models import LessonMaterial
    from .serializers import request_is_instructor_or_admin

    if not request_is_instructor_or_admin(request):
        return Response({"error": "Instructor or Admin privileges required."}, status=status.HTTP_403_FORBIDDEN)

    material = get_object_or_404(LessonMaterial, id=material_id)
    material.delete()
    return Response({"message": "Material deleted successfully."})


@api_view(["POST", "PATCH"])
@permission_classes([IsAuthenticated])
def update_cohort_tinkercad(request, cohort_id):
    """Allow instructors to update Tinkercad classroom code and roster for a cohort."""
    from .models import Cohort
    from .serializers import request_is_instructor_or_admin

    cohort = get_object_or_404(Cohort, id=cohort_id)
    user = request.user
    is_inst = (
        request_is_instructor_or_admin(request)
        or cohort.instructors.filter(id=user.id).exists()
        or getattr(cohort.course, 'assigned_instructor_id', None) == user.id
    )
    if not is_inst:
        return Response({"error": "Only instructors of this cohort can update class codes."}, status=status.HTTP_403_FORBIDDEN)

    code = request.data.get("tinkercad_class_code", "").strip()
    cohort.tinkercad_class_code = code
    roster_data = request.data.get("tinkercad_roster")
    if isinstance(roster_data, dict):
        cohort.tinkercad_roster = roster_data
    cohort.save(update_fields=["tinkercad_class_code", "tinkercad_roster"])

    return Response({
        "id": cohort.id,
        "tinkercad_class_code": cohort.tinkercad_class_code,
        "tinkercad_roster": cohort.tinkercad_roster,
        "message": "Tinkercad classroom configuration saved."
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_tinkercad_roster_pdf(request, cohort_id):
    """Upload Tinkercad classroom roster PDF, extract class code and student nicknames, match with cohort."""
    import re
    from django.utils import timezone
    from .models import Cohort
    from .serializers import request_is_instructor_or_admin

    cohort = get_object_or_404(Cohort, id=cohort_id)
    user = request.user
    is_inst = (
        request_is_instructor_or_admin(request)
        or cohort.instructors.filter(id=user.id).exists()
        or getattr(cohort.course, 'assigned_instructor_id', None) == user.id
    )
    if not is_inst:
        return Response({"error": "Instructor permissions required."}, status=status.HTTP_403_FORBIDDEN)

    pdf_file = request.FILES.get('file')
    if not pdf_file:
        return Response({"error": "No PDF file provided."}, status=status.HTTP_400_BAD_REQUEST)

    # Extract text from PDF
    text = ""
    try:
        import fitz
        doc = fitz.open(stream=pdf_file.read(), filetype="pdf")
        for page in doc:
            text += page.get_text() + "\n"
    except Exception:
        try:
            pdf_file.seek(0)
            from pypdf import PdfReader
            reader = PdfReader(pdf_file)
            for page in reader.pages:
                text += (page.extract_text() or "") + "\n"
        except Exception as e:
            return Response({"error": f"Failed to parse PDF: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

    if not text.strip():
        return Response({"error": "The uploaded PDF appears empty or contains only scanned images."}, status=status.HTTP_400_BAD_REQUEST)

    # Extract class code or URL
    class_code = ""
    m_url = re.search(r'tinkercad\.com/joinclass/([A-Z0-9]+)', text, re.I)
    if m_url:
        class_code = m_url.group(1).upper()
    else:
        m_code = re.search(r'(?:class\s*code|join\s*code|code)[:\s]+([A-Z0-9]{3,4}[-\s]?[A-Z0-9]{3,4}[-\s]?[A-Z0-9]{3,4})', text, re.I)
        if m_code:
            class_code = m_code.group(1).replace(' ', '').replace('-', '').upper()

    # Extract students & nicknames
    extracted_students = []
    for match in re.finditer(r'(?:Name:\s*)?([^\n\r]+?)\s*(?:\n|\r\n)\s*(?:Nickname|Nick name|Login):\s*([a-zA-Z0-9_.-]+)', text, re.I):
        s_name = match.group(1).strip()
        s_nick = match.group(2).strip()
        if s_name and s_nick and not s_name.lower().startswith("student") and s_nick.lower() != "nickname":
            extracted_students.append({"name": s_name, "nickname": s_nick})

    if not extracted_students:
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        for i, line in enumerate(lines):
            m_nick = re.search(r'^(?:Nickname|Nick name|Login)[:\s]+([a-zA-Z0-9_.-]+)$', line, re.I)
            if m_nick and i > 0:
                name_cand = lines[i-1]
                if len(name_cand) < 60 and not any(kw in name_cand.lower() for kw in ['tinkercad', 'class', 'code', 'page']):
                    extracted_students.append({"name": name_cand, "nickname": m_nick.group(1)})

    cohort_students = list(cohort.students.all())
    matched_roster = []
    for item in extracted_students:
        s_name = item["name"]
        nick = item["nickname"]
        matched_user = None
        for s in cohort_students:
            full = f"{s.first_name} {s.last_name}".strip()
            if full.lower() == s_name.lower() or s.username.lower() == nick.lower() or s_name.lower() in full.lower():
                matched_user = s
                break
        matched_roster.append({
            "name": s_name,
            "nickname": nick,
            "user_id": matched_user.id if matched_user else None,
            "username": matched_user.username if matched_user else None
        })

    if class_code:
        cohort.tinkercad_class_code = class_code
    cohort.tinkercad_roster = {
        "class_code": cohort.tinkercad_class_code,
        "students": matched_roster,
        "raw_count": len(matched_roster),
        "updated_at": timezone.now().isoformat()
    }
    cohort.save(update_fields=["tinkercad_class_code", "tinkercad_roster"])

    return Response({
        "message": f"Successfully extracted {len(matched_roster)} students from Tinkercad roster.",
        "class_code": cohort.tinkercad_class_code,
        "students": matched_roster,
        "roster": cohort.tinkercad_roster
    })


@api_view(["GET", "POST"])
@parser_classes([MultiPartParser, FormParser, JSONParser])
@permission_classes([IsAuthenticated])
def lesson_assignment_api(request, lesson_id):
    """Manage lesson assignments, student word-style submissions, and auto-generated design briefs."""
    from django.utils import timezone
    from .models import Lesson, LessonAssignment, LessonAssignmentSubmission, Cohort
    from .serializers import request_is_instructor_or_admin
    from .xp_utils import get_or_create_course_xp

    lesson = get_object_or_404(Lesson, id=lesson_id)
    course = lesson.module.course
    is_instructor = request_is_instructor_or_admin(request)

    assignment = lesson.assignments.first()
    if not assignment:
        title_lower = f"{lesson.title} {lesson.module.title}".lower()
        # Prototype and 7-Section Design Brief is strictly in the 8th week only
        is_week_8 = any(kw in title_lower for kw in ["week 8", "week 08", "week-8", "prototype"])
        if is_week_8:
            assignment = LessonAssignment.objects.create(
                lesson=lesson,
                title="7-Section Design Brief & Prototype Documentation",
                description="Write a complete 7-section design brief and Arduino / robotics prototype documentation.",
                instructions="Fill in each section below directly in the web document. Minimum 3 systematic test runs required.",
                questions=[
                    {
                        "id": "q1",
                        "title": "1. Problem Statement",
                        "prompt": "What real-world problem does your system solve? Explain the context, user pain points, and why this solution matters.",
                        "placeholder": "e.g. In smallholder poultry farming, sudden overnight drops in ambient temperature lead to chick hypothermia..."
                    },
                    {
                        "id": "q2",
                        "title": "2. Target User & Requirements",
                        "prompt": "Who is the user (e.g. farmer, school, clinic)? What are their specific constraints and success criteria?",
                        "placeholder": "e.g. The target user is a local farmer who needs automated temperature regulation and clear audio-visual alerts..."
                    },
                    {
                        "id": "q3",
                        "title": "3. Solution Description & Hardware",
                        "prompt": "Describe your working system. List all inputs (sensors, buttons), controllers, and outputs (LEDs, LCD, buzzer, actuators).",
                        "placeholder": "e.g. Prototype uses Arduino Uno, DHT11 / TMP36 temperature sensor on A0, buzzer on Pin 8, servo on Pin 9..."
                    },
                    {
                        "id": "q4",
                        "title": "4. How It Works (Step-by-Step Logic)",
                        "prompt": "Explain the step-by-step logic, state transitions, algorithm, and flow of your code.",
                        "placeholder": "Step 1: System initializes pins and displays welcome message on LCD.\nStep 2: Read sensor value every 500ms.\nStep 3: If temp < 20°C, turn on heating element relay and blink yellow warning LED..."
                    },
                    {
                        "id": "q5",
                        "title": "5. English & Math Connection",
                        "prompt": "Show your mathematical calculations (sensor voltage scaling, ADC formulas, threshold math, timing delays) and written explanation.",
                        "placeholder": "ADC resolution = 5V / 1024 = 4.88mV per step.\nTemperature = (ADC_reading * 5.0 / 1024.0 - 0.5) * 100.\nThreshold set to 22.5°C based on 3 calibration runs..."
                    },
                    {
                        "id": "q6",
                        "title": "6. Systematic Test Results (Minimum 3 Runs)",
                        "prompt": "Record systematic test runs in detail: Run # | Input Tested | Expected Outcome | Actual Observed Result | Pass / Fail.",
                        "placeholder": "Run 1: Ambient room test (24°C) -> Expected: Green LED ON, heater OFF -> Observed: Green LED lit immediately (PASS)\nRun 2: Ice pack near sensor (16°C) -> Expected: Relay clicks ON, yellow LED ON -> Observed: Relay engaged in 1.2s (PASS)\nRun 3: Disconnected sensor pin -> Expected: LCD shows 'Sensor Fault' -> Observed: Buzzer alarm triggered with fault code (PASS)"
                    },
                    {
                        "id": "q7",
                        "title": "7. Improvements Made & Peer Review",
                        "prompt": "What did you iterate or improve after testing? Record peer review feedback using the 5-question rubric, and outline your 5-minute Demo Day presentation plan.",
                        "placeholder": "Improvements: Added 3-second hysteresis debounce to prevent relay chatter.\nPeer Review Feedback: Partner suggested adding sound mute toggle; added push button interrupt.\nDemo Day Plan: Problem (30s) -> Solution (60s) -> Live Demo (90s) -> Evidence (60s) -> Reflection (60s)."
                    }
                ],
                max_score=100
            )
        else:
            # Leave other weeks assignment empty for now so an instructor can add
            assignment = LessonAssignment.objects.create(
                lesson=lesson,
                title=f"{lesson.title} — Lesson Worksheet & Assignment",
                description="No worksheet questions assigned for this lesson yet.",
                instructions="",
                questions=[],
                max_score=100
            )

    if request.method == "GET":
        cohort_id = request.query_params.get("cohort_id")
        user = request.user

        my_submission = LessonAssignmentSubmission.objects.filter(
            assignment=assignment,
            student=user
        ).first()

        if not my_submission:
            my_submission = LessonAssignmentSubmission.objects.filter(
                assignment=assignment,
                paired_student=user
            ).first()

        submission_data = None
        if my_submission:
            submission_data = {
                "id": my_submission.id,
                "status": my_submission.status,
                "answers": my_submission.answers or {},
                "content": my_submission.content or "",
                "score": my_submission.score,
                "feedback": my_submission.feedback or "",
                "graded_by_name": f"{my_submission.graded_by.first_name} {my_submission.graded_by.last_name}".strip() if my_submission.graded_by else None,
                "graded_at": my_submission.graded_at.isoformat() if my_submission.graded_at else None,
                "submitted_at": my_submission.submitted_at.isoformat() if my_submission.submitted_at else None,
                "updated_at": my_submission.updated_at.isoformat(),
                "paired_student_id": my_submission.paired_student_id,
                "paired_student_name": f"{my_submission.paired_student.first_name} {my_submission.paired_student.last_name}".strip() if my_submission.paired_student else None,
            }

        all_submissions_data = []
        if is_instructor:
            subs_qs = assignment.submissions.all().select_related("student", "graded_by", "paired_student")
            if cohort_id:
                subs_qs = subs_qs.filter(cohort_id=cohort_id)
            for sub in subs_qs:
                all_submissions_data.append({
                    "id": sub.id,
                    "student_id": sub.student.id,
                    "student_name": f"{sub.student.first_name} {sub.student.last_name}".strip() or sub.student.username,
                    "student_email": sub.student.email,
                    "status": sub.status,
                    "score": sub.score,
                    "feedback": sub.feedback,
                    "answers": sub.answers,
                    "content": sub.content,
                    "paired_student_name": f"{sub.paired_student.first_name} {sub.paired_student.last_name}".strip() if sub.paired_student else None,
                    "submitted_at": sub.submitted_at.isoformat() if sub.submitted_at else None,
                    "updated_at": sub.updated_at.isoformat()
                })

        return Response({
            "assignment": {
                "id": assignment.id,
                "title": assignment.title,
                "description": assignment.description,
                "instructions": assignment.instructions,
                "questions": assignment.questions,
                "max_score": assignment.max_score,
            },
            "my_submission": submission_data,
            "all_submissions": all_submissions_data if is_instructor else []
        })

    elif request.method == "POST":
        user = request.user
        action = request.data.get("action")

        if action == "generate_with_ai":
            if not is_instructor:
                return Response({"error": "Only instructors and administrators can generate assignments with AI."}, status=status.HTTP_403_FORBIDDEN)
            from .assignment_service import generate_assignment_with_ai
            try:
                generated = generate_assignment_with_ai(lesson, course)
                return Response({
                    "success": True,
                    "message": "Assignment generated with EkebuAI.",
                    "assignment": generated
                })
            except Exception as e:
                logger.error(f"EkebuAI assignment generation error: {e}")
                return Response({"error": f"Failed to generate assignment: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        elif action == "import_file":
            if not is_instructor:
                return Response({"error": "Only instructors and administrators can import assignments."}, status=status.HTTP_403_FORBIDDEN)
            uploaded_file = request.FILES.get("file")
            if not uploaded_file:
                return Response({"error": "No file uploaded. Please select a .docx, .xlsx, or .csv file."}, status=status.HTTP_400_BAD_REQUEST)
            from .assignment_service import parse_assignment_file
            try:
                parsed = parse_assignment_file(uploaded_file, uploaded_file.name)
                return Response({
                    "success": True,
                    "message": f"Successfully imported assignment from {uploaded_file.name}.",
                    "assignment": parsed
                })
            except Exception as e:
                logger.warning(f"Assignment file import failed: {e}")
                return Response({"error": f"Failed to import file: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        elif action == "update_assignment":
            if not is_instructor:
                return Response({"error": "Only instructors and administrators can edit assignment questions."}, status=status.HTTP_403_FORBIDDEN)
            title = request.data.get("title")
            description = request.data.get("description")
            instructions = request.data.get("instructions")
            questions = request.data.get("questions")
            max_score = request.data.get("max_score")

            if title:
                assignment.title = title.strip()
            if description is not None:
                assignment.description = description.strip()
            if instructions is not None:
                assignment.instructions = instructions.strip()
            if isinstance(questions, list):
                assignment.questions = questions
            if max_score is not None:
                try:
                    assignment.max_score = int(max_score)
                except (ValueError, TypeError):
                    pass
            assignment.save()

            return Response({
                "success": True,
                "message": "Assignment structure and questions updated successfully.",
                "assignment": {
                    "id": assignment.id,
                    "title": assignment.title,
                    "description": assignment.description,
                    "instructions": assignment.instructions,
                    "questions": assignment.questions,
                    "max_score": assignment.max_score,
                }
            })

        answers = request.data.get("answers", {})
        content = request.data.get("content", "")
        status_val = request.data.get("status", "draft")
        cohort_id = request.data.get("cohort_id")
        paired_id = request.data.get("paired_student_id")

        cohort = None
        if cohort_id:
            cohort = Cohort.objects.filter(id=cohort_id).first()

        paired_student = None
        if paired_id:
            from django.contrib.auth.models import User
            paired_student = User.objects.filter(id=paired_id).first()

        submission, created = LessonAssignmentSubmission.objects.get_or_create(
            assignment=assignment,
            student=user,
            defaults={
                "answers": answers,
                "content": content,
                "status": status_val,
                "cohort": cohort,
                "paired_student": paired_student,
                "submitted_at": timezone.now() if status_val == "submitted" else None
            }
        )

        if not created:
            submission.answers = answers
            submission.content = content
            if cohort:
                submission.cohort = cohort
            if paired_student:
                submission.paired_student = paired_student
            if status_val == "submitted" and submission.status != "submitted":
                submission.status = "submitted"
                submission.submitted_at = timezone.now()
            elif status_val == "draft" and submission.status == "draft":
                submission.status = "draft"
            submission.save()

        if status_val == "submitted":
            xp_row = get_or_create_course_xp(user, course, cohort=cohort)
            xp_row.total_xp = (xp_row.total_xp or 0) + 25
            xp_row.save(update_fields=["total_xp"])

        if paired_student and paired_student != user:
            p_sub, _ = LessonAssignmentSubmission.objects.get_or_create(
                assignment=assignment,
                student=paired_student,
                defaults={
                    "answers": answers,
                    "content": content,
                    "status": status_val,
                    "cohort": cohort,
                    "paired_student": user,
                    "submitted_at": timezone.now() if status_val == "submitted" else None
                }
            )
            if not _:
                p_sub.answers = answers
                p_sub.content = content
                p_sub.paired_student = user
                if cohort:
                    p_sub.cohort = cohort
                if status_val == "submitted" and p_sub.status != "submitted":
                    p_sub.status = "submitted"
                    p_sub.submitted_at = timezone.now()
                p_sub.save()
            if status_val == "submitted":
                p_xp = get_or_create_course_xp(paired_student, course, cohort=cohort)
                p_xp.total_xp = (p_xp.total_xp or 0) + 25
                p_xp.save(update_fields=["total_xp"])

        return Response({
            "message": "Assignment submitted successfully!" if status_val == "submitted" else "Draft saved.",
            "submission_id": submission.id,
            "status": submission.status,
            "submitted_at": submission.submitted_at.isoformat() if submission.submitted_at else None
        })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def grade_lesson_assignment(request, submission_id):
    """Allow instructor to mark/grade a student's assignment and award XP."""
    from django.utils import timezone
    from .models import LessonAssignmentSubmission
    from .serializers import request_is_instructor_or_admin
    from .xp_utils import get_or_create_course_xp

    if not request_is_instructor_or_admin(request):
        return Response({"error": "Instructor permissions required to grade assignments."}, status=status.HTTP_403_FORBIDDEN)

    submission = get_object_or_404(LessonAssignmentSubmission, id=submission_id)
    score = request.data.get("score")
    feedback = request.data.get("feedback", "").strip()

    try:
        score_val = int(score) if score is not None else None
    except (ValueError, TypeError):
        return Response({"error": "Invalid score value."}, status=status.HTTP_400_BAD_REQUEST)

    submission.score = score_val
    submission.feedback = feedback
    submission.status = "graded"
    submission.graded_by = request.user
    submission.graded_at = timezone.now()
    submission.save()

    course = submission.assignment.lesson.module.course
    if score_val is not None:
        bonus_xp = max(10, min(50, int(score_val / 2)))
        xp_row = get_or_create_course_xp(submission.student, course, cohort=submission.cohort)
        xp_row.total_xp = (xp_row.total_xp or 0) + bonus_xp
        xp_row.save(update_fields=["total_xp"])

        if submission.paired_student:
            p_xp = get_or_create_course_xp(submission.paired_student, course, cohort=submission.cohort)
            p_xp.total_xp = (p_xp.total_xp or 0) + bonus_xp
            p_xp.save(update_fields=["total_xp"])

    return Response({
        "message": "Assignment graded successfully.",
        "score": submission.score,
        "feedback": submission.feedback,
        "status": submission.status,
        "graded_at": submission.graded_at.isoformat()
    })

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def study_session(request, slug):
    from .models import Course, StudySession
    from .serializers import StudySessionSerializer
    from django.utils import timezone
    course = get_object_or_404(Course, slug=slug, is_published=True)
    session, _ = StudySession.objects.get_or_create(user=request.user, course=course)

    if request.method == 'POST':
        action = request.data.get('action')
        if action == 'start':
            session.is_active = True
            session.last_ping = timezone.now()
            session.save()
        elif action == 'pause':
            session.is_active = False
            session.elapsed_seconds = request.data.get('elapsed_seconds', session.elapsed_seconds)
            session.save()
        elif action == 'ping':
            if session.is_active:
                session.last_ping = timezone.now()
                session.elapsed_seconds = request.data.get('elapsed_seconds', session.elapsed_seconds)
                session.save()
        return Response(StudySessionSerializer(session).data)

    return Response(StudySessionSerializer(session).data)

@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def trigger_reminders(request):
    """
    Webhook endpoint to trigger email reminders via a cron service.
    Requires ?token=SECRET in the query params.
    """
    token = request.query_params.get("token") or request.data.get("token")
    
    # In production, set REMINDER_WEBHOOK_TOKEN in .env. Fallback for local testing.
    expected_token = getattr(settings, 'REMINDER_WEBHOOK_TOKEN', 'dev-secret-token-123')
    
    if not token or token != expected_token:
        return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)
        
    try:
        call_command('send_course_reminders')
        call_command('create_scheduled_notifications')
        call_command('process_notification_deliveries', digest='immediate')
        call_command('process_notification_deliveries', digest='daily')
        if timezone.now().weekday() == 0:
            call_command('process_notification_deliveries', digest='weekly')
        return Response({"status": "Reminders and notifications processed successfully"}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([AllowAny])
def test_gemini_models_debug(request):
    """Diagnostic endpoint to test Gemini API key and list available models from Google."""
    import os, requests
    api_key = (
        os.environ.get("GEMINI_API_KEY")
        or os.environ.get("GEMINI_API_KEY_LOCAL")
        or os.environ.get("GOOGLE_API_KEY")
        or os.environ.get("GEMINI_KEY")
        or ""
    ).strip()
    groq_key = (
        os.environ.get("GROQ_API_KEY")
        or os.environ.get("GROQ_API_KEY_LOCAL")
        or ""
    ).strip()

    if not api_key:
        return Response({
            "gemini_key_found": False,
            "groq_key_found": bool(groq_key),
            "message": "No GEMINI_API_KEY configured in environment variables."
        })

    key_preview = api_key[:6] + "..." + api_key[-4:] if len(api_key) > 10 else "SHORT_KEY"

    # List available models
    models_url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
    available_models = []
    models_error = ""

    try:
        models_resp = requests.get(models_url, timeout=10)
        if models_resp.status_code == 200:
            models_data = models_resp.json()
            available_models = [m.get("name") for m in models_data.get("models", []) if "generateContent" in m.get("supportedGenerationMethods", [])]
        else:
            models_error = f"{models_resp.status_code}: {models_resp.text[:300]}"
    except Exception as me:
        models_error = str(me)

    return Response({
        "gemini_key_found": True,
        "key_preview": key_preview,
        "available_models_count": len(available_models),
        "available_models": available_models[:20],
        "models_error": models_error,
        "groq_key_found": bool(groq_key)
    })


@api_view(["GET", "POST"])
@permission_classes([IsAdminUser])
def ai_analytics_dashboard(request):
    """Developer Analytics & Dataset Export API for EkebuAI."""
    from .models import ChatLog, UserMemory
    from .ai_tools.s3_dataset_exporter import export_chat_logs_to_s3

    if request.method == "POST":
        action = request.data.get("action", "export_s3")
        if action == "export_s3":
            logs = ChatLog.objects.all()
            result = export_chat_logs_to_s3(logs)
            return Response(result)

    total_chats = ChatLog.objects.count()
    total_memories = UserMemory.objects.count()
    recent_logs = ChatLog.objects.select_related("user", "course").order_by("-created_at")[:25]

    log_list = [
        {
            "id": l.id,
            "user": l.user.username,
            "course": l.course.title if l.course else "General",
            "query": l.query,
            "response": l.response[:150] + ("..." if len(l.response) > 150 else ""),
            "model_used": l.model_used,
            "created_at": l.created_at.strftime("%Y-%m-%d %H:%M"),
        }
        for l in recent_logs
    ]

    return Response({
        "total_chats": total_chats,
        "total_memories": total_memories,
        "recent_logs": log_list,
    })


# ─── Student Project Views ───────────────────────────────────────────────

from .models import StudentProject
from .serializers import StudentProjectSerializer
from rest_framework.parsers import MultiPartParser, FormParser

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def lesson_projects(request, slug, lesson_id):
    """List or create student projects for a specific lesson."""
    lesson = get_object_or_404(Lesson, id=lesson_id, module__course__slug=slug)

    if request.method == "GET":
        projects = StudentProject.objects.filter(user=request.user, lesson=lesson)
        return Response(StudentProjectSerializer(projects, many=True, context={"request": request}).data)

    # POST - create
    parser_classes = [MultiPartParser, FormParser]
    file = request.FILES.get("file")
    name = request.data.get("name", "")
    if not file:
        return Response({"error": "No file uploaded"}, status=400)
    if not name:
        name = file.name

    project = StudentProject.objects.create(
        user=request.user,
        lesson=lesson,
        name=name,
        file=file,
    )
    
    # Handle Pair Programming duplication for Project
    from .models import LessonPairing
    pairing = LessonPairing.objects.filter(lesson=lesson, host_student=request.user).first() or \
              LessonPairing.objects.filter(lesson=lesson, partner_student=request.user).first()
    
    if pairing:
        partner = pairing.partner_student if pairing.host_student == request.user else pairing.host_student
        from django.core.files.base import ContentFile
        # Duplicate the file content to prevent S3 overwrite issues with the same file path
        if file:
            file.seek(0)
            partner_file = ContentFile(file.read(), name=f"partner_{file.name}")
        else:
            partner_file = None
            
        StudentProject.objects.create(
            user=partner,
            lesson=lesson,
            name=f"{name} (Team Project)",
            file=partner_file,
        )

    return Response(StudentProjectSerializer(project, context={"request": request}).data, status=201)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_project(request, project_id):
    """Delete a student project."""
    project = get_object_or_404(StudentProject, id=project_id, user=request.user)
    project.file.delete(save=False)
    project.delete()
    return Response(status=204)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_projects(request):
    """List all projects for the authenticated user across all lessons."""
    projects = StudentProject.objects.filter(user=request.user).select_related("lesson__module__course")
    return Response(StudentProjectSerializer(projects, many=True, context={"request": request}).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def instructor_student_roster(request):
    """Instructor & Admin view to see list of enrolled students, progress %, XP, and certificates."""
    from django.db.models import Q
    from .models import Enrollment, UserXP, Certificate, QuizAttempt, Course

    is_admin = request.user.is_staff or request.user.is_superuser
    is_instructor = (
        request.user.groups.filter(name='Instructors').exists() or 
        Course.objects.filter(Q(assigned_instructor=request.user) | Q(owner=request.user)).exists()
    )
    if not (is_admin or is_instructor):
        return Response({"error": "Instructor permissions required."}, status=403)

    enrollments = Enrollment.objects.select_related("user", "course", "user__profile").prefetch_related("user__enrolled_cohorts")
    if not is_admin:
        course_filter = Q(course__assigned_instructor=request.user) | Q(course__owner=request.user)
        if Course.objects.filter(course_filter).exists():
            enrollments = enrollments.filter(course_filter)
    enrollments = enrollments.order_by("-enrolled_at")
    
    data = []
    for enr in enrollments:
        from .xp_utils import sum_course_xp
        cohort = next(
            (c for c in enr.user.enrolled_cohorts.all() if c.course_id == enr.course_id),
            None,
        )
        total_xp = sum_course_xp(enr.user_id, enr.course_id, cohort=cohort)
        cert = Certificate.objects.filter(user=enr.user, course=enr.course, module__isnull=True).first()
        
        # Calculate retakes across the course
        total_attempts = QuizAttempt.objects.filter(
            user=enr.user, 
            quiz__lesson__module__course=enr.course
        ).count() + QuizAttempt.objects.filter(
            user=enr.user, 
            quiz__module__course=enr.course
        ).count()
        
        distinct_quizzes = QuizAttempt.objects.filter(
            user=enr.user, 
            quiz__lesson__module__course=enr.course
        ).values('quiz').distinct().count() + QuizAttempt.objects.filter(
            user=enr.user, 
            quiz__module__course=enr.course
        ).values('quiz').distinct().count()

        total_retakes = max(0, total_attempts - distinct_quizzes)
        
        try:
            middle = enr.user.profile.middle_name
        except Exception:
            middle = ""
        parts = [enr.user.first_name, middle, enr.user.last_name]
        full_name = " ".join([p.strip() for p in parts if p and p.strip()])
        
        cohorts = [c.name for c in enr.user.enrolled_cohorts.all() if c.course_id == enr.course_id]
        cohort_name = ", ".join(cohorts) if cohorts else None

        data.append({
            "id": enr.id,
            "student_username": enr.user.username,
            "student_email": enr.user.email,
            "student_name": full_name or enr.user.username,
            "course_title": enr.course.title,
            "course_slug": enr.course.slug,
            "cohort_name": cohort_name,
            "cohort_names": cohorts,
            "progress_percent": enr.progress_percent,
            "total_xp": total_xp,
            "total_retakes": total_retakes,
            "enrolled_at": enr.enrolled_at,
            "has_certificate": cert is not None,
            "certificate_url": cert.pdf_file.url if cert and cert.pdf_file else None,
        })

    return Response(data)


def process_avatar_smart_crop(uploaded_file):
    """Smart crops uploaded avatar image prioritizing the head and face."""
    from PIL import Image, ImageOps
    import io
    from django.core.files.uploadedfile import InMemoryUploadedFile

    try:
        img = Image.open(uploaded_file)
        img = ImageOps.exif_transpose(img)  # Fix phone EXIF rotation

        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")

        w, h = img.size
        # Smart top-weighted square crop (keep top 15% margin to preserve head/hair)
        if h > w:
            top = int((h - w) * 0.15)
            bottom = top + w
            left = 0
            right = w
        else:
            left = int((w - h) / 2)
            right = left + h
            top = 0
            bottom = h

        cropped = img.crop((left, top, right, bottom))
        cropped = cropped.resize((500, 500), Image.Resampling.LANCZOS)

        buffer = io.BytesIO()
        cropped.save(buffer, format="JPEG", quality=92)
        buffer.seek(0)

        return InMemoryUploadedFile(
            buffer,
            "ImageField",
            f"{uploaded_file.name.rsplit('.', 1)[0]}_cropped.jpg",
            "image/jpeg",
            buffer.tell(),
            None
        )
    except Exception as e:
        import logging
        logging.error(f"Avatar smart crop error: {e}")
        return uploaded_file


@api_view(["GET", "PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def user_profile_detail(request):
    """Get or update current user's profile and S3 avatar safely."""
    from .models import UserProfile
    try:
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
    except Exception as err:
        import logging
        logging.error(f"UserProfile error: {err}")
        profile = None

    def get_avatar_url(p):
        from .utils import resolve_user_avatar_url
        return resolve_user_avatar_url(request.user, request=request)

    if request.method == "GET":
        return Response({
            "username": request.user.username,
            "email": request.user.email,
            "first_name": request.user.first_name,
            "last_name": request.user.last_name,
            "gender": profile.gender if profile else "",
            "gender_display": profile.get_gender_display() if profile and profile.gender else "",
            "phone_number": profile.phone_number if profile else "",
            "headline": profile.headline if profile else "",
            "bio": profile.bio if profile else "",
            "interests": profile.interests if profile else [],
            "github_profile": profile.github_profile if profile else "",
            "linkedin_profile": profile.linkedin_profile if profile else "",
            "location": profile.location if profile else "",
            "avatar_url": get_avatar_url(profile),
        })

    # Update User fields
    data = request.data
    first_name = data.get("first_name")
    last_name = data.get("last_name")
    if first_name is not None: request.user.first_name = first_name.strip()
    if last_name is not None: request.user.last_name = last_name.strip()
    request.user.save()

    if profile:
        if "gender" in data:
            from .utils import parse_gender
            profile.gender = parse_gender(data.get("gender"))
        if "phone_number" in data: profile.phone_number = str(data.get("phone_number", "")).strip()
        if "headline" in data: profile.headline = str(data.get("headline", "")).strip()
        if "bio" in data: profile.bio = str(data.get("bio", "")).strip()
        if "github_profile" in data: profile.github_profile = str(data.get("github_profile", "")).strip()
        if "linkedin_profile" in data: profile.linkedin_profile = str(data.get("linkedin_profile", "")).strip()
        if "location" in data: profile.location = str(data.get("location", "")).strip()
        
        if "interests" in data:
            interests_val = data.get("interests")
            if isinstance(interests_val, list):
                profile.interests = interests_val
            elif isinstance(interests_val, str):
                import json
                try: profile.interests = json.loads(interests_val)
                except Exception: pass

        if "avatar" in request.FILES:
            profile.avatar = process_avatar_smart_crop(request.FILES["avatar"])

        try:
            profile.save()
        except Exception as save_err:
            import logging
            logging.error(f"UserProfile save error: {save_err}")

    return Response({
        "message": "Profile updated successfully",
        "username": request.user.username,
        "email": request.user.email,
        "first_name": request.user.first_name,
        "last_name": request.user.last_name,
        "gender": profile.gender if profile else "",
        "gender_display": profile.get_gender_display() if profile and profile.gender else "",
        "phone_number": profile.phone_number if profile else "",
        "headline": profile.headline if profile else "",
        "bio": profile.bio if profile else "",
        "interests": profile.interests if profile else [],
        "github_profile": profile.github_profile if profile else "",
        "linkedin_profile": profile.linkedin_profile if profile else "",
        "location": profile.location if profile else "",
        "avatar_url": get_avatar_url(profile),
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def site_members_list(request):
    """Searchable list of all registered site members for instructor enrollment dropdown."""
    if not (request.user.is_staff or request.user.is_superuser or request.user.groups.filter(name='Instructors').exists()):
        return Response({"error": "Instructor permissions required."}, status=403)

    query = request.GET.get("q", "").strip()
    users_qs = User.objects.all()
    if query:
        from django.db.models import Q
        users_qs = users_qs.filter(
            Q(username__icontains=query) |
            Q(email__icontains=query) |
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query)
        )
    users_qs = users_qs.order_by("first_name", "last_name", "email")[:100]

    data = [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "full_name": f"{u.first_name} {u.last_name}".strip() or u.username,
        }
        for u in users_qs
    ]
    return Response(data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def enroll_single_student(request, slug):
    """Enroll a student into a course via user_id or email."""
    if not (request.user.is_staff or request.user.is_superuser or request.user.groups.filter(name='Instructors').exists()):
        return Response({"error": "Instructor permissions required."}, status=403)

    course = get_object_or_404(Course, slug=slug, is_published=True)
    user_id = request.data.get("user_id")
    email = request.data.get("email", "").strip().lower()
    first_name = request.data.get("first_name", "").strip()
    last_name = request.data.get("last_name", "").strip()
    gender = request.data.get("gender")

    target_user = None
    if user_id:
        target_user = User.objects.filter(id=user_id).first()
    elif email:
        target_user = User.objects.filter(email__iexact=email).first()

    if not target_user and email:
        import string, secrets
        from django.contrib.auth.models import User
        from django.core.mail import send_mail
        from .utils import name_from_email, parse_gender
        
        username = email
        alphabet = string.ascii_letters + string.digits
        random_pwd = "".join(secrets.choice(alphabet) for _ in range(12))
        if not first_name and not last_name:
            derived = name_from_email(email)
            bits = derived.split(" ", 1)
            first_name = bits[0] if bits else ""
            last_name = bits[1] if len(bits) > 1 else ""
        try:
            target_user = User.objects.create_user(
                username=username,
                email=email,
                password=random_pwd,
                first_name=first_name,
                last_name=last_name,
            )
            from .models import UserProfile
            profile, _ = UserProfile.objects.get_or_create(user=target_user)
            parsed = parse_gender(gender)
            if parsed:
                profile.gender = parsed
                profile.save(update_fields=["gender"])
            
            # Send password email
            login_url = getattr(settings, 'PUBLIC_SITE_URL', 'https://petergordonekebu.com').rstrip('/') + '/auth/login'
            subject = "Your Account Details - Peter Gordon Ekebu Platform"
            message = f"Hi {first_name or 'Student'},\n\n"
            message += f"An account has been created for you on the Peter Gordon Ekebu learning platform.\n\n"
            message += f"Your temporary password is: {random_pwd}\n\n"
            message += f"Please log in and change your password:\n{login_url}\n\n"
            message += "Best regards,\nPeter Gordon Ekebu"
            
            from config.email import send_personal_mail, build_branded_email_html
            html_msg = build_branded_email_html(
                title="Your Learning Account Details",
                message_paragraphs=[
                    "An account has been created for you on the Peter Gordon Ekebu educational platform.",
                    f"Your temporary password is: <strong style=\"background: #eff6ff; color: #2563eb; padding: 4px 8px; border-radius: 6px; font-family: monospace; font-size: 15px;\">{random_pwd}</strong>",
                    "Please log in and change your password upon your first visit.",
                ],
                brand="personal",
                recipient_name=first_name or 'Student',
                action_url=login_url,
                action_label="Log In to Platform",
            )
            
            send_personal_mail(
                subject,
                message,
                [email],
                html_message=html_msg,
                fail_silently=True,
            )
        except Exception as ex:
            return Response({"error": f"Failed to create account for {email}: {str(ex)}"}, status=400)
    elif not target_user:
        return Response({"error": "User not found with the provided email/ID."}, status=404)

    from .models import Enrollment
    enrollment, created = Enrollment.objects.get_or_create(user=target_user, course=course)
    
    return Response({
        "message": f"Successfully enrolled {target_user.email} in {course.title}.",
        "created": created,
        "student": {
            "id": target_user.id,
            "email": target_user.email,
            "name": f"{target_user.first_name} {target_user.last_name}".strip() or target_user.username,
        }
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def enroll_csv_bulk(request, slug):
    """Bulk enroll students via CSV file upload (email, first_name, last_name, other_names)."""
    if not (request.user.is_staff or request.user.is_superuser or request.user.groups.filter(name='Instructors').exists()):
        return Response({"error": "Instructor permissions required."}, status=403)

    course = get_object_or_404(Course, slug=slug, is_published=True)
    csv_file = request.FILES.get("file")
    if not csv_file:
        return Response({"error": "No CSV file provided."}, status=400)

    import csv, io, secrets, string
    from .models import Enrollment

    try:
        decoded_file = csv_file.read().decode("utf-8-sig")
        io_string = io.StringIO(decoded_file)
        reader = csv.DictReader(io_string)
    except Exception as e:
        return Response({"error": f"Failed to parse CSV file: {str(e)}"}, status=400)

    enrolled_count = 0
    new_accounts_created = 0
    errors = []

    for row in reader:
        norm_row = {str(k).strip().lower().replace(" ", "_"): str(v).strip() for k, v in row.items() if k}
        
        email = norm_row.get("email") or norm_row.get("user_email") or norm_row.get("email_address")
        if not email:
            continue
        email = email.lower()

        first_name = norm_row.get("first_name") or norm_row.get("firstname") or norm_row.get("name") or ""
        last_name = norm_row.get("last_name") or norm_row.get("lastname") or norm_row.get("surname") or ""
        other_names = norm_row.get("other_names") or norm_row.get("othernames") or norm_row.get("middle_name") or ""

        if other_names:
            first_name = f"{first_name} {other_names}".strip()

        target_user = User.objects.filter(email__iexact=email).first()
        if not target_user:
            username = email
            alphabet = string.ascii_letters + string.digits
            random_pwd = "".join(secrets.choice(alphabet) for _ in range(12))
            try:
                target_user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=random_pwd,
                    first_name=first_name,
                    last_name=last_name,
                )
                new_accounts_created += 1
            except Exception as ex:
                errors.append(f"Failed to create account for {email}: {str(ex)}")
                continue

        _, created = Enrollment.objects.get_or_create(user=target_user, course=course)
        if created or target_user:
            enrolled_count += 1

    return Response({
        "message": f"Successfully enrolled {enrolled_count} students ({new_accounts_created} new accounts created).",
        "enrolled_count": enrolled_count,
        "new_accounts_created": new_accounts_created,
        "errors": errors
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def transcribe_audio(request):
    """
    Receives an audio blob from the frontend, sends it to Sunbird AI for transcription,
    and returns the transcribed text. Also hooks into DataCollectionItem for RLHF.
    """
    from api.sunbird import SunbirdClient
    from .models import DataCollectionItem
    import uuid
    import logging

    logger = logging.getLogger(__name__)

    audio_file = request.FILES.get("file")
    language = request.data.get("language", "eng")
    
    if not audio_file:
        return Response({"error": "No audio file provided."}, status=400)

    transcribed_text = None
    from ekebuai.client import AgentUnavailable, gateway_configured, transcribe as ekebuai_transcribe
    file_bytes = audio_file.read()
    file_tuple = (audio_file.name or f"audio_{uuid.uuid4().hex}.webm", file_bytes, audio_file.content_type or "audio/webm")
    if gateway_configured():
        try:
            transcribed_text = (ekebuai_transcribe(file_tuple, language) or {}).get("text")
        except AgentUnavailable as e:
            logger.warning("transcribe gateway failed: %s", e)
    if not transcribed_text:
        from api.sunbird import SunbirdClient
        sunbird = SunbirdClient()
        transcribed_text = sunbird.transcribe(file_tuple, language)
    
    if transcribed_text is None:
        return Response({"error": "Failed to transcribe audio."}, status=500)
    
    # Save the raw audio and transcription for training data collection
    try:
        # Rewind audio_file to save it
        audio_file.seek(0)
        DataCollectionItem.objects.create(
            user=request.user,
            data_source=DataCollectionItem.DataSource.ASSISTANT_CHAT,
            data_type=DataCollectionItem.DataType.AUDIO_TO_TEXT,
            source_language=language,
            original_text=transcribed_text,
            media_file=audio_file,
            context_metadata={"source": "transcribe_audio_endpoint"}
        )
    except Exception as e:
        logger.error(f"Failed to save DataCollectionItem for audio: {e}")

    return Response({"text": transcribed_text})

# ─── Pair Programming Views ───────────────────────────────────────────────

from .models import LessonPairing, LessonPairRequest

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_lesson_partner(request, lesson_id):
    """Returns the active or assigned partner for this lesson, or pending matching status."""
    lesson = get_object_or_404(Lesson, id=lesson_id)
    
    pairing = LessonPairing.objects.filter(
        lesson=lesson, 
        is_active=True
    ).filter(Q(host_student=request.user) | Q(partner_student=request.user)).first()
    
    if pairing:
        is_host = pairing.host_student == request.user
        partner = pairing.partner_student if is_host else pairing.host_student
        return Response({
            "has_partner": True,
            "pairing_id": pairing.id,
            "is_host": is_host,
            "partner_id": partner.id,
            "partner_name": partner.get_full_name() or partner.username,
            "current_driver_id": pairing.current_driver_id,
            "pair_code": pairing.pair_code,
            "change_status": pairing.change_status,
            "change_requested_by_me": pairing.change_requested_by_id == request.user.id,
            "change_requested_by_name": pairing.change_requested_by.get_full_name() or pairing.change_requested_by.username if pairing.change_requested_by else None,
        })
        
    pending_req = LessonPairRequest.objects.filter(
        lesson=lesson,
        sender=request.user,
        status="pending"
    ).first()
    
    received_invites = LessonPairRequest.objects.filter(
        lesson=lesson,
        recipient=request.user,
        status="pending"
    ).select_related("sender")
    
    invites_data = [
        {
            "id": inv.id,
            "sender_id": inv.sender.id,
            "sender_name": inv.sender.get_full_name() or inv.sender.username,
        }
        for inv in received_invites
    ]

    return Response({
        "has_partner": False,
        "pending_request": {
            "id": pending_req.id,
            "is_open_match": pending_req.is_open_match,
            "pair_code": pending_req.pair_code,
            "recipient_id": pending_req.recipient_id,
        } if pending_req else None,
        "received_invites": invites_data,
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def swap_roles(request, lesson_id):
    """Swap the Driver and Navigator roles."""
    lesson = get_object_or_404(Lesson, id=lesson_id)
    pairing = LessonPairing.objects.filter(
        lesson=lesson,
        is_active=True
    ).filter(Q(host_student=request.user) | Q(partner_student=request.user)).first()
              
    if not pairing:
        return Response({"error": "No active pairing found."}, status=400)
        
    if pairing.current_driver == pairing.host_student:
        pairing.current_driver = pairing.partner_student
    else:
        pairing.current_driver = pairing.host_student
    pairing.save(update_fields=["current_driver"])
    
    return Response({"message": "Roles swapped.", "current_driver_id": pairing.current_driver_id})

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def request_partner_change(request, lesson_id):
    """Allows a student to request a change of partner, awaiting teacher approval."""
    lesson = get_object_or_404(Lesson, id=lesson_id)
    pairing = LessonPairing.objects.filter(
        lesson=lesson,
        is_active=True
    ).filter(Q(host_student=request.user) | Q(partner_student=request.user)).first()

    if not pairing:
        return Response({"error": "No active pairing found for this lesson."}, status=400)

    pairing.change_status = "pending"
    pairing.change_requested_by = request.user
    pairing.save(update_fields=["change_status", "change_requested_by"])

    return Response({
        "message": "Change of partner requested. Awaiting teacher approval.",
        "change_status": "pending",
        "change_requested_by_me": True,
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def cancel_partner_change(request, lesson_id):
    """Allows student to cancel their pending partner change request."""
    lesson = get_object_or_404(Lesson, id=lesson_id)
    pairing = LessonPairing.objects.filter(
        lesson=lesson,
        is_active=True,
        change_requested_by=request.user,
        change_status="pending"
    ).first()

    if not pairing:
        return Response({"error": "No pending change request found."}, status=400)

    pairing.change_status = "none"
    pairing.change_requested_by = None
    pairing.save(update_fields=["change_status", "change_requested_by"])

    return Response({"message": "Partner change request cancelled.", "change_status": "none"})

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def pair_quick_match(request, lesson_id):
    """Match student with an available classmate for this lesson."""
    lesson = get_object_or_404(Lesson, id=lesson_id)
    course = lesson.module.course
    action = request.data.get("action", "join")

    if action == "cancel":
        LessonPairRequest.objects.filter(
            lesson=lesson,
            sender=request.user,
            status="pending"
        ).delete()
        return Response({"cancelled": True, "message": "Quick match cancelled."})

    existing = LessonPairing.objects.filter(
        lesson=lesson,
        is_active=True
    ).filter(Q(host_student=request.user) | Q(partner_student=request.user)).first()
    if existing:
        return Response({"error": "You already have an active partner for this lesson."}, status=400)

    cohort = request.user.enrolled_cohorts.filter(course=course).first()

    match_query = LessonPairRequest.objects.filter(
        lesson=lesson,
        is_open_match=True,
        status="pending"
    ).exclude(sender=request.user)

    if cohort:
        waiting_req = match_query.filter(cohort=cohort).first() or match_query.first()
    else:
        waiting_req = match_query.first()

    if waiting_req:
        partner_user = waiting_req.sender
        new_pairing = LessonPairing.objects.create(
            lesson=lesson,
            host_student=partner_user,
            partner_student=request.user,
            current_driver=partner_user,
            instructor_assigned=False,
            is_active=True
        )
        waiting_req.status = "accepted"
        waiting_req.save(update_fields=["status"])
        LessonPairRequest.objects.filter(lesson=lesson, sender=request.user, status="pending").delete()

        return Response({
            "matched": True,
            "pairing_id": new_pairing.id,
            "partner_id": partner_user.id,
            "partner_name": partner_user.get_full_name() or partner_user.username,
        })
    else:
        req_obj, _ = LessonPairRequest.objects.get_or_create(
            lesson=lesson,
            sender=request.user,
            defaults={"cohort": cohort, "is_open_match": True, "status": "pending"}
        )
        req_obj.is_open_match = True
        req_obj.status = "pending"
        req_obj.cohort = cohort
        req_obj.save()
        return Response({
            "matched": False,
            "waiting": True,
            "message": "Looking for an available classmate...",
        })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def pair_code_action(request, lesson_id):
    """Generate or join via a 4-digit code."""
    import random
    lesson = get_object_or_404(Lesson, id=lesson_id)
    course = lesson.module.course
    action = request.data.get("action")

    if action == "generate":
        existing = LessonPairing.objects.filter(
            lesson=lesson,
            is_active=True
        ).filter(Q(host_student=request.user) | Q(partner_student=request.user)).first()
        if existing:
            return Response({"error": "You already have an active partner for this lesson."}, status=400)

        code = str(random.randint(1000, 9999))
        cohort = request.user.enrolled_cohorts.filter(course=course).first()
        LessonPairRequest.objects.filter(lesson=lesson, sender=request.user, status="pending").delete()
        LessonPairRequest.objects.create(
            lesson=lesson,
            sender=request.user,
            cohort=cohort,
            pair_code=code,
            is_open_match=False,
            status="pending"
        )
        return Response({"code": code, "message": "Code generated. Share this 4-digit code with your classmate."})

    elif action == "join":
        code = str(request.data.get("code", "")).strip()
        if not code:
            return Response({"error": "Pair code is required."}, status=400)

        existing = LessonPairing.objects.filter(
            lesson=lesson,
            is_active=True
        ).filter(Q(host_student=request.user) | Q(partner_student=request.user)).first()
        if existing:
            return Response({"error": "You already have an active partner for this lesson."}, status=400)

        match_req = LessonPairRequest.objects.filter(
            lesson=lesson,
            pair_code=code,
            status="pending"
        ).exclude(sender=request.user).first()

        if not match_req:
            return Response({"error": "Invalid or expired pair code."}, status=404)

        partner_user = match_req.sender
        new_pairing = LessonPairing.objects.create(
            lesson=lesson,
            host_student=partner_user,
            partner_student=request.user,
            current_driver=partner_user,
            pair_code=code,
            instructor_assigned=False,
            is_active=True
        )
        match_req.status = "accepted"
        match_req.save(update_fields=["status"])
        LessonPairRequest.objects.filter(lesson=lesson, sender=request.user, status="pending").delete()

        return Response({
            "matched": True,
            "pairing_id": new_pairing.id,
            "partner_id": partner_user.id,
            "partner_name": partner_user.get_full_name() or partner_user.username,
        })

    elif action == "cancel":
        LessonPairRequest.objects.filter(lesson=lesson, sender=request.user, status="pending").delete()
        return Response({"cancelled": True, "message": "Code cancelled."})

    return Response({"error": "Invalid action."}, status=400)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def pair_invite_action(request, lesson_id):
    """Invite a classmate directly or respond to an invitation."""
    lesson = get_object_or_404(Lesson, id=lesson_id)
    course = lesson.module.course
    action = request.data.get("action", "invite")

    if action == "invite":
        recipient_id = request.data.get("recipient_id")
        if not recipient_id:
            return Response({"error": "recipient_id is required."}, status=400)
        recipient = get_object_or_404(User, id=recipient_id)
        if recipient == request.user:
            return Response({"error": "Cannot pair with yourself."}, status=400)

        existing = LessonPairing.objects.filter(
            lesson=lesson,
            is_active=True
        ).filter(Q(host_student=request.user) | Q(partner_student=request.user)).first()
        if existing:
            return Response({"error": "You already have an active partner for this lesson."}, status=400)

        cohort = request.user.enrolled_cohorts.filter(course=course).first()
        LessonPairRequest.objects.filter(lesson=lesson, sender=request.user, recipient=recipient, status="pending").delete()
        LessonPairRequest.objects.create(
            lesson=lesson,
            sender=request.user,
            recipient=recipient,
            cohort=cohort,
            status="pending"
        )
        return Response({"message": f"Invitation sent to {recipient.get_full_name() or recipient.username}."})

    elif action == "accept":
        request_id = request.data.get("request_id")
        pair_req = get_object_or_404(LessonPairRequest, id=request_id, recipient=request.user, status="pending")
        partner_user = pair_req.sender

        new_pairing = LessonPairing.objects.create(
            lesson=lesson,
            host_student=partner_user,
            partner_student=request.user,
            current_driver=partner_user,
            instructor_assigned=False,
            is_active=True
        )
        pair_req.status = "accepted"
        pair_req.save(update_fields=["status"])
        LessonPairRequest.objects.filter(lesson=lesson, sender=request.user, status="pending").delete()

        return Response({
            "matched": True,
            "pairing_id": new_pairing.id,
            "partner_id": partner_user.id,
            "partner_name": partner_user.get_full_name() or partner_user.username,
        })

    elif action == "decline":
        request_id = request.data.get("request_id")
        pair_req = get_object_or_404(LessonPairRequest, id=request_id, recipient=request.user, status="pending")
        pair_req.status = "declined"
        pair_req.save(update_fields=["status"])
        return Response({"message": "Invitation declined."})

    return Response({"error": "Invalid action."}, status=400)


from rest_framework.pagination import PageNumberPagination
from django.db.models import Q

class CourseEnrollmentsPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class CourseEnrollmentsAPIView(generics.ListAPIView):
    """
    List all enrollments for a specific course.
    Only accessible by staff or instructors.
    Supports searching by student name or email.
    """
    serializer_class = CourseEnrollmentSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = CourseEnrollmentsPagination

    def get_queryset(self):
        user = self.request.user
        course_id = self.kwargs.get('course_id')
        
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound("Course not found")
            
        is_staff_or_instructor = (
            user.is_superuser or 
            user.is_staff or 
            user.groups.filter(name='Instructors').exists() or 
            course.assigned_instructor_id == user.id or
            course.owner_id == user.id or
            course.cohorts.filter(instructors=user).exists()
        )
        
        if not is_staff_or_instructor:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You do not have permission to view enrollments for this course.")
            
        queryset = Enrollment.objects.filter(course_id=course_id).select_related('user', 'course', 'user__profile').prefetch_related('user__enrolled_cohorts')
        
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(user__username__icontains=search) |
                Q(user__email__icontains=search)
            )
            
        return queryset

@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def course_classmates(request, slug):
    try:
        course = Course.objects.get(slug=slug)
    except Course.DoesNotExist:
        return Response({"error": "Course not found."}, status=404)

    user = request.user
    cohort_id = request.query_params.get("cohort_id") or request.data.get("cohort_id")
    lesson_id = request.query_params.get("lesson_id")

    is_course_admin = (
        user.is_superuser
        or user.is_staff
        or course.assigned_instructor_id == user.id
    )
    is_instructor = is_course_admin or user.groups.filter(name="Instructors").exists() or course.cohorts.filter(instructors=user).exists()

    if is_course_admin:
        cohorts = course.cohorts.all()
    elif user.groups.filter(name="Instructors").exists() or course.cohorts.filter(instructors=user).exists():
        # Instructors only see cohorts they are allocated to
        cohorts = course.cohorts.filter(instructors=user).distinct()
        if not cohorts.exists():
            cohorts = course.cohorts.all()
    else:
        cohorts = user.enrolled_cohorts.filter(course=course)
        if not cohorts.exists():
            active_c = course.cohorts.first()
            if active_c:
                active_c.students.add(user)
                cohorts = user.enrolled_cohorts.filter(course=course)
            else:
                from datetime import timedelta
                from django.utils import timezone
                active_c = Cohort.objects.create(
                    course=course,
                    name=f"{course.title[:30]} Cohort 1",
                    start_date=timezone.localdate(),
                    end_date=timezone.localdate() + timedelta(days=90),
                    allow_students_to_see_classmates=True,
                    show_classmate_xps=True,
                )
                active_c.students.add(user)
                cohorts = user.enrolled_cohorts.filter(course=course)

    if cohort_id:
        cohorts = cohorts.filter(id=cohort_id)
    elif not is_instructor and cohorts.count() > 1:
        first_cohort = cohorts.first()
        cohorts = cohorts.filter(id=first_cohort.id)

    if request.method == "PATCH":
        if not is_instructor:
            return Response({"error": "Only instructors can change cohort settings."}, status=403)
        if not cohort_id:
            return Response({"error": "cohort_id is required."}, status=400)
        target = cohorts.first()
        if not target:
            return Response({"error": "Cohort not found."}, status=404)
        update_fields = []
        if "allow_students_to_see_classmates" in request.data:
            target.allow_students_to_see_classmates = bool(request.data.get("allow_students_to_see_classmates"))
            update_fields.append("allow_students_to_see_classmates")
        if "show_classmate_xps" in request.data:
            target.show_classmate_xps = bool(request.data.get("show_classmate_xps"))
            update_fields.append("show_classmate_xps")
        if update_fields:
            target.save(update_fields=update_fields)
        return Response({
            "allow_students_to_see_classmates": target.allow_students_to_see_classmates,
            "show_classmate_xps": target.show_classmate_xps,
        })

    classmates = set()
    visibility_enabled = False
    for cohort in cohorts:
        if cohort.allow_students_to_see_classmates:
            visibility_enabled = True
        if not is_instructor and not cohort.allow_students_to_see_classmates:
            continue
        for student in cohort.students.all():
            if student != user:
                classmates.add(student)

    if not classmates and not is_instructor:
        if not visibility_enabled:
            return Response({"error": "Classmates visibility is disabled for your cohort(s)."}, status=403)

    from django.utils import timezone
    from datetime import timedelta
    from .models import VideoProgress, UserXP, StudentAttendance, Enrollment
    from .utils import user_display_name
    from django.db.models import Count, Prefetch

    now = timezone.now()
    today = timezone.localdate()
    five_mins_ago = now - timedelta(minutes=5)
    cohort_ids = list(cohorts.values_list("id", flat=True))
    classmate_ids = [s.id for s in classmates]

    present_today_ids = set(
        StudentAttendance.objects.filter(
            cohort_id__in=cohort_ids,
            date=today,
            is_present=True,
            student_id__in=classmate_ids,
        ).values_list("student_id", flat=True)
    ) if classmate_ids and cohort_ids else set()

    completed_map = {}
    if classmate_ids:
        for row in (
            Enrollment.objects.filter(user_id__in=classmate_ids, course=course)
            .annotate(done=Count("completed_lessons"))
            .values("user_id", "done")
        ):
            completed_map[row["user_id"]] = row["done"]

    # Cohort-scoped XP retrieval - strictly isolated to target cohort
    target_cohort = cohorts.first() if (cohort_id or cohorts.count() == 1) else None
    all_query_ids = list(classmate_ids)
    if user.id not in all_query_ids:
        all_query_ids.append(user.id)

    from .xp_utils import sum_course_xp, xp_level_from_total

    if target_cohort and all_query_ids:
        xp_map = {
            uid: sum_course_xp(uid, course.id, cohort=target_cohort)
            for uid in all_query_ids
        }
    elif all_query_ids:
        xp_map = {
            uid: sum_course_xp(uid, course.id, cohort=None)
            for uid in all_query_ids
        }
    else:
        xp_map = {}

    can_see_xps = is_instructor or any(c.show_classmate_xps for c in cohorts)

    from django.contrib.auth import get_user_model
    from .utils import resolve_user_avatar_url
    UserModel = get_user_model()
    classmates_qs = (
        UserModel.objects.filter(id__in=classmate_ids)
        .select_related("profile")
        .prefetch_related("socialaccount_set")
    )
    classmates_by_id = {u.id: u for u in classmates_qs}
    # Preserve original set iteration order via sorted ids for stable UI
    ordered_classmates = [classmates_by_id[i] for i in classmate_ids if i in classmates_by_id]

    data = []
    for student in ordered_classmates:
        avatar_url = resolve_user_avatar_url(student, request=request)
        is_active = False
        if lesson_id:
            progress = VideoProgress.objects.filter(user=student, lesson_id=lesson_id).first()
            if progress and progress.last_watched_at and progress.last_watched_at > five_mins_ago:
                is_active = True

        earned_xp = xp_map.get(student.id, 0)
        # XP Privacy: Students only see their own XP unless instructor enabled show_classmate_xps
        if is_instructor or can_see_xps or student.id == user.id:
            xp_level = xp_level_from_total(earned_xp)
            total_xp = earned_xp
        else:
            xp_level = None
            total_xp = None

        full_name = user_display_name(student)

        gender = None
        middle_name = ""
        class_stream = ""
        try:
            if student.profile.gender:
                gender = student.profile.get_gender_display()
            middle_name = student.profile.middle_name or ""
            class_stream = student.profile.class_stream or ""
        except Exception:
            pass

        prof = getattr(student, "profile", None)
        ls = getattr(prof, "last_seen", None) if prof else None
        is_online = bool(ls and ls >= (timezone.now() - timedelta(seconds=120)))

        from api.utils import user_is_verified
        row = {
            "id": student.id,
            "first_name": student.first_name,
            "last_name": student.last_name,
            "middle_name": middle_name,
            "full_name": full_name,
            "username": student.username,
            "avatar": avatar_url,
            "is_active": is_active,
            "is_online": is_online,
            "is_verified": user_is_verified(student),
            "last_seen": ls.isoformat() if ls else None,
            "is_present_today": student.id in present_today_ids,
            "xp_level": xp_level,
            "total_xp": total_xp,
            "completed_lessons": completed_map.get(student.id, 0),
        }
        if is_instructor:
            row.update({
                "email": student.email,
                "gender": gender,
                "class_stream": class_stream,
            })
        data.append(row)

    data.sort(key=lambda x: (x.get("full_name") or x["username"]).lower())

    org_obj = None
    if target_cohort and target_cohort.organization:
        org_obj = target_cohort.organization
    else:
        for c in cohorts:
            if c.organization:
                org_obj = c.organization
                break

    org_data = None
    if org_obj:
        logo_url = None
        if org_obj.logo:
            try:
                logo_url = request.build_absolute_uri(org_obj.logo.url)
            except Exception:
                logo_url = org_obj.logo.url
        org_data = {
            "id": org_obj.id,
            "name": org_obj.name,
            "logo": logo_url,
            "org_type": org_obj.org_type,
        }

    return Response({
        "classmates": data,
        "organization": org_data,
        "cohort_name": target_cohort.name if target_cohort else (cohorts.first().name if cohorts.exists() else None),
        "allow_students_to_see_classmates": visibility_enabled,
        "show_classmate_xps": any(c.show_classmate_xps for c in cohorts),
        "is_instructor": is_instructor,
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def unenroll_course(request, slug):
    course = get_object_or_404(Course, slug=slug)
    enrollment = Enrollment.objects.filter(user=request.user, course=course).first()
    if not enrollment:
        return Response({"error": "Not enrolled."}, status=400)
    enrollment.is_active = False
    enrollment.save()
    return Response({"status": "Unenrolled successfully."})
