import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getRaidGroup, 
  getPlayers, 
  joinRaidGroup, 
  leaveRaidGroup,
  getRaidSchedules,
  getJobs 
} from '../../api/raids';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import SuccessMessage from '../../components/SuccessMessage';
import RoleBadge from '../../components/RoleBadge';
import { formatDate, getRoleColorClass } from '../../utils/helpers';

const RaidGroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [raidGroup, setRaidGroup] = useState(null);
  const [players, setPlayers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinData, setJoinData] = useState({
    job_id: '',
    character_name: user?.character_name || '',
    item_level: ''
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [groupData, playersData, schedulesData, jobsData] = await Promise.all([
        getRaidGroup(id),
        getPlayers(id, false), // 모든 플레이어 가져오기 (비활성화 포함)
        getRaidSchedules(id),
        getJobs()
      ]);
      
      setRaidGroup(groupData);
      setPlayers(Array.isArray(playersData) ? playersData : playersData.results || []);
      setSchedules(Array.isArray(schedulesData) ? schedulesData : schedulesData.results || []);
      setJobs(Array.isArray(jobsData) ? jobsData : jobsData.results || []);
      
      // 기본 아이템 레벨 설정
      if (groupData.raid) {
        setJoinData(prev => ({
          ...prev,
          item_level: groupData.raid.min_ilvl.toString()
        }));
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const isLeader = raidGroup?.leader?.id === user?.id;
  const currentPlayer = players.find(p => p.user.id === user?.id);
  const isMember = currentPlayer?.is_active || false;
  const activePlayerCount = players.filter(p => p.is_active).length;
  const canJoin = !isLeader && !isMember && activePlayerCount < 8;

  const handleJoin = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      await joinRaidGroup(id, joinData);
      setSuccess('공대에 가입했습니다!');
      setShowJoinModal(false);
      fetchData(); // 데이터 새로고침
    } catch (err) {
      console.error('Failed to join raid group:', err);
      setError(err.message || '공대 가입에 실패했습니다.');
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('정말로 공대에서 탈퇴하시겠습니까?')) return;
    
    try {
      setError('');
      await leaveRaidGroup(id);
      setSuccess('공대에서 탈퇴했습니다.');
      fetchData(); // 데이터 새로고침
    } catch (err) {
      console.error('Failed to leave raid group:', err);
      setError(err.message || '공대 탈퇴에 실패했습니다.');
    }
  };

  const handleJoinDataChange = (e) => {
    const { name, value } = e.target;
    setJoinData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 역할별로 플레이어 그룹화
  const playersByRole = {
    tank: players.filter(p => p.job?.role === 'tank' && p.is_active),
    healer: players.filter(p => p.job?.role === 'healer' && p.is_active),
    melee: players.filter(p => p.job?.role === 'melee' && p.is_active),
    ranged: players.filter(p => p.job?.role === 'ranged' && p.is_active),
    caster: players.filter(p => p.job?.role === 'caster' && p.is_active),
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" text="공대 정보를 불러오는 중..." />
      </div>
    );
  }

  if (!raidGroup) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">공대를 찾을 수 없습니다.</p>
        <Link to="/raid-groups" className="text-ff14-accent hover:text-yellow-600">
          공대 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 헤더 */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{raidGroup.name}</h1>
            <p className="text-gray-600">
              {raidGroup.raid.name} ({raidGroup.raid.tier})
            </p>
            <div className="mt-2 flex items-center space-x-4 text-sm">
              <span className="text-gray-500">
                공대장: {raidGroup.leader.character_name || raidGroup.leader.username}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                raidGroup.distribution_method === 'priority'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {raidGroup.distribution_method === 'priority' ? '우선순위 분배' : '먹고 빠지기'}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                raidGroup.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {raidGroup.is_active ? '활성' : '비활성'}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {isLeader && (
              <button className="btn btn-secondary">
                공대 설정
              </button>
            )}
            {canJoin && (
              <button 
                onClick={() => setShowJoinModal(true)}
                className="btn btn-primary"
              >
                공대 가입
              </button>
            )}
            {isMember && !isLeader && (
              <button 
                onClick={handleLeave}
                className="btn btn-danger"
              >
                공대 탈퇴
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 에러/성공 메시지 */}
      {error && <ErrorMessage message={error} onClose={() => setError('')} />}
      {success && <SuccessMessage message={success} onClose={() => setSuccess('')} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 공대원 목록 */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              공대원 ({activePlayerCount}/8)
            </h2>
            
            <div className="space-y-4">
              {/* 탱커 */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <span className={getRoleColorClass('tank')}>탱커 ({playersByRole.tank.length}/2)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {playersByRole.tank.map(player => (
                    <PlayerCard key={player.id} player={player} isLeader={player.user.id === raidGroup.leader.id} />
                  ))}
                  {[...Array(2 - playersByRole.tank.length)].map((_, i) => (
                    <EmptySlot key={`tank-empty-${i}`} />
                  ))}
                </div>
              </div>

              {/* 힐러 */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <span className={getRoleColorClass('healer')}>힐러 ({playersByRole.healer.length}/2)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {playersByRole.healer.map(player => (
                    <PlayerCard key={player.id} player={player} isLeader={player.user.id === raidGroup.leader.id} />
                  ))}
                  {[...Array(2 - playersByRole.healer.length)].map((_, i) => (
                    <EmptySlot key={`healer-empty-${i}`} />
                  ))}
                </div>
              </div>

              {/* DPS */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  DPS ({playersByRole.melee.length + playersByRole.ranged.length + playersByRole.caster.length}/4)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[...playersByRole.melee, ...playersByRole.ranged, ...playersByRole.caster].map(player => (
                    <PlayerCard key={player.id} player={player} isLeader={player.user.id === raidGroup.leader.id} />
                  ))}
                  {[...Array(4 - (playersByRole.melee.length + playersByRole.ranged.length + playersByRole.caster.length))].map((_, i) => (
                    <EmptySlot key={`dps-empty-${i}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 사이드바 */}
        <div className="space-y-6">
          {/* 레이드 정보 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">레이드 정보</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-gray-500">레이드</dt>
                <dd className="font-medium">{raidGroup.raid.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">단계</dt>
                <dd className="font-medium">{raidGroup.raid.tier}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">아이템 레벨</dt>
                <dd className="font-medium">IL{raidGroup.raid.min_ilvl} ~ IL{raidGroup.raid.max_ilvl}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">생성일</dt>
                <dd className="font-medium">{formatDate(raidGroup.created_at)}</dd>
              </div>
            </dl>
          </div>

          {/* 일정 */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">레이드 일정</h3>
              {isLeader && (
                <Link to={`/raid-groups/${id}/schedules`} className="text-sm text-ff14-accent hover:text-yellow-600">
                  관리
                </Link>
              )}
            </div>
            {schedules.length === 0 ? (
              <p className="text-sm text-gray-500">등록된 일정이 없습니다.</p>
            ) : (
              <ul className="space-y-2">
                {schedules.map(schedule => (
                  <li key={schedule.id} className="text-sm">
                    <span className="font-medium">{schedule.title}</span>
                    <span className="text-gray-500 block">
                      {['월', '화', '수', '목', '금', '토', '일'][schedule.weekday]}요일 {schedule.start_time} ~ {schedule.end_time}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 빠른 링크 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">빠른 링크</h3>
            <div className="space-y-2">
              <Link 
                to={`/raid-groups/${id}/distribution`}
                className="block text-sm text-ff14-accent hover:text-yellow-600"
              >
                아이템 분배 현황 →
              </Link>
              <Link 
                to={`/raid-groups/${id}/members`}
                className="block text-sm text-ff14-accent hover:text-yellow-600"
              >
                공대원 장비 현황 →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 가입 모달 */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">공대 가입</h3>
            
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label htmlFor="job_id" className="block text-sm font-medium text-gray-700">
                  직업 *
                </label>
                <select
                  id="job_id"
                  name="job_id"
                  required
                  className="mt-1 input"
                  value={joinData.job_id}
                  onChange={handleJoinDataChange}
                >
                  <option value="">직업 선택</option>
                  <optgroup label="탱커">
                    {jobs.filter(job => job.role === 'tank').map(job => (
                      <option key={job.id} value={job.id}>{job.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="힐러">
                    {jobs.filter(job => job.role === 'healer').map(job => (
                      <option key={job.id} value={job.id}>{job.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="근딜">
                    {jobs.filter(job => job.role === 'melee').map(job => (
                      <option key={job.id} value={job.id}>{job.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="원딜">
                    {jobs.filter(job => job.role === 'ranged').map(job => (
                      <option key={job.id} value={job.id}>{job.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="캐스터">
                    {jobs.filter(job => job.role === 'caster').map(job => (
                      <option key={job.id} value={job.id}>{job.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label htmlFor="character_name" className="block text-sm font-medium text-gray-700">
                  캐릭터명 *
                </label>
                <input
                  type="text"
                  id="character_name"
                  name="character_name"
                  required
                  className="mt-1 input"
                  value={joinData.character_name}
                  onChange={handleJoinDataChange}
                />
              </div>

              <div>
                <label htmlFor="item_level" className="block text-sm font-medium text-gray-700">
                  아이템레벨 *
                </label>
                <input
                  type="number"
                  id="item_level"
                  name="item_level"
                  required
                  className="mt-1 input"
                  value={joinData.item_level}
                  onChange={handleJoinDataChange}
                  min={raidGroup.raid.min_ilvl}
                  max={raidGroup.raid.max_ilvl}
                />
                <p className="mt-1 text-sm text-gray-500">
                  최소: {raidGroup.raid.min_ilvl} / 최대: {raidGroup.raid.max_ilvl}
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="btn btn-secondary"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  가입하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// 플레이어 카드 컴포넌트
const PlayerCard = ({ player, isLeader }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-3 flex items-center justify-between">
      <div>
        <div className="flex items-center space-x-2">
          <span className="font-medium text-sm">{player.character_name}</span>
          {isLeader && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-ff14-accent text-white">
              공대장
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-xs text-gray-500">{player.job.name}</span>
          <span className="text-xs text-gray-500">IL{player.item_level}</span>
        </div>
      </div>
      <RoleBadge role={player.job.role} size="small" />
    </div>
  );
};

// 빈 슬롯 컴포넌트
const EmptySlot = () => {
  return (
    <div className="border border-gray-200 border-dashed rounded-lg p-3 flex items-center justify-center">
      <span className="text-sm text-gray-400">빈 자리</span>
    </div>
  );
};

export default RaidGroupDetail;