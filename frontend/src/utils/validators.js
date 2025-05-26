// 이메일 유효성 검사
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 사용자명 유효성 검사
export const isValidUsername = (username) => {
  if (!username) return false;
  if (username.length < 3 || username.length > 20) return false;
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  return usernameRegex.test(username);
};

// 비밀번호 강도 검사
export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, message: '비밀번호를 입력해주세요.' };

  let score = 0;
  const messages = [];

  // 길이 검사
  if (password.length >= 8) score += 1;
  else messages.push('8자 이상이어야 합니다.');

  if (password.length >= 12) score += 1;

  // 소문자 포함
  if (/[a-z]/.test(password)) score += 1;
  else messages.push('소문자를 포함해야 합니다.');

  // 대문자 포함
  if (/[A-Z]/.test(password)) score += 1;
  else messages.push('대문자를 포함해야 합니다');

  // 숫자 포함
  if (/\d/.test(password)) score += 1;
  else messages.push('숫자를 포함해야 합니다');

  // 특수문자 포함
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  else messages.push('특수문자를 포함하면 더 안전합니다');

  let strength = '';
  if (score < 2) strength = '매우 약함';
  else if (score < 3) strength = '약함';
  else if (score < 5) strength = '보통';
  else if (score < 6) strength = '강함';
  else strength = '매우 강함';

  return {
    score,
    strength,
    messages,
    isValid: score >= 3
  };
};

// 캐릭터명 유효성 검사
export const isValidCharacterName = (name) => {
  if (!name) return false;
  if (name.length < 2 || name.length > 20) return false;
  // 한글, 영문, 숫자, 공백 허용
  const nameRegex = /^[가-힣a-zA-Z0-9\s]+$/;
  return nameRegex.test(name);
};

// 서버명 유효성 검사
export const isValidServerName = (server) => {
  const validServers = [
    '카벙클', '모그리', '초코보', '톤베리', '펜리르'
  ];
  return validServers.includes(server);
};

// 아이템 레벨 유효성 검사
export const isValidItemLevel = (level, min, max) => {
  const numLevel = parseInt(level);
  if (isNaN(numLevel)) return false;
  return numLevel >= min && numLevel <= max;
};

// 폼 유효성 검사 헬퍼
export const validateForm = (values, rules) => {
  const errors = {};

  Object.keys(rules).forEach(field => {
    const value = values[field];
    const fieldRules = rules[field];

    fieldRules.forEach(rule => {
      if (errors[field]) return; // 이미 에러가 있으면 스킵

      if (rule.required && !value) {
        errors[field] = rule.message || `${field}은(는) 필수입니다.`;
      }

      if (rule.min && value && value.length < rule.min) {
        errors[field] = rule.message || `${field}은(는) 최소 ${rule.min}자 이상이어야 합니다.`;
      }

      if (rule.max && value && value.length > rule.max) {
        errors[field] = rule.message || `${field}은(는) 최대 ${rule.max}자까지 가능합니다.`;
      }

      if (rule.pattern && value && !rule.pattern.test(value)) {
        errors[field] = rule.message || `${field} 형식이 올바르지 않습니다.`;
      }

      if (rule.custom && value && !rule.custom(value, values)) {
        errors[field] = rule.message || `${field}이(가) 유효하지 않습니다.`;
      }
    });
  });

  return errors;
};