from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()

class Raid(models.Model):
    """레이드 정보"""
    name = models.CharField(max_length=100, verbose_name='레이드명')
    tier = models.CharField(max_length=20, verbose_name='난이도') # 예: 영웅
    patch = models.CharField(max_length=10, verbose_name='패치') # 예: 7.0
    min_ilvl = models.IntegerField(verbose_name='최소 아이템레벨')
    max_ilvl = models.IntegerField(verbose_name='최대 아이템레벨')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = '레이드'
        verbose_name_plural = '레이드 목록'
        db_table = 'raids'
    
    def __str__(self):
        return f"{self.name} ({self.tier})"

class RaidGroup(models.Model):
    """공대 정보"""
    DISTRIBUTION_CHOICES = [
        ('priority', '우선순위 분배'),
        ('rotation', '먹고 빠지기'),
    ]
    
    name = models.CharField(max_length=100, verbose_name='공대명')
    raid = models.ForeignKey(Raid, on_delete=models.CASCADE, related_name='groups', verbose_name='레이드')
    leader = models.ForeignKey(User, on_delete=models.CASCADE, related_name='led_groups', verbose_name='공대장')
    distribution_method = models.CharField(max_length=20, choices=DISTRIBUTION_CHOICES, default='priority', verbose_name='분배 방식')
    is_active = models.BooleanField(default=True, verbose_name='활성 상태')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = '공대'
        verbose_name_plural = '공대 목록'
        db_table = 'raid_groups'
    
    def __str__(self):
        return f"{self.name} = {self.raid.name}"

class Job(models.Model):
    """직업 정보"""
    ROLE_CHOICES = [
        ('tank', '탱커'),
        ('healer', '힐러'),
        ('melee', '근딜'),
        ('ranged', '원딜'),
        ('caster', '캐스터'),
    ]
    
    name = models.CharField(max_length=30, unique=True, verbose_name='직업명')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, verbose_name='역할')
    icon = models.CharField(max_length=100, blank=True, verbose_name='아이콘')
    
    class Meta:
        verbose_name = '직업'
        verbose_name_plural = '직업 목록'
        db_table = 'jobs'
    
    def __str__(self):
        return self.name

