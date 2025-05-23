from rest_framework import serializers
from .models import (
    Raid, RaidGroup, Job, Player, ItemType, Item, Currency,
    EquipmentSet, Equipment, ItemDistribution, RaidSchedule, CurrencyRequirement
)
from accounts.serializers import UserSerializer

class JobSerializer(serializers.ModelSerializer):
    """직업 시리얼라이저"""
    class Meta:
        model = Job
        fields = ['id', 'name', 'role', 'icon']

class RaidSerializer(serializers.ModelSerializer):
    """레이드 시리얼라이저"""
    class Meta:
        model = Raid
        fields = ['id', 'name', 'tier', 'patch', 'min_ilvl', 'max_ilvl',
                  'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class PlayerSerializer(serializers.ModelSerializer):
    """공대원 시리얼라이저"""
    user = UserSerializer(read_only=True)
    job = JobSerializer(read_only=True)
    job_id = serializers.PrimaryKeyRelatedField(
        queryset=Job.objects.all(), source='job', write_only=True
    )
    
    class Meta:
        model = Player
        fields = ['id', 'user', 'raid_group', 'job', 'job_id',
                  'character_name', 'item_level', 'is_active', 'joined_at']
        read_only_fields = ['joined_at']

class RaidGroupSerializer(serializers.ModelSerializer):
    """공대 시리얼라이저"""
    leader = UserSerializer(read_only=True)
    raid = RaidSerializer(read_only=True)
    raid_id = serializers.PrimaryKeyRelatedField(
        queryset=Raid.objects.all(), source='raid', write_only=True
    )
    players = PlayerSerializer(many=True, read_only=True)
    player_count = serializers.SerializerMethodField()
    
    class Meta:
        model = RaidGroup
        fields = ['id', 'name', 'raid', 'raid_id', 'leader',
                  'distribution_method', 'is_active', 'players',
                  'player_count', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_player_count(self, obj):
        return obj.players.filter(is_active=True).count()

class ItemTypeSerializer(serializers.ModelSerializer):
    """아이템 종류 시리얼라이저"""
    class Meta:
        model = ItemType
        fields = ['id', 'name', 'slot', 'order']

class CurrencySerializer(serializers.ModelSerializer):
    """재화 시리얼라이저"""
    class Meta:
        model = Currency
        fields = ['id', 'name', 'raid', 'weekly_limit']

class CurrencyRequirementSerializer(serializers.ModelSerializer):
    """재화 요구사항 시리얼라이저"""
    currency = CurrencySerializer(read_only=True)
    
    class Meta:
        model = CurrencyRequirement
        fields = ['id', 'currency', 'amount']

class ItemSerializer(serializers.ModelSerializer):
    """아이템 시리얼라이저"""
    item_type = ItemTypeSerializer(read_only=True)
    item_type_id = serializers.PrimaryKeyRelatedField(
        queryset=ItemType.objects.all(), source='item_type', write_only=True
    )
    job_restrictions = JobSerializer(many=True, read_only=True)
    currency_requirements = CurrencyRequirementSerializer(many=True, read_only=True)
    
    class Meta:
        model = Item
        fields = ['id', 'name', 'item_type', 'item_type_id', 'item_level',
                  'raid', 'floor', 'is_weapon', 'job_restrictions',
                  'currency_requirements']

class EquipmentSerializer(serializers.ModelSerializer):
    """장비 시리얼라이저"""
    item = ItemSerializer(read_only=True)
    item_id = serializers.PrimaryKeyRelatedField(
        queryset=Item.objects.all(), source='item', write_only=True
    )
    
    class Meta:
        model = Equipment
        fields = ['id', 'equipment_set', 'item', 'item_id', 'is_pentamelded']

class EquipmentSetSerializer(serializers.ModelSerializer):
    """장비 세트 시리얼라이저"""
    player = PlayerSerializer(read_only=True)
    equipments = EquipmentSerializer(many=True, read_only=True)
    item_level = serializers.SerializerMethodField()
    
    class Meta:
        model = EquipmentSet
        fields = ['id', 'player', 'set_type', 'equipments',
                  'item_level', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_item_level(self, obj):
        return obj.calculate_item_level()

class ItemDistributionSerializer(serializers.ModelSerializer):
    """아이템 분배 시리얼라이저"""
    player = PlayerSerializer(read_only=True)
    player_id = serializers.PrimaryKeyRelatedField(
        queryset=Player.objects.all(), source='player', write_only=True
    )
    item = ItemSerializer(read_only=True)
    item_id = serializers.PrimaryKeyRelatedField(
        queryset=Item.objects.all(), source='item', write_only=True
    )
    
    class Meta:
        model = ItemDistribution
        fields = ['id', 'raid_group', 'player', 'player_id',
                  'item', 'item_id', 'distributed_at', 'week_number', 'notes']

class RaidScheduleSerializer(serializers.ModelSerializer):
    """레이드 일정 시리얼라이저"""
    created_by = UserSerializer(read_only=True)
    
    class Meta:
        model = RaidSchedule
        fields = ['id', 'raid_group', 'title', 'weekday', 'start_time',
                  'end_time', 'is_recurring', 'description', 'created_by',
                  'created_at', 'updated_at']
        read_only_fields = ['created_by', 'created_at', 'updated_at']

class PlayerCreateSerializer(serializers.ModelSerializer):
    """공대원 생성 시리얼라이저"""
    class Meta:
        model = Player
        fields = ['raid_group', 'job', 'character_name', 'item_level']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class EquipmentBulkCreateSerializer(serializers.Serializer):
    """장비 일괄 생성 시리얼라이저"""
    equipment_set_id = serializers.IntegerField()
    items = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField()
        )
    )
    
    def validate_equipment_set_id(self, value):
        try:
            EquipmentSet.objects.get(id=value)
        except EquipmentSet.DoesNotExist:
            raise serializers.ValidationError("장비 세트를 찾을 수 없습니다.")
    
    def create(self, validated_data):
        equipment_set = EquipmentSet.objects.get(id=validated_data['equipment_set_id'])
        created_equipments = []
        
        for item_data in validated_data['items']:
            item_id = item_data.get('item_id')
            is_pentamelded = item_data.get('is_pentamelded', False)
            
            equipment, created = Equipment.objects.update_or_create(
                equipment_set=equipment_set,
                item_id=item_id,
                defaults={'is_pentamelded': is_pentamelded}
            )
            created_equipments.append(equipment)
        
        return created_equipments