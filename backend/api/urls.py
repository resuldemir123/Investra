
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AnalysisViewSet, register, login_view, logout_view, analyze_startup, market_intelligence

router = DefaultRouter()
router.register(r'analyses', AnalysisViewSet, basename='analysis')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', register, name='register'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('analyze/', analyze_startup, name='analyze'),
    path('market-intel/', market_intelligence, name='market_intelligence'),
]
