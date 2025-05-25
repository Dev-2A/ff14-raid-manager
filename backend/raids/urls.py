from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'raids'

router = DefaultRouter()
router.register(r'groups', views.RaidGroupViewSet)
router.register(r'jobs', views.JobViewSet)
router.register(r'players', views.PlayerViewSet)
router.register(r'item-types', views.ItemTypeViewSet)
router.register(r'items', views.ItemViewSet)
router.register(r'currencies', views.CurrencyViewSet)
router.register(r'equipment-sets', views.EquipmentSetViewSet)
router.register(r'distributions', views.ItemDistributionViewSet)
router.register(r'schedules', views.RaidScheduleViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('calculate-currency-needs/', views.calculate_currency_needs, name='calculate_currency_needs'),
    path('calculate-distribution-priority/', views.calculate_distribution_priority, name='calculate_distribution_priority'),
]