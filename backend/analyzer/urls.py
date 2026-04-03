from django.urls import path
from .views import analyze_website, get_scan_history, chatbot_query, export_website

urlpatterns = [
    path('analyze/', analyze_website),
    path('history/', get_scan_history),
    path('chat/', chatbot_query),
    path('export/', export_website),
]