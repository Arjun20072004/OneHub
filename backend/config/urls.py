from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from django.http import JsonResponse


def api_root(request):
    return JsonResponse({
        "Welcome": "App is Working."
    })

urlpatterns = [
    path("", api_root, name="api-root"),

    path(
        "admin/",
        admin.site.urls,
    ),

    path(
        "api/auth/",
        include(
            "apps.authentication.urls"
        ),
    ),

    path(
        "api/providers/",
        include(
            "apps.providers.urls"
        ),
    ),

    path(
        "api/orders/",
        include(
            "apps.orders.urls"
        ),
    ),

    path(
        "api/food/",
        include(
            "apps.food.urls"
        ),
    ),

    path(
        "api/notifications/",
        include(
            "apps.notifications.urls"
        ),
    ),
]


if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )