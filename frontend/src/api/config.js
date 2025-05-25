import axios from 'axios';

// API 기본 URL 설정
const API_BASE_URL = 'http://127.0.0.1:8000/api'

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
    // 요청 전에 수행할 작업
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
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;