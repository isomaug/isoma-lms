from .models import Institution

RESERVED_SUBDOMAINS = {"www", "cloud", "billing", "cname", "api"}


class TenantResolutionMiddleware:
    """
    Resolves Tier 1 (isomaug.com Root Super Account) vs Tier 2 Client Tenants
    (learn.isomaug.com, *.isomaug.com, custom domains, or ?tenant=<slug> in local dev).
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        host = request.get_host().split(":")[0].lower()
        dev_tenant = (
            request.GET.get("tenant")
            or request.headers.get("X-Isoma-Tenant")
            or ""
        ).strip().lower()

        tenant = None
        is_root_platform = False

        try:
            if dev_tenant:
                tenant = Institution.objects.filter(subdomain=dev_tenant).first()
            elif host in ("isomaug.com", "www.isomaug.com"):
                is_root_platform = True
            elif host in ("localhost", "127.0.0.1"):
                is_root_platform = True
                tenant = Institution.objects.filter(subdomain="learn").first()
            elif host.endswith(".isomaug.com"):
                sub = host.replace(".isomaug.com", "")
                if sub not in RESERVED_SUBDOMAINS:
                    tenant = Institution.objects.filter(subdomain=sub).first()
            else:
                tenant = Institution.objects.filter(custom_domain__iexact=host).first()
        except Exception:
            tenant = None

        request.is_root_platform = is_root_platform
        request.tenant = tenant
        return self.get_response(request)
