import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRaids, getJobs, createRaidGroup } from '../../api/raids';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import SuccessMessage from '../../components/SuccessMessage';

const RaidGroupCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [raids, setRaids] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    raid_id: '',
    distribution_method: 'priority',
    job_id: '',
    character_name: '',
    item_level: '',
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoadingData(true);
      const [raidsData, jobsData] = await Promise.all([
        getRaids(),
        getJobs()
      ]);
      
      console.log('Raids data:', raidsData);
      console.log('Jobs data:', jobsData);
      
      // API 응답이 페이지네이션된 경우와 아닌 경우 모두 처리
      const raidsList = Array.isArray(raidsData) ? raidsData : (raidsData.results || []);
      const jobsList = Array.isArray(jobsData) ? jobsData : (jobsData.results || []);
      
      setRaids(raidsList);
      setJobs(jobsList);
      
      console.log('Processed raids:', raidsList);
      console.log('Processed jobs:', jobsList);
    } catch (err) {
      console.error('Failed to fetch initial data:', err);
      setError('초기 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 레이드 선택 시 아이템 레벨 기본값 설정
    if (name === 'raid_id' && value) {
      const selectedRaid = raids.find(r => r.id === parseInt(value));
      if (selectedRaid) {
        setFormData(prev => ({
          ...prev,
          item_level: selectedRaid.min_ilvl.toString()
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 유효성 검사
    if (!formData.name || !formData.raid_id) {
      setError('공대명과 레이드를 선택해주세요.');
      return;
    }

    if (!formData.job_id || !formData.character_name || !formData.item_level) {
      setError('공대장의 직업, 캐릭터명, 아이템레벨을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // 공대 생성 요청 데이터 (공대장 정보 포함)
      const raidGroupData = {
        name: formData.name,
        raid_id: parseInt(formData.raid_id),
        distribution_method: formData.distribution_method,
        // 공대장 정보 추가
        leader_job_id: parseInt(formData.job_id),
        leader_character_name: formData.character_name,
        leader_item_level: parseInt(formData.item_level),
      };

      const response = await createRaidGroup(raidGroupData);
      setSuccess('공대가 생성되었습니다!');
      
      // 생성된 공대 페이지로 이동
      setTimeout(() => {
        navigate(`/raid-groups/${response.id}`);
      }, 1500);
    } catch (err) {
      console.error('Failed to create raid group:', err);
      setError(err.message || '공대 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" text="데이터를 불러오는 중..." />
      </div>
    );
  }

  const selectedRaid = raids.find(r => r.id === parseInt(formData.raid_id));

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">새 공대 만들기</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 공대 정보 섹션 */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">공대 정보</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  공대명 *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="mt-1 input"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="예: 천옥 주말 공대"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="raid_id" className="block text-sm font-medium text-gray-700">
                  레이드 *
                </label>
                <select
                  id="raid_id"
                  name="raid_id"
                  required
                  className="mt-1 input"
                  value={formData.raid_id}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="">레이드 선택</option>
                  {raids.map(raid => (
                    <option key={raid.id} value={raid.id}>
                      {raid.name} ({raid.tier}) - IL{raid.min_ilvl}~{raid.max_ilvl}
                    </option>
                  ))}
                </select>
                {raids.length === 0 && !loading && (
                  <p className="mt-1 text-sm text-red-600">
                    레이드 데이터를 불러올 수 없습니다. 관리자에게 문의하세요.
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="distribution_method" className="block text-sm font-medium text-gray-700">
                  분배 방식 *
                </label>
                <select
                  id="distribution_method"
                  name="distribution_method"
                  required
                  className="mt-1 input"
                  value={formData.distribution_method}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="priority">우선순위 분배</option>
                  <option value="rotation">먹고 빠지기</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  {formData.distribution_method === 'priority' 
                    ? '필요 재화량이 많은 공대원이 우선순위를 갖습니다.'
                    : '획득한 아이템을 모든 공대원이 1번씩 받을 때까지 재획득할 수 없습니다.'}
                </p>
              </div>
            </div>
          </div>

          {/* 공대장 정보 섹션 */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">공대장 정보</h2>
            <p className="text-sm text-gray-500 mb-4">
              공대를 생성하면 자동으로 공대장이 되며, 첫 번째 공대원으로 등록됩니다.
            </p>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="job_id" className="block text-sm font-medium text-gray-700">
                  직업 *
                </label>
                <select
                  id="job_id"
                  name="job_id"
                  required
                  className="mt-1 input"
                  value={formData.job_id}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="">직업 선택</option>
                  <optgroup label="탱커">
                    {jobs
                      .filter(job => job.role === 'tank')
                      .map(job => (
                        <option key={job.id} value={job.id}>
                          {job.name}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="힐러">
                    {jobs
                      .filter(job => job.role === 'healer')
                      .map(job => (
                        <option key={job.id} value={job.id}>
                          {job.name}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="근딜">
                    {jobs
                      .filter(job => job.role === 'melee')
                      .map(job => (
                        <option key={job.id} value={job.id}>
                          {job.name}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="원딜">
                    {jobs
                      .filter(job => job.role === 'ranged')
                      .map(job => (
                        <option key={job.id} value={job.id}>
                          {job.name}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="캐스터">
                    {jobs
                      .filter(job => job.role === 'caster')
                      .map(job => (
                        <option key={job.id} value={job.id}>
                          {job.name}
                        </option>
                      ))}
                  </optgroup>
                </select>
                {jobs.length === 0 && !loading && (
                  <p className="mt-1 text-sm text-red-600">
                    직업 데이터를 불러올 수 없습니다. 관리자에게 문의하세요.
                  </p>
                )}
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
                  value={formData.character_name}
                  onChange={handleChange}
                  placeholder="게임 내 캐릭터명"
                  disabled={loading}
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
                  value={formData.item_level}
                  onChange={handleChange}
                  min={selectedRaid?.min_ilvl || 1}
                  max={selectedRaid?.max_ilvl || 999}
                  disabled={loading || !formData.raid_id}
                />
                {selectedRaid && (
                  <p className="mt-1 text-sm text-gray-500">
                    최소: {selectedRaid.min_ilvl} / 최대: {selectedRaid.max_ilvl}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 에러/성공 메시지 */}
          {error && <ErrorMessage message={error} onClose={() => setError('')} />}
          {success && <SuccessMessage message={success} />}

          {/* 제출 버튼 */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/raid-groups')}
              className="btn btn-secondary"
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || success}
            >
              {loading ? <LoadingSpinner size="small" text="" /> : '공대 생성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RaidGroupCreate;