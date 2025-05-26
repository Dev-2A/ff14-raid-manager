import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layouts';
import PrivateRoute from './components/PrivateRoute';

// 페이지 컴포넌트들 (임시 - 나중에 실제 파일로 대체)
const Home = () => <div className="p-4">홈 페이지</div>;
const Login = () => <div className="p-4">로그인 페이지</div>;
const Register = () => <div className="p-4">회원가입 페이지</div>;
const Dashboard = () => <div className="p-4">대시보드</div>;
const RaidGroups = () => <div className="p-4">공대 관리</div>;
const Equipment = () => <div className="p-4">장비 관리</div>;
const Distribution = () => <div className="p-4">아이템 분배</div>;

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* 공개 라우트 */}
            <Route path="/" element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />

            {/* 보호된 라우트 */}
            <Route
              path='/dashboard'
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path='/raid-groups'
              element={
                <PrivateRoute>
                  <RaidGroups />
                </PrivateRoute>
              }
            />
            <Route
              path='/equipment'
              element={
                <PrivateRoute>
                  <Equipment />
                </PrivateRoute>
              }
            />
            <Route
              path='/distribution'
              element={
                <PrivateRoute>
                  <Distribution />
                </PrivateRoute>
              }
            />

            {/* 404 처리 */}
            <Route path='*' element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;