from django.core.management.base import BaseCommand
from raids.models import Raid, Currency, Item, ItemType, CurrencyRequirement


class Command(BaseCommand):
    help = '샘플 레이드 데이터 생성 (라이트헤비 영웅)'

    def handle(self, *args, **options):
        self.stdout.write('라이트헤비 영웅 레이드 데이터를 생성합니다...')
        
        # 레이드 생성
        raid, created = Raid.objects.update_or_create(
            name='아르카디아: 라이트헤비급급',
            tier='영웅',
            defaults={
                'patch': '7.0',
                'min_ilvl': 690,
                'max_ilvl': 735
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'레이드 생성: {raid.name}'))
        
        # 재화 생성
        currencies_data = [
            {'name': '라이트헤비 낱장', 'weekly_limit': 8},
            {'name': '천도 석판', 'weekly_limit': 0},  # 무기 교환용
        ]
        
        currencies = {}
        for currency_data in currencies_data:
            currency, created = Currency.objects.update_or_create(
                name=currency_data['name'],
                raid=raid,
                defaults={'weekly_limit': currency_data['weekly_limit']}
            )
            currencies[currency.name] = currency
            if created:
                self.stdout.write(self.style.SUCCESS(f'재화 생성: {currency.name}'))
        
        # 아이템 타입 가져오기
        item_types = {it.name: it for it in ItemType.objects.all()}
        
        # 샘플 아이템 생성 (일부만)
        items_data = [
            # 무기 (4층)
            {'name': '라이트헤비 대검', 'type': '무기', 'ilvl': 735, 'floor': 4, 'is_weapon': True, 'currency': {'라이트헤비 석판': 1}},
            {'name': '라이트헤비 도끼', 'type': '무기', 'ilvl': 735, 'floor': 4, 'is_weapon': True, 'currency': {'라이트헤비 석판': 1}},
            
            # 머리 (3층)
            {'name': '라이트헤비 투구', 'type': '머리', 'ilvl': 730, 'floor': 2, 'currency': {'라이트헤비 낱장': 6}},
            {'name': '라이트헤비 머리장식', 'type': '머리', 'ilvl': 730, 'floor': 2, 'currency': {'라이트헤비 낱장': 6}},
            
            # 몸통 (4층)
            {'name': '라이트헤비 갑옷', 'type': '몸통', 'ilvl': 730, 'floor': 3, 'currency': {'라이트헤비 낱장': 8}},
            {'name': '라이트헤비 로브', 'type': '몸통', 'ilvl': 730, 'floor': 3, 'currency': {'라이트헤비 낱장': 8}},
            
            # 손 (2층)
            {'name': '라이트헤비 건틀릿', 'type': '손', 'ilvl': 730, 'floor': 2, 'currency': {'라이트헤비 낱장': 6}},
            {'name': '라이트헤비 장갑', 'type': '손', 'ilvl': 730, 'floor': 2, 'currency': {'라이트헤비 낱장': 6}},
            
            # 다리 (4층)
            {'name': '라이트헤비 각반', 'type': '다리', 'ilvl': 730, 'floor': 3, 'currency': {'라이트헤비 낱장': 8}},
            {'name': '라이트헤비 바지', 'type': '다리', 'ilvl': 730, 'floor': 3, 'currency': {'라이트헤비 낱장': 8}},
            
            # 발 (2층)
            {'name': '라이트헤비 그리브', 'type': '발', 'ilvl': 730, 'floor': 2, 'currency': {'라이트헤비 낱장': 6}},
            {'name': '라이트헤비 신발', 'type': '발', 'ilvl': 730, 'floor': 2, 'currency': {'라이트헤비 낱장': 6}},
            
            # 액세서리 (1층, 3층)
            {'name': '라이트헤비 귀걸이', 'type': '귀걸이', 'ilvl': 730, 'floor': 1, 'currency': {'라이트헤비 낱장': 4}},
            {'name': '라이트헤비 목걸이', 'type': '목걸이', 'ilvl': 730, 'floor': 1, 'currency': {'라이트헤비 낱장': 4}},
            {'name': '라이트헤비 팔찌', 'type': '팔찌', 'ilvl': 730, 'floor': 1, 'currency': {'라이트헤비 낱장': 4}},
            {'name': '라이트헤비 반지', 'type': '반지', 'ilvl': 730, 'floor': 1, 'currency': {'라이트헤비 낱장': 4}},
        ]
        
        # 아이템 생성
        for item_data in items_data:
            item_type = item_types.get(item_data['type'])
            if not item_type:
                self.stdout.write(self.style.WARNING(f'아이템 타입을 찾을 수 없음: {item_data["type"]}'))
                continue
            
            item, created = Item.objects.update_or_create(
                name=item_data['name'],
                raid=raid,
                defaults={
                    'item_type': item_type,
                    'item_level': item_data['ilvl'],
                    'floor': item_data['floor'],
                    'is_weapon': item_data.get('is_weapon', False)
                }
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS(f'아이템 생성: {item.name}'))
                
                # 재화 요구사항 생성
                for currency_name, amount in item_data.get('currency', {}).items():
                    currency = currencies.get(currency_name)
                    if currency:
                        CurrencyRequirement.objects.create(
                            item=item,
                            currency=currency,
                            amount=amount
                        )
                        self.stdout.write(f'  - 필요 재화: {currency_name} x{amount}')
        
        self.stdout.write(self.style.SUCCESS('천옥 영웅 레이드 데이터 생성 완료!'))