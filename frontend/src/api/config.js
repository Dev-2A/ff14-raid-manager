import axios from 'axios';

// API 기본 URL 설정
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Token 가져오기
const getToken = () => {
  return localStorage.getItem('authToken');
};

// Token 저장
export const setToken = (token) => {
  localStorage.setItem('authToken', token);
};

// Token 삭제
export const removeToken = () => {
  localStorage.removeItem('authToken');
};

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키를 포함하여 요청
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    // Token 추가
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // 서버가 응답을 반환한 경우
      if (error.response.status === 401) {
        // 인증 오류 처리
        removeToken();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;