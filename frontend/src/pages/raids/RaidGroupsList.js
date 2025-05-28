import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRaidGroups, getRaids } from '../../api/raids';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { formatDate } from '../../utils/helpers';

const RaidGroupsList = () => {
  const [raidGroups, setRaidGroups] = useState([]);
  const [raids, setRaids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    raid: '',
    distributionMethod: '',
    isActive: 'true',
  });

  useEffect (() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [groupsData, raidsData] = await Promise.all([
        getRaidGroups(),
        getRaids()
      ]);
      setRaidGroups(groupsData.results || groupsData);
      setRaids(raidsData.results || raidsData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 필터링된 공대 목록
  const filteredGroups = raidGroups.filter(group => {
    if (filters.raid && group.raid.id !== parseInt(filters.raid)) return false;
    if (filters.distributionMethod && group.distribution_method !== filters.distributionMethod) return false;
    if (filters.isActive && group.is_active !== (filters.isActive === 'true')) return false;
    return true; 
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size='large' text='공대 목록을 불러오는 중...' />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* 헤더 */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">공대 목록</h1>
          <p className="mt-2 text-sm text-gray-700">
            참여 가능한 공대를 찾거나 새로운 공대를 만들어보세요.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to="/raid-groups/create"
            className="btn btn-primary"
          >
            새 공대 만들기
          </Link>
        </div>
      </div>

      {/* 필터 */}
      <div className="mt-6 bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="raid" className="block text-sm font-medium text-gray-700">
              레이드
            </label>
            <select
              id="raid"
              name="raid"
              className="mt-1 input"
              value={filters.raid}
              onChange={handleFilterChange}
            >
              <option value="">전체</option>
              {raids.map(raid => (
                <option key={raid.id} value={raid.id}>
                  {raid.name} ({raid.tier})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="distributionMethod" className="block text-sm font-medium text-gray-700">
              분배 방식
            </label>
            <select
              id="distributionMethod"
              name="distributionMethod"
              className="mt-1 input"
              value={filters.distributionMethod}
              onChange={handleFilterChange}
            >
              <option value="">전체</option>
              <option value="priority">우선순위 분배</option>
              <option value="rotation">먹고 빠지기</option>
            </select>
          </div>
          <div>
            <label htmlFor="isActive" className="block text-sm font-medium text-gray-700">
              상태
            </label>
            <select
              id="isActive"
              name="isActive"
              className="mt-1 input"
              value={filters.isActive}
              onChange={handleFilterChange}
            >
              <option value="">전체</option>
              <option value="true">활성</option>
              <option value="false">비활성</option>
            </select>
          </div>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mt-4">
          <ErrorMessage message={error} onClose={() => setError('')} />
        </div>
      )}

      {/* 공대 목록 */}
      <div className="mt-6">
        {filteredGroups.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 mb-4">조건에 맞는 공대가 없습니다.</p>
            <Link
              to="/raid-groups/create"
              className="text-ff14-accent hover:text-yellow-600"
            >
              새 공대 만들기
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredGroups.map((group) => (
                <li key={group.id}>
                  <Link
                    to={`/raid-groups/${group.id}`}
                    className="block hover:bg-gray-50 px-4 py-4 sm:px-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-medium text-ff14-primary truncate">
                            {group.name}
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              group.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {group.is_active ? '활성' : '비활성'}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              {group.raid.name} ({group.raid.tier})
                            </p>
                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                              공대장: {group.leader.character_name || group.leader.username}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <p className="mr-4">
                              멤버: {group.player_count}/8
                            </p>
                            <p className={`px-2 py-1 rounded text-xs font-medium ${
                              group.distribution_method === 'priority'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {group.distribution_method === 'priority' ? '우선순위' : '먹고 빠지기'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="ml-5 flex-shrink-0">
                        <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default RaidGroupsList;