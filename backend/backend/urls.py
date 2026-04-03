from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def home(request):
    return JsonResponse({"status": "Backend is Running", "message": "Visit http://localhost:3000 for the AI Website Auto-Fixer UI"})

urlpatterns = [
    path('', home), # Root URL
    path('admin/', admin.site.urls),
    path('api/', include('analyzer.urls')), # This connects your app to the URL
]