from django.contrib import admin
from .models import (
    Raid, RaidGroup, Job, Player, ItemType, Item, Currency,
    EquipmentSet, Equipment, ItemDistribution, RaidSchedule, CurrencyRequirement
)

@admin.register(Raid)
class RaidAdmin(admin.ModelAdmin):
    list_display = ['name', 'tier', 'patch', 'min_ilvl', 'max_ilvl', 'created_at']
    list_filter = ['tier', 'patch']
    search_fields = ['name']

@admin.register(RaidGroup)
class RaidGroupAdmin(admin.ModelAdmin):
    list_display = ['name', 'raid', 'leader', 'distribution_method', 'is_active', 'created_at']
    list_filter = ['raid', 'distribution_method', 'is_active']
    search_fields = ['name', 'leader__username']
    raw_id_fields = ['leader']

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ['name', 'role', 'icon']
    list_filter = ['role']
    search_fields = ['name']
    ordering = ['role', 'name']

@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ['character_name', 'user', 'raid_group', 'job', 'item_level', 'is_active']
    list_filter = ['raid_group', 'job__role', 'is_active']
    search_fields = ['character_name', 'user__username']
    raw_id_fields = ['user']

@admin.register(ItemType)
class ItemTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'slot', 'order']
    search_fields = ['name', 'slot']
    ordering = ['order']

@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'item_type', 'item_level', 'raid', 'floor', 'is_weapon']
    list_filter = ['item_type', 'raid', 'floor', 'is_weapon']
    search_fields = ['name']
    filter_horizontal = ['job_restrictions']

@admin.register(Currency)
class CurrencyAdmin(admin.ModelAdmin):
    list_display = ['name', 'raid', 'weekly_limit']
    list_filter = ['raid']
    search_fields = ['name']

class EquipmentInline(admin.TabularInline):
    model = Equipment
    extra = 1
    raw_id_fields = ['item']

@admin.register(EquipmentSet)
class EquipmentSetAdmin(admin.ModelAdmin):
    list_display = ['player', 'set_type', 'get_item_level', 'created_at', 'updated_at']
    list_filter = ['set_type', 'player__raid_group']
    search_fields = ['player__character_name']
    inlines = [EquipmentInline]
    
    def get_item_level(self, obj):
        return obj.calculate_item_level()
    get_item_level.short_description = '아이템레벨'

@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ['equipment_set', 'item', 'is_pentamelded']
    list_filter = ['equipment_set__set_type', 'is_pentamelded']
    search_fields = ['item__name', 'equipment_set__player__character_name']
    raw_id_fields = ['equipment_set', 'item']

@admin.register(ItemDistribution)
class ItemDistributionAdmin(admin.ModelAdmin):
    list_display = ['player', 'item', 'distributed_at', 'week_number', 'raid_group']
    list_filter = ['raid_group', 'week_number', 'distributed_at']
    search_fields = ['player__character_name', 'item__name']
    date_hierarchy = 'distributed_at'
    raw_id_fields = ['player', 'item']

@admin.register(RaidSchedule)
class RaidScheduleAdmin(admin.ModelAdmin):
    list_display = ['title', 'raid_group', 'weekday', 'start_time', 'end_time', 'is_recurring']
    list_filter = ['raid_group', 'weekday', 'is_recurring']
    search_fields = ['title', 'description']

@admin.register(CurrencyRequirement)
class CurrencyRequirementAdmin(admin.ModelAdmin):
    list_display = ['item', 'currency', 'amount']
    list_filter = ['currency', 'item__item_type']
    search_fields = ['item__name', 'currency__name']
    raw_id_fields = ['item', 'currency']