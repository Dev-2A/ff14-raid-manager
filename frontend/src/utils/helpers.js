// 역할별 색상 클래스 반환
export const getRoleColorClass = (role) => {
  const colorMap = {
    tank: 'text-ff14-tank',
    healer: 'text-ff14-healer',
    melee: 'text-ff14-melee',
    ranged: 'text-ff14-ranged',
    caster: 'text-ff14-caster',
  };
  return colorMap[role] || 'text-gray-600';
};

// 역할별 배경 색상 클래스 반환
export const getRoleBgColorClass = (role) => {
  const colorMap = {
    tank: 'bg-blue-100',
    healer: 'bg-green-100',
    melee: 'bg-red-100',
    ranged: 'bg-yellow-100',
    caster: 'bg-purple-100',
  };
  return colorMap[role] || 'bg-gray-100';
};

// 역할 한글명 반환
export const getRoleDisplayName = (role) => {
  const nameMap = {
    tank: '탱커',
    healer: '힐러',
    melee: '근딜',
    ranged: '원딜',
    caster: '캐스터',
  };
  return nameMap[role] || role;
};

// 날짜 포맷팅
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('ko-KR');
};

// 날짜/시간 포맷팅
export const formatDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('ko-KR');
};

// 요일 반환
export const getWeekdayName = (weekday) => {
  const weekdays = ['월', '화', '수', '목', '금', '토', '일'];
  return weekdays[weekday] || '';
};
// 숫자 포맷팅 (천 단위 콤마)
export const formatNumber = (num) => {
  return num?.toLocaleString('ko-KR') || '0';
};

// 아이템 레벨 색상 클래스 반환
export const getItemLevelColorClass = (itemLevel, minLevel, maxLevel) => {
  if (!itemLevel || !maxLevel) return 'text-gray-600';

  const percentage = ((itemLevel - minLevel) / (maxLevel - minLevel)) * 100;

  if (percentage >= 90) return 'text-purple-600';
  if (percentage >= 70) return 'text-blue-600';
  if (percentage >= 50) return 'text-green-600';
  if (percentage >= 30) return 'text-yellow-600';
  return 'text-red-600';
}

// 에러 메시지 추출
export const getErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.detail) return error.detail;
  if (error?.non_field_errors) return error.non_field_errors[0];
  return '알 수 없는 오류가 발생했습니다.';
};

// 폼 에러 처리
export const getFieldError = (errors, fieldName) => {
  if (!errors || !fieldName) return null;
  return errors[fieldName]?.[0] || null;
};

// 아이템 타입별 아이콘 (향후 실제 아이콘으로 대체 가능)
export const getItemTypeIcon = (itemType) => {
  const iconMap = {
    '무기': '⚔️',
    '머리': '👑',
    '몸통': '🎽',
    '손': '🧤',
    '다리': '👖',
    '발': '👢',
    '귀걸이': '💎',
    '목걸이': '📿',
    '팔찌': '⌚',
    '반지': '💍',
  };
  return iconMap[itemType] || '📦';
};
