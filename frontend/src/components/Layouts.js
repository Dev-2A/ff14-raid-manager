import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 네비게이션 바 */}
      <nav className="bg-ff14-primary shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* 로고 */}
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-ff14-accent text-xl font-bold">
                  FF14 레이드 관리
                </Link>
              </div>

              {/* 데스크톱 메뉴 */}
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {isAuthenticated && (
                  <>
                    <Link
                      to="/dashboard"
                      className="text-gray-300 hover:text-white inline-flex items-center px-1 pt-1 text-sm font-medium"
                    >
                      대시보드
                    </Link>
                    <Link
                      to="raid-groups"
                      className="text-gray-300 hover:text-white inline-flex items-center px-1 pt-1 text-sm font-medium"
                    >
                      공대 관리
                    </Link>
                    <Link
                      to="/equipment"
                      className="text-gray-300 hover:text-white inline-flex items-center px-1 pt-1 text-sm font-medium"
                    >
                      장비 관리
                    </Link>
                    <Link
                      to="/distribution"
                      className="text-gray-300 hover:text-white inline-flex items-center px-1 pt-1 text-sm font-medium"
                    >
                      아이템 분배
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* 우측 메뉴 */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {isAuthenticated ? (
                <div className="ml-3 relative">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-300 text-sm">
                      {user?.character_name || user?.username}
                      {user?.server && <span className="text-gray-500">@{user.server}</span>}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="text-gray-300 hover:text-white text-sm font-medium"
                    >
                      로그아웃
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-gray-300 hover:text-white text-sm font-medium"
                  >
                    로그인
                  </Link>
                  <Link
                    to="/register"
                    className="bg-ff14-accent text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-600"
                  >
                    회원가입
                  </Link>
                </div>
              )}
            </div>

            {/* 모바일 메뉴 버튼 */}
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <span className="sr-only">메인 메뉴 열기</span>
                {mobileMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {mobileMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {isAuthenticated && (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium"
                  >
                    대시보드
                  </Link>
                  <Link
                    to="/raid-groups"
                    className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium"
                  >
                    공대 관리
                  </Link>
                  <Link
                    to="/equipment"
                    className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium"
                  >
                    장비 관리
                  </Link>
                  <Link
                    to="/distribution"
                    className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium"
                  >
                    아이템 분배
                  </Link>
                </>
              )}
            </div>
            <div className="pt-4 pb-3 border-t bordder-gray-700">
              {isAuthenticated ? (
                <>
                  <div className="px-4 text-gray-300 text-sm">
                    {user?.character_name || user?.username}
                    {user?.server && <span className="text-gray-500">@{user.server}</span>}
                  </div>
                  <div className="mt-3 space-y-1">
                    <button
                      onClick={handleLogout}
                      className="text-gray-300 hover:text-white block px-4 py-2 text-base font-medium w-full text-left"
                    >
                      로그아웃
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-1">
                  <Link
                    to="/login"
                    className="text-gray-300 hover:text-white block px-4 py-2 text-base font-medium"
                  >
                    로그인
                  </Link>
                  <Link
                    to="/register"
                    className="text-gray-300 hover:text-white block px-4 py-2 text-base font-medium"
                  >
                    회원가입
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* 메인 컨텐츠 */}
      <main className="max-2-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* 푸터 */}
      <footer className="bg-ff14-secondary mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-400 text-sm">
            © 2025 FF14 레이드 관리 시스템. 파이널 판타지 XIV는 Square Enix의 등록상표입니다.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;