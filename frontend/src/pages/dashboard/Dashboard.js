import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getMyRaidGroups } from '../../api/raids';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { formatDate, getRoleColorClass, getRoleDisplayName } from '../../utils/helpers';

const Dashboard = () => {
  const { user } = useAuth();
  const [raidGroups, setRaidGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyRaidGroups();
  }, []);

  const fetchMyRaidGroups = async () => {
    try {
      setLoading(true);
      const data = await getMyRaidGroups();
      setRaidGroups(data);
    } catch (err) {
      console.error('Failed to fetch raid groups:', err);
      setError('공대 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
        <p className="mt-2 text-sm text-gray-600">
          환영합니다, {user?.character_name || user?.username}님!
        </p>
      </div>

      {/* 사용자 정보 카드 */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">내 정보</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">아이디</p>
            <p className="font-medium">{user?.username}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">이메일</p>
            <p className="font-medium">{user?.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">캐릭터명</p>
            <p className="font-medium">{user?.character_name || '미설정'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">서버</p>
            <p className="font-medium">{user?.server || '미설정'}</p>
          </div>
        </div>
        <div className="mt-4 flex space-x-2">
          <Link
            to="/profile"
            className="text-sm text-ff14-accent hover:text-yellow-600"
          >
            프로필 수정
          </Link>
        </div>
      </div>

      {/* 공대 목록 */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">내 공대 목록</h2>
          <Link
            to="/raid-groups/create"
            className="btn btn-primary"
          >
            새 공대 만들기
          </Link>
        </div>

        {loading ? (
          <div className="py-8">
            <LoadingSpinner text="공대 목록을 불러오는 중..." />
          </div>
        ) : error ? (
          <ErrorMessage message={error} onClose={() => setError('')} />
        ) : raidGroups.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">아직 참여중인 공대가 없습니다.</p>
            <Link
              to="/raid-groups"
              className="text-ff14-accent hover:text-yellow-600"
            >
              공대 찾아보기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {raidGroups.map((group) => (
              <Link
                key={group.id}
                to={`/raid-groups/${group.id}`}
                className="block hover:bg-gray-50 border border-gray-200 rounded-lg p-4 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900">{group.name}</h3>
                  {group.leader.id === user.id && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-ff14-accent text-white">
                      공대장
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {group.raid.name} ({group.raid.tier})
                </p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">
                    멤버: {group.player_count}/8
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    group.distribution_method === 'priority' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {group.distribution_method === 'priority' ? '우선순위' : '먹고 빠지기'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 빠른 링크 */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/equipment"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="font-medium text-gray-900 mb-2">장비 관리</h3>
          <p className="text-sm text-gray-600">
            내 장비 세트를 관리하고 필요한 재화를 계산합니다.
          </p>
        </Link>
        <Link
          to="/distribution"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="font-medium text-gray-900 mb-2">아이템 분배</h3>
          <p className="text-sm text-gray-600">
            공대의 아이템 분배 현황을 확인하고 관리합니다.
          </p>
        </Link>
        <Link
          to="/schedule"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="font-medium text-gray-900 mb-2">일정 관리</h3>
          <p className="text-sm text-gray-600">
            레이드 일정을 확인하고 관리합니다.
          </p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;