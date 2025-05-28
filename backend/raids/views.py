from rest_framework import viewsets, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Sum
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from datetime import datetime, timedelta
from .models import (
    Raid, RaidGroup, Job, Player, ItemType, Item, Currency,
    EquipmentSet, Equipment, ItemDistribution, RaidSchedule, CurrencyRequirement
)
from .serializers import (
    RaidSerializer, RaidGroupSerializer, JobSerializer, PlayerSerializer,
    ItemTypeSerializer, ItemSerializer, CurrencySerializer,
    EquipmentSetSerializer, EquipmentSerializer, ItemDistributionSerializer,
    RaidScheduleSerializer, PlayerCreateSerializer, EquipmentBulkCreateSerializer,
    CurrencyRequirementSerializer
)


class RaidViewSet(viewsets.ModelViewSet):
    """레이드 뷰셋"""
    queryset = Raid.objects.all()
    serializer_class = RaidSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = None  # 페이지네이션 비활성화


class RaidGroupViewSet(viewsets.ModelViewSet):
    """공대 뷰셋"""
    queryset = RaidGroup.objects.all()
    serializer_class = RaidGroupSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        # 공대 생성 시 생성자를 공대장으로 설정
        raid_group = serializer.save(leader=self.request.user)
        
        # 요청 데이터에서 공대장 정보 가져오기
        leader_job_id = self.request.data.get('leader_job_id')
        leader_character_name = self.request.data.get('leader_character_name')
        leader_item_level = self.request.data.get('leader_item_level')
        
        # 공대장을 첫 번째 공대원으로 추가
        if leader_job_id and leader_character_name and leader_item_level:
            Player.objects.create(
                user=self.request.user,
                raid_group=raid_group,
                job_id=leader_job_id,
                character_name=leader_character_name,
                item_level=leader_item_level
            )
        else:
            # 기본값으로 생성
            Player.objects.create(
                user=self.request.user,
                raid_group=raid_group,
                character_name=self.request.user.character_name or self.request.user.username,
                item_level=raid_group.raid.min_ilvl
            )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def join(self, request, pk=None):
        """공대 가입"""
        raid_group = self.get_object()
        
        # 활성화된 플레이어인지 확인
        existing_player = Player.objects.filter(
            user=request.user, 
            raid_group=raid_group
        ).first()
        
        if existing_player:
            if existing_player.is_active:
                return Response({'error': '이미 가입된 공대입니다.'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                # 비활성화된 플레이어가 있으면 재활성화
                existing_player.job_id = request.data.get('job_id')
                existing_player.character_name = request.data.get('character_name')
                existing_player.item_level = request.data.get('item_level')
                existing_player.is_active = True
                existing_player.save()
                return Response({'message': '공대에 재가입했습니다.'})
        
        # 8명 제한 확인
        if raid_group.players.filter(is_active=True).count() >= 8:
            return Response({'error': '공대가 가득 찼습니다.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # 새로운 플레이어 생성
        serializer = PlayerCreateSerializer(data={
            'raid_group': raid_group.id,
            'job': request.data.get('job_id'),
            'character_name': request.data.get('character_name'),
            'item_level': request.data.get('item_level'),
        }, context={'request': request})
        
        if serializer.is_valid():
            serializer.save(user=request.user, raid_group=raid_group)
            return Response({'message': '공대에 가입했습니다.'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def leave(self, request, pk=None):
        """공대 탈퇴"""
        raid_group = self.get_object()
        player = get_object_or_404(Player, user=request.user, raid_group=raid_group)
        
        # 공대장은 탈퇴 불가
        if raid_group.leader == request.user:
            return Response({'error': '공대장은 탈퇴할 수 없습니다.'}, status=status.HTTP_400_BAD_REQUEST)
        
        player.is_active = False
        player.save()
        return Response({'message': '공대에서 탈퇴했습니다.'})
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_groups(self, request):
        """내가 속한 공대 목록"""
        player_groups = Player.objects.filter(
            user=request.user, 
            is_active=True
        ).values_list('raid_group', flat=True)
        
        groups = RaidGroup.objects.filter(
            Q(id__in=player_groups) | Q(leader=request.user)
        ).distinct()
        
        serializer = self.get_serializer(groups, many=True)
        return Response(serializer.data)  # 배열로 직접 반환


class JobViewSet(viewsets.ReadOnlyModelViewSet):
    """직업 뷰셋 (읽기 전용)"""
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = None  # 페이지네이션 비활성화


class PlayerViewSet(viewsets.ModelViewSet):
    """공대원 뷰셋"""
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        raid_group_id = self.request.query_params.get('raid_group', None)
        if raid_group_id:
            queryset = queryset.filter(raid_group_id=raid_group_id)
        
        # 활성화된 플레이어만 표시할지 여부
        active_only = self.request.query_params.get('active_only', 'true')
        if active_only.lower() == 'true':
            queryset = queryset.filter(is_active=True)
            
        return queryset


class ItemTypeViewSet(viewsets.ReadOnlyModelViewSet):
    """아이템 종류 뷰셋 (읽기 전용)"""
    queryset = ItemType.objects.all()
    serializer_class = ItemTypeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = None  # 페이지네이션 비활성화


class ItemViewSet(viewsets.ModelViewSet):
    """아이템 뷰셋"""
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        raid_id = self.request.query_params.get('raid', None)
        if raid_id:
            queryset = queryset.filter(raid_id=raid_id)
        return queryset


class CurrencyViewSet(viewsets.ModelViewSet):
    """재화 뷰셋"""
    queryset = Currency.objects.all()
    serializer_class = CurrencySerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None  # 페이지네이션 비활성화


class EquipmentSetViewSet(viewsets.ModelViewSet):
    """장비 세트 뷰셋"""
    queryset = EquipmentSet.objects.all()
    serializer_class = EquipmentSetSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        player_id = self.request.query_params.get('player', None)
        if player_id:
            queryset = queryset.filter(player_id=player_id)
        return queryset
    
    @action(detail=True, methods=['post'])
    def bulk_update_equipments(self, request, pk=None):
        """장비 일괄 업데이트"""
        equipment_set = self.get_object()
        
        # 권한 확인
        if equipment_set.player.user != request.user:
            return Response({'error': '권한이 없습니다.'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = EquipmentBulkCreateSerializer(data={
            'equipment_set_id': equipment_set.id,
            'items': request.data.get('items', [])
        })
        
        if serializer.is_valid():
            serializer.save()
            return Response({'message': '장비가 업데이트되었습니다.'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ItemDistributionViewSet(viewsets.ModelViewSet):
    """아이템 분배 뷰셋"""
    queryset = ItemDistribution.objects.all()
    serializer_class = ItemDistributionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        raid_group_id = self.request.query_params.get('raid_group', None)
        if raid_group_id:
            queryset = queryset.filter(raid_group_id=raid_group_id)
        return queryset


class RaidScheduleViewSet(viewsets.ModelViewSet):
    """레이드 일정 뷰셋"""
    queryset = RaidSchedule.objects.all()
    serializer_class = RaidScheduleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        raid_group_id = self.request.query_params.get('raid_group', None)
        if raid_group_id:
            queryset = queryset.filter(raid_group_id=raid_group_id)
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def calculate_currency_needs(request):
    """재화 필요량 계산"""
    player_id = request.GET.get('player_id')
    if not player_id:
        return Response({'error': 'player_id가 필요합니다.'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        player = Player.objects.get(id=player_id)
        
        # 현재 세트와 목표 세트 가져오기
        current_set = EquipmentSet.objects.filter(player=player, set_type='current').first()
        target_set = EquipmentSet.objects.filter(player=player, set_type='target').first()
        
        if not target_set:
            return Response({'error': '목표 장비 세트가 없습니다.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # 필요한 아이템 찾기
        target_items = set(target_set.equipments.values_list('item_id', flat=True))
        current_items = set(current_set.equipments.values_list('item_id', flat=True)) if current_set else set()
        needed_items = target_items - current_items
        
        # 재화 계산
        currency_needs = {}
        for item_id in needed_items:
            requirements = CurrencyRequirement.objects.filter(item_id=item_id)
            for req in requirements:
                currency_name = req.currency.name
                if currency_name not in currency_needs:
                    currency_needs[currency_name] = 0
                currency_needs[currency_name] += req.amount
        
        return Response({
            'player': PlayerSerializer(player).data,
            'currency_needs': currency_needs,
            'needed_items_count': len(needed_items)
        })
        
    except Player.DoesNotExist:
        return Response({'error': '플레이어를 찾을 수 없습니다.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def calculate_distribution_priority(request):
    """분배 우선순위 계산"""
    raid_group_id = request.data.get('raid_group_id')
    if not raid_group_id:
        return Response({'error': 'raid_group_id가 필요합니다.'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        raid_group = RaidGroup.objects.get(id=raid_group_id)
        
        # 공대원들의 필요 재화량 계산
        players_needs = []
        for player in raid_group.players.filter(is_active=True):
            target_set = EquipmentSet.objects.filter(player=player, set_type='target').first()
            if not target_set:
                continue
            
            current_set = EquipmentSet.objects.filter(player=player, set_type='current').first()
            
            # 필요한 아이템 계산
            target_items = set(target_set.equipments.values_list('item_id', flat=True))
            current_items = set(current_set.equipments.values_list('item_id', flat=True)) if current_set else set()
            needed_items = target_items - current_items
            
            # 총 재화량 계산
            total_currency = 0
            for item_id in needed_items:
                requirements = CurrencyRequirement.objects.filter(item_id=item_id)
                for req in requirements:
                    total_currency += req.amount
            
            players_needs.append({
                'player': PlayerSerializer(player).data,
                'total_currency_needed': total_currency,
                'items_needed': len(needed_items)
            })
        
        # 재화 필요량 기준으로 정렬
        players_needs.sort(key=lambda x: x['total_currency_needed'], reverse=True)
        
        return Response({
            'raid_group': RaidGroupSerializer(raid_group).data,
            'priority_list': players_needs
        })
        
    except RaidGroup.DoesNotExist:
        return Response({'error': '공대를 찾을 수 없습니다.'}, status=status.HTTP_404_NOT_FOUND)