class Player(models.Model):
    """공대원 정보"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player_profiles', verbose_name='사용자')
    raid_group = models.ForeignKey(RaidGroup, on_delete=models.CASCADE, related_name='players', verbose_name='공대')
    job = models.ForeignKey(Job, on_delete=models.SET_NULL, null=True, verbose_name='직업')
    character_name = models.CharField(max_length=50, verbose_name='캐릭터명')
    item_level = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(999)], verbose_name='아이템레벨')
    is_active = models.BooleanField(default=True, verbose_name='활성 상태')
    joined_at = models.DateTimeField(auto_now_add=True, verbose_name='가입일')
    
    class Meta:
        verbose_name = '공대원'
        verbose_name_plural = '공대원 목록'
        db_table = 'players'
        unique_together = ['user', 'raid_group']
    
    def __str__(self):
        return f"{self.character_name} ({self.job.name if self.job else 'N/A'})"

class ItemType(models.Model):
    """아이템 종류"""
    name = models.CharField(max_length=30, unique=True, verbose_name='종류명')
    slot = models.CharField(max_length=30, verbose_name='장착 부위')
    order = models.IntegerField(default=0, verbose_name='정렬 순서')
    
    class Meta:
        verbose_name = '아이템 종류'
        verbose_name_plural = '아이템 종류 목록'
        db_table = 'item_types'
        ordering = ['order']
    
    def __str__(self):
        return self.name

class Item(models.Model):
    """아이템 정보"""
    name = models.CharField(max_length=100, verbose_name='아이템명')
    item_type = models.ForeignKey(ItemType, on_delete=models.CASCADE, related_name='items', verbose_name='종류')
    item_level = models.IntegerField(verbose_name='아이템레벨')
    raid = models.ForeignKey(Raid, on_delete=models.CASCADE, related_name='items', verbose_name='획득처')
    floor = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(4)], verbose_name='층')
    is_weapon = models.BooleanField(default=False, verbose_name='무기 여부')
    job_restrictions = models.ManyToManyField(Job, blank=True, related_name='restricted_items', verbose_name='직업 제한')
    
    class Meta:
        verbose_name = '아이템'
        verbose_name_plural = '아이템 목록'
        db_table = 'items'
    
    def __str__(self):
        return f"{self.name} (IL{self.item_level})"

class Currency(models.Model):
    """재화 정보"""
    name = models.CharField(max_length=50, unique=True, verbose_name='재화명')
    raid = models.ForeignKey(Raid, on_delete=models.CASCADE, related_name='currencies', verbose_name='관련 레이드')
    weekly_limit = models.IntegerField(default=0, verbose_name='주간 제한')
    
    class Meta:
        verbose_name = '재화'
        verbose_name_plural = '재화 목록'
        db_table = 'currencies'
    
    def __str__(self):
        return self.name

class EquipmentSet(models.Model):
    """장비 세트"""
    SET_TYPE_CHOICES = [
        ('start', '출발 세트'),
        ('current', '현재 세트'),
        ('target', '최종 세트'),
    ]
    
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='equipment_sets', verbose_name='플레이어')
    set_type = models.CharField(max_length=10, choices=SET_TYPE_CHOICES, verbose_name='세트 종류')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = '장비 세트'
        verbose_name_plural = '장비 세트 목록'
        db_table = 'equipment_sets'
        unique_together = ['player', 'set_type']
    
    def __str__(self):
        return f"{self.player.character_name} - {self.get_set_type_display()}"
    
    def calculate_item_level(self):
        """평균 아이템레벨 계산"""
        equipments = self.equipments.all()
        if not equipments:
            return 0
        
        total_ilvl = 0
        count = 0
        for eq in equipments:
            # 무기는 2배 가중치
            if eq.item.is_weapon:
                total_ilvl += eq.item.item_level * 2
                count += 2
            else:
                total_ilvl += eq.item.item_level
                count += 1
        
        return round(total_ilvl / count) if count > 0 else 0

class Equipment(models.Model):
    """장비 세트의 개별 장비"""
    equipment_set = models.ForeignKey(EquipmentSet, on_delete=models.CASCADE, related_name='equipments', verbose_name='장비 세트')
    item = models.ForeignKey(Item, on_delete=models.CASCADE, verbose_name='아이템')
    is_pentamelded = models.BooleanField(default=False, verbose_name='금단 여부')
    
    class Meta:
        verbose_name = '장비'
        verbose_name_plural = '장비 목록'
        db_table = 'equipments'
        unique_together = ['equipment_set', 'item']
    
    def __str__(self):
        return f"{self.equipment_set} - {self.item.name}"

class ItemDistribution(models.Model):
    """아이템 분배 기록"""
    raid_group = models.ForeignKey(RaidGroup, on_delete=models.CASCADE, related_name='distributions', verbose_name='공대')
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='received_items', verbose_name='획득자')
    item = models.ForeignKey(Item, on_delete=models.CASCADE, verbose_name='아이템')
    distributed_at = models.DateTimeField(verbose_name='분배일시')
    week_number = models.IntegerField(verbose_name='주차')
    notes = models.TextField(blank=True, verbose_name='메모')
    
    class Meta:
        verbose_name = '아이템 분배'
        verbose_name_plural = '아이템 분배 기록'
        db_table = 'item_distributions'
    
    def __str__(self):
        return f"{self.player.character_name} = {self.item.name} ({self.week_number}주차)"

class RaidSchedule(models.Model):
    """레이드 일정"""
    WEEKDAY_CHOICES = [
        (0, '월요일'),
        (1, '화요일'),
        (2, '수요일'),
        (3, '목요일'),
        (4, '금요일'),
        (5, '토요일'),
        (6, '일요일'),
    ]
    
    raid_group = models.ForeignKey(RaidGroup, on_delete=models.CASCADE, related_name='schedules', verbose_name='공대')
    title = models.CharField(max_length=100, verbose_name='일정명')
    weekday = models.IntegerField(choices=WEEKDAY_CHOICES, verbose_name='요일')
    start_time = models.TimeField(verbose_name='시작 시간')
    end_time = models.TimeField(verbose_name='종료 시간')
    is_recurring = models.BooleanField(default=True, verbose_name='반복 여부')
    description = models.TextField(blank=True, verbose_name='설명')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='작성자')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = '레이드 일정'
        verbose_name_plural = '레이드 일정 목록'
        db_table = 'raid_schedules'
        ordering = ['weekday', 'start_time']
    
    def __str__(self):
        return f"{self.raid_group.name} - {self.get_weekday_display()} {self.start_time}"

class CurrencyRequirement(models.Model):
    """아이템 구매에 필요한 재화"""
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='currency_requirements', verbose_name='아이템')
    currency = models.ForeignKey(Currency, on_delete=models.CASCADE, verbose_name='재화')
    amount = models.IntegerField(verbose_name='필요량')
    
    class Meta:
        verbose_name = '재화 요구사항'
        verbose_name_plural = '재화 요구사항 목록'
        db_table = 'currency_requirements'
        unique_together = ['item', 'currency']
    
    def __str__(self):
        return f"{self.item.name} - {self.currency.name}: {self.amount}개"