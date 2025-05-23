from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """사용자 관리"""
    list_display = ['username', 'email', 'character_name', 'server', 'is_staff', 'is_active']
    list_filter = ['is_staff', 'is_active', 'server']
    search_fields = ['username', 'email', 'character_name']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('FF14 정보', {
            'fields': ('character_name', 'server')
        }),
        ('프로필', {
            'fields': ('profile_image', 'bio')
        }),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('FF14 정보', {
            'fields': ('character_name', 'server')
        }),
    )