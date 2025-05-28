import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

// 페이지 컴포넌트들
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import RaidGroupsList from './pages/raids/RaidGroupsList';
import RaidGroupCreate from './pages/raids/RaidGroupCreate';
import RaidGroupDetail from './pages/raids/RaidGroupDetail';

// 장비 관리 컴포넌트들
import Equipment from './pages/equipment/Equipment';
import EquipmentEdit from './pages/equipment/EquipmentEdit';
import CurrencyCalculator from './pages/equipment/CurrencyCalculator';

// 페이지 컴포넌트들 (임시 - 나중에 실제 파일로 대체)
const Distribution = () => <div className="p-4">아이템 분배</div>;

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* 공개 라우트 */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* 보호된 라우트 */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/raid-groups"
              element={
                <PrivateRoute>
                  <RaidGroupsList />
                </PrivateRoute>
              }
            />
            <Route
              path="/raid-groups/create"
              element={
                <PrivateRoute>
                  <RaidGroupCreate />
                </PrivateRoute>
              }
            />
            <Route
              path="/raid-groups/:id"
              element={
                <PrivateRoute>
                  <RaidGroupDetail />
                </PrivateRoute>
              }
            />
            
            {/* 장비 관리 라우트 */}
            <Route
              path="/equipment"
              element={
                <PrivateRoute>
                  <Equipment />
                </PrivateRoute>
              }
            />
            <Route
              path="/equipment/edit/:playerId/:setType"
              element={
                <PrivateRoute>
                  <EquipmentEdit />
                </PrivateRoute>
              }
            />
            <Route
              path="/equipment/currency-calculator"
              element={
                <PrivateRoute>
                  <CurrencyCalculator />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/distribution"
              element={
                <PrivateRoute>
                  <Distribution />
                </PrivateRoute>
              }
            />

            {/* 404 처리 */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;