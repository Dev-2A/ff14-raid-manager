from django.core.management.base import BaseCommand
from raids.models import Job, ItemType


class Command(BaseCommand):
    help = 'FF14 기본 데이터 초기화'

    def handle(self, *args, **options):
        self.stdout.write('FF14 기본 데이터를 초기화합니다...')
        
        # 직업 데이터
        jobs_data = [
            # 탱커
            {'name': '전사', 'role': 'tank', 'icon': '전사'},
            {'name': '나이트', 'role': 'tank', 'icon': '나이트'},
            {'name': '암흑기사', 'role': 'tank', 'icon': '암흑기사'},
            {'name': '건브레이커', 'role': 'tank', 'icon': '건브레이커'},
            
            # 힐러
            {'name': '백마도사', 'role': 'healer', 'icon': '백마도사'},
            {'name': '학자', 'role': 'healer', 'icon': '학자'},
            {'name': '점성술사', 'role': 'healer', 'icon': '점성술사'},
            {'name': '현자', 'role': 'healer', 'icon': '현자'},
            
            # 근딜
            {'name': '몽크', 'role': 'melee', 'icon': '몽크'},
            {'name': '용기사', 'role': 'melee', 'icon': '용기사'},
            {'name': '닌자', 'role': 'melee', 'icon': '닌자'},
            {'name': '사무라이', 'role': 'melee', 'icon': '사무라이'},
            {'name': '리퍼', 'role': 'melee', 'icon': '리퍼'},
            {'name': '바이퍼', 'role': 'melee', 'icon': '바이퍼'},
            
            # 원딜
            {'name': '음유시인', 'role': 'ranged', 'icon': '음유시인'},
            {'name': '기공사', 'role': 'ranged', 'icon': '기공사'},
            {'name': '무도가', 'role': 'ranged', 'icon': '무도가'},
            
            # 캐스터
            {'name': '흑마도사', 'role': 'caster', 'icon': '흑마도사'},
            {'name': '소환사', 'role': 'caster', 'icon': '소환사'},
            {'name': '적마도사', 'role': 'caster', 'icon': '적마도사'},
            {'name': '픽토맨서', 'role': 'caster', 'icon': '픽토맨서'},
        ]
        
        # 직업 생성
        for job_data in jobs_data:
            job, created = Job.objects.update_or_create(
                name=job_data['name'],
                defaults={
                    'role': job_data['role'],
                    'icon': job_data['icon']
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'직업 생성: {job.name}'))
            else:
                self.stdout.write(f'직업 업데이트: {job.name}')
        
        # 아이템 타입 데이터
        item_types_data = [
            {'name': '무기', 'slot': 'weapon', 'order': 1},
            {'name': '머리', 'slot': 'head', 'order': 2},
            {'name': '몸통', 'slot': 'body', 'order': 3},
            {'name': '손', 'slot': 'hands', 'order': 4},
            {'name': '다리', 'slot': 'legs', 'order': 5},
            {'name': '발', 'slot': 'feet', 'order': 6},
            {'name': '귀걸이', 'slot': 'earrings', 'order': 7},
            {'name': '목걸이', 'slot': 'necklace', 'order': 8},
            {'name': '팔찌', 'slot': 'bracelet', 'order': 9},
            {'name': '반지', 'slot': 'ring', 'order': 10},
        ]
        
        # 아이템 타입 생성
        for item_type_data in item_types_data:
            item_type, created = ItemType.objects.update_or_create(
                name=item_type_data['name'],
                defaults={
                    'slot': item_type_data['slot'],
                    'order': item_type_data['order']
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'아이템 타입 생성: {item_type.name}'))
            else:
                self.stdout.write(f'아이템 타입 업데이트: {item_type.name}')
        
        self.stdout.write(self.style.SUCCESS('FF14 기본 데이터 초기화 완료!'))