from .models import UserSubscription


def get_ai_entitlement(user):
    is_privileged = bool(user and (user.is_staff or user.is_superuser))
    subscription = None
    if user and user.is_authenticated:
        subscription = UserSubscription.objects.filter(user=user).first()
    is_pro = is_privileged or bool(subscription and subscription.is_valid())
    return {
        "is_pro": is_pro,
        "plan": subscription.plan if subscription and subscription.is_valid() else None,
        "expires_at": (
            subscription.expires_at.isoformat()
            if subscription and subscription.is_valid()
            else None
        ),
        "capabilities": {
            "ai_chat": True,
            "image_generate": is_pro,
            "image_edit": is_pro,
            "downloads": is_pro,
            "document_export": is_pro,
        },
    }
