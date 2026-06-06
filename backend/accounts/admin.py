from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('اطلاعات اختصاصی سیستم', {'fields': ('phone', 'role', 'is_available')}),
    )
    
    list_display = ['username', 'email', 'role', 'is_available', 'is_staff']
    
    list_filter = ['role', 'is_available', 'is_staff', 'is_active']

admin.site.register(User, CustomUserAdmin)