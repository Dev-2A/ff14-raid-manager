import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getMyRaidGroups } from '../../api/raids';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { formatDate } from '../../utils/helpers';

const Distribution = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [raidGroups, setRaidGroups] = useState([]);

  useEffect(() => {
    fetchRaidGroups();
  }, []);

  const fetchRaidGroups = async () => {
    try {
      setLoading(true);
      const groups = await getMyRaidGroups();
      const groupsList = Array.isArray(groups) ? groups : (groups.results || []);
      setRaidGroups(groupsList);
    } catch (err) {
      console.error('Failed to fetch raid groups:', err);
      setError('공대 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size='large' text='로딩 중...' />
      </div>
    );
  }

  // 공대장인 공대와 일반 멤버인 공대 구분
  const leadingGroups = raidGroups.filter(group => group.leader.id === user.id);
  const memberGroups = raidGroups.filter(group => group.leader.id !== user.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">아이템 분배</h1>
        <p className="mt-2 text-sm text-gray-600">
          공대의 아이템 분배를 관리합니다.
        </p>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError('')} />}

      {/* 공대장인 공대 섹션 */}
      {leadingGroups.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">내가 관리하는 공대</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leadingGroups.map(group => (
              <div key={group.id} className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{group.name}</h3>
                    <p className="text-sm text-gray-600">{group.raid.name}</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-ff14-accent text-white">
                    공대장
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex justify-between">
                    <span>분배 방식:</span>
                    <span className={`font-medium ${
                      group.distribution_method === 'priority' ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      {group.distribution_method === 'priority' ? '우선순위' : '먹고 빠지기'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>멤버:</span>
                    <span>{group.player_count}/8</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to={`/distribution/${group.id}/distribute`}
                    className="btn btn-primary text-sm text-center"
                  >
                    아이템 분배
                  </Link>
                  <Link
                    to={`/distribution/${group.id}/history`}
                    className="btn btn-secondary text-sm text-center"
                  >
                    분배 내역
                  </Link>
                </div>
                
                <div className="mt-3 pt-3 border-t">
                  <Link
                    to={`/distribution/${group.id}/priority`}
                    className="text-sm text-ff14-accent hover:text-yellow-600"
                  >
                    분배 우선순위 확인 →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 일반 멤버인 공대 섹션 */}
      {memberGroups.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">참여 중인 공대</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {memberGroups.map(group => (
              <div key={group.id} className="bg-white shadow rounded-lg p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{group.name}</h3>
                  <p className="text-sm text-gray-600">{group.raid.name}</p>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex justify-between">
                    <span>공대장:</span>
                    <span>{group.leader.character_name || group.leader.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>분배 방식:</span>
                    <span className={`font-medium ${
                      group.distribution_method === 'priority' ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      {group.distribution_method === 'priority' ? '우선순위' : '먹고 빠지기'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>멤버:</span>
                    <span>{group.player_count}/8</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Link
                    to={`/distribution/${group.id}/history`}
                    className="btn btn-secondary w-full text-sm text-center"
                  >
                    분배 내역 보기
                  </Link>
                  <Link
                    to={`/distribution/${group.id}/priority`}
                    className="block text-center text-sm text-ff14-accent hover:text-yellow-600"
                  >
                    분배 우선순위 확인 →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 공대가 없는 경우 */}
      {raidGroups.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">참여 중인 공대가 없습니다.</p>
          <Link
            to="/raid-groups"
            className="text-ff14-accent hover:text-yellow-600"
          >
            공대 찾아보기 →
          </Link>
        </div>
      )}

      {/* 도움말 */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">💡 분배 방식 안내</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>
            <strong>우선순위 분배:</strong> 필요 재화량이 많은 공대원이 우선순위를 갖습니다. 
            목표 장비까지 필요한 총 재화량을 기준으로 순위가 결정됩니다.
          </li>
          <li>
            <strong>먹고 빠지기:</strong> 한 번 아이템을 획득한 공대원은 모든 공대원이 1개씩 받을 때까지 
            대기해야 합니다. 공정한 분배를 위한 방식입니다.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Distribution;