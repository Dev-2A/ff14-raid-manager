import api, { setToken } from './config';

// 회원가입
export const register = async (userData) => {
  try {
    const response = await api.post('/accounts/register/', userData);
    if (response.data.token) {
      setToken(response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// 로그인
export const login = async (credentials) => {
  try {
    const response = await api.post('/accounts/login/', credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// 로그아웃
export const logout = async () => {
  try {
    const response = await api.post('/accounts/logout/');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// 현재 사용자 정보 가져오기
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/accounts/current-user/');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// 프로필 조회
export const getProfile = async () => {
  try {
    const response = await api.get('/accounts/profile/');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// 프로필 수정
export const updateProfile = async (profileData) => {
  try {
    const response = await api.patch('/accounts/profile/', profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// 비밀번호 변경
export const changePassword = async (passwordData) => {
  try {
    const response = await api.post('/accounts/password/change/', passwordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// 사용자명 중복 확인
export const checkUsername = async (username) => {
  try {
    const response = await api.get('/accounts/check-username/', {
      params: { username }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};