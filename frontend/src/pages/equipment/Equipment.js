import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getMyRaidGroups, getPlayers, getEquipmentSets } from '../../api/raids';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { getItemTypeIcon } from '../../utils/helpers';

const Equipment = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [raidGroups, setRaidGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [playerInfo, setPlayerInfo] = useState(null);
  const [equipmentSets, setEquipmentSets] = useState([]);

  useEffect(() => {
    fetchRaidGroups();
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      fetchPlayerAndEquipmentData();
    }
  }, [selectedGroupId]);

  const fetchRaidGroups = async () => {
    try {
      setLoading(true);
      const groups = await getMyRaidGroups();
      const activeGroups = Array.isArray(groups) ? groups : (groups.results || []);
      setRaidGroups(activeGroups);

      // 첫 번째 공대 자동 선택
      if (activeGroups.length > 0) {
        setSelectedGroupId(activeGroups[0].id.toString());
      }
    } catch (err) {
      console.error('Failed to fetch raid groups:', err);
      setError('공대 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayerAndEquipmentData = async () => {
    try {
      setLoading(true);

      // 해당 공대에서 내 플레이어 정보 찾기
      const playersData = await getPlayers(selectedGroupId);
      const players = Array.isArray(playersData) ? playersData : (playersData.results || []);
      const myPlayer = players.find(p => p.user.id === user.id && p.is_active);

      if (!myPlayer) {
        setPlayerInfo(null);
        setEquipmentSets([]);
        return;
      }

      setPlayerInfo(myPlayer);

      // 장비 세트 가져오기
      const setsData = await getEquipmentSets(myPlayer.id);
      const sets = Array.isArray(setsData) ? setsData : (setsData.results || []);
      setEquipmentSets(sets);
    } catch (err) {
      console.error('Failed to fetch player data:', err);
      setError('플레이어 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleGroupChange = (e) => {
    setSelectedGroupId(e.target.value);
  };

  const getSetByType = (type) => {
    return equipmentSets.find(set => set.set_type === type) || null;
  };

  const calculateProgress = () => {
    const currentSet = getSetByType('current');
    const targetSet = getSetByType('target');

    if (!currentSet || !targetSet || !currentSet.item_level || !targetSet.item_level) {
      return 0;
    }

    const startLevel = getSetByType('start')?.item_level || currentSet.item_level;
    const progress = ((currentSet.item_level - startLevel) / (targetSet.item_level - startLevel)) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  if (loading && raidGroups.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" text="로딩 중..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">장비 관리</h1>
        <p className="mt-2 text-sm text-gray-600">
          장비 세트를 관리하고 필요한 재화를 계산합니다.
        </p>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError('')} />}

      {/* 공대 선택 */}
      {raidGroups.length > 0 ? (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label htmlFor="raid-group" className="text-sm font-medium text-gray-700">
                공대 선택:
              </label>
              <select
                id="raid-group"
                value={selectedGroupId}
                onChange={handleGroupChange}
                className="input"
                disabled={loading}
              >
                {raidGroups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name} - {group.raid.name}
                  </option>
                ))}
              </select>
            </div>
            {playerInfo && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">{playerInfo.character_name}</span>
                <span className="mx-2">|</span>
                <span>{playerInfo.job.name}</span>
                <span className="mx-2">|</span>
                <span>IL{playerInfo.item_level}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6 mb-6 text-center">
          <p className="text-gray-500 mb-4">참여중인 공대가 없습니다.</p>
          <Link to="/raid-groups" className="text-ff14-accent hover:text-yellow-600">
            공대 찾아보기 →
          </Link>
        </div>
      )}

      {/* 장비 세트 개요 */}
      {playerInfo && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* 출발 세트 */}
            <EquipmentSetCard
              title="출발 세트"
              set={getSetByType('start')}
              playerId={playerInfo.id}
              raidGroup={raidGroups.find(g => g.id === parseInt(selectedGroupId))}
              type="start"
              description="레이드 시작 시점의 장비"
            />

            {/* 현재 세트 */}
            <EquipmentSetCard
              title="현재 세트"
              set={getSetByType('current')}
              playerId={playerInfo.id}
              raidGroup={raidGroups.find(g => g.id === parseInt(selectedGroupId))}
              type="current"
              description="현재 착용중인 장비"
              isHighlighted
            />

            {/* 목표 세트 */}
            <EquipmentSetCard
              title="목표 세트"
              set={getSetByType('target')}
              playerId={playerInfo.id}
              raidGroup={raidGroups.find(g => g.id === parseInt(selectedGroupId))}
              type="target"
              description="최종 목표 장비 (BiS)"
            />
          </div>

          {/* 진행도 */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">장비 진행도</h2>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-ff14-accent bg-yellow-100">
                    진행률
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-ff14-accent">
                    {calculateProgress().toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                <div
                  style={{ width: `${calculateProgress()}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-ff14-accent transition-all duration-500"
                />
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>출발: IL{getSetByType('start')?.item_level || '-'}</span>
                <span className="font-medium">현재: IL{getSetByType('current')?.item_level || '-'}</span>
                <span>목표: IL{getSetByType('target')?.item_level || '-'}</span>
              </div>
            </div>
          </div>

          {/* 재화 계산 */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">필요 재화 계산</h2>
              <Link
                to={`/equipment/currency-calculator?player=${playerInfo.id}`}
                className="text-sm text-ff14-accent hover:text-yellow-600"
              >
                상세 계산기 →
              </Link>
            </div>
            <p className="text-sm text-gray-600">
              현재 장비에서 목표 장비까지 필요한 재화를 계산합니다.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

// 장비 세트 카드 컴포넌트
const EquipmentSetCard = ({ title, set, playerId, raidGroup, type, description, isHighlighted }) => {
  return (
    <div className={`bg-white shadow rounded-lg p-6 ${isHighlighted ? 'ring-2 ring-ff14-accent' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        {set && (
          <span className="text-2xl font-bold text-gray-900">
            IL{set.item_level}
          </span>
        )}
      </div>

      {set ? (
        <>
          <div className="space-y-2 mb-4">
            <div className="text-sm text-gray-600">
              <span>장비 수: {set.equipments?.length || 0}/13</span>
            </div>
            <div className="text-sm text-gray-600">
              <span>최종 수정: {new Date(set.updated_at).toLocaleDateString('ko-KR')}</span>
            </div>
          </div>
          <Link
            to={`/equipment/edit/${playerId}/${type}`}
            className="block w-full text-center btn btn-secondary"
          >
            수정
          </Link>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            아직 설정되지 않았습니다.
          </p>
          <Link
            to={`/equipment/edit/${playerId}/${type}`}
            className="block w-full text-center btn btn-primary"
          >
            생성
          </Link>
        </>
      )}
    </div>
  );
};

export default Equipment;