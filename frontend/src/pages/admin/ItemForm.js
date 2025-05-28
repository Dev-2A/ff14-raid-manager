import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  getRaids,
  getItemTypes,
  getJobs,
  createItem,
  getItem,
  updateItem,
  getCurrencies
} from '../../api/raids';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import SuccessMessage from '../../components/SuccessMessage';

const ItemForm = () => {
  const { id } = useParams(); //편집 모드일 때 아이템 ID
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultRaidId = searchParams.get('raid');

  const isEditMode = !!id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [raids, setRaids] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    item_type_id: '',
    item_level: '',
    raid_id: defaultRaidId || '',
    floor: '1',
    is_weapon: false,
    job_restrictions: []
  });

  // 재화 요구사항 관리
  const [currencyRequirements, setCurrencyRequirements] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (isEditMode && id) {
      fetchItemData();
    }
  }, [id]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [raidsData, typesData, currenciesData, jobsData] = await Promise.all([
        getRaids(),
        getItemTypes(),
        getCurrencies(),
        getJobs()
      ]);

      setRaids(Array.isArray(raidsData) ? raidsData : (raidsData.results || []));
      setItemTypes(Array.isArray(typesData) ? typesData : (typesData.results || []));
      setCurrencies(Array.isArray(currenciesData) ? currenciesData : (currenciesData.results || []));
      setJobs(Array.isArray(jobsData) ? jobsData : (jobsData.results || []));
    } catch (err) {
      console.error('Failed to fetch initial data:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      if (!isEditMode) {
        setLoading(false);
      }
    }
  };

  const fetchItemData = async () => {
    try {
      const itemData = await getItem(id);
      
      setFormData({
        name: itemData.name,
        item_type_id: itemData.item_type.id.toString(),
        item_level: itemData.item_level.toString(),
        raid_id: itemData.raid.toString(),
        floor: itemData.floor.toString(),
        is_weapon: itemData.is_weapon,
        job_restrictions: itemData.job_restrictions.map(job => job.id.toString())
      });
      
      // 재화 요구사항 설정
      if (itemData.currency_requirements) {
        setCurrencyRequirements(
          itemData.currency_requirements.map(req => ({
            currency_id: req.currency.id.toString(),
            amount: req.amount.toString()
          }))
        );
      }
    } catch (err) {
      console.error('Failed to fetch item data:', err);
      setError('아이템 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleJobToggle = (jobId) => {
    setFormData(prev => ({
      ...prev,
      job_restrictions: prev.job_restrictions.includes(jobId)
        ? prev.job_restrictions.filter(id => id !== jobId)
        : [...prev.job_restrictions, jobId]
    }));
  };

  const addCurrencyRequirement = () => {
    setCurrencyRequirements(prev => [...prev, { currency_id: '', amount: '' }]);
  };

  const removeCurrencyRequirement = (index) => {
    setCurrencyRequirements(prev => prev.filter((_, i) => i !== index));
  };

  const updateCurrencyRequirement = (index, field, value) => {
    setCurrencyRequirements(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 유효성 검사
    if (!formData.name || !formData.item_type_id || !formData.item_level || !formData.raid_id) {
      setError('필수 항목을 모두 입력해주세요.');
      return;
    }
    
    try {
      setSaving(true);
      setError('');
      
      const submitData = {
        name: formData.name,
        item_type_id: parseInt(formData.item_type_id),
        item_level: parseInt(formData.item_level),
        raid_id: parseInt(formData.raid_id),
        floor: parseInt(formData.floor),
        is_weapon: formData.is_weapon,
        job_restrictions: formData.job_restrictions.map(id => parseInt(id)),
        currency_requirements: currencyRequirements
          .filter(req => req.currency_id && req.amount)
          .map(req => ({
            currency_id: parseInt(req.currency_id),
            amount: parseInt(req.amount)
          }))
      };
      
      if (isEditMode) {
        await updateItem(id, submitData);
        setSuccess('아이템이 수정되었습니다!');
      } else {
        await createItem(submitData);
        setSuccess('아이템이 생성되었습니다!');
      }
      
      setTimeout(() => {
        navigate('/admin/items');
      }, 1500);
    } catch (err) {
      console.error('Failed to save item:', err);
      setError('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" text="로딩 중..." />
      </div>
    );
  }

  // 선택된 레이드의 재화만 필터링
  const raidCurrencies = currencies.filter(c => c.raid === parseInt(formData.raid_id));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isEditMode ? '아이템 수정' : '아이템 추가'}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">기본 정보</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  아이템명 *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 input"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  아이템 타입 *
                </label>
                <select
                  name="item_type_id"
                  value={formData.item_type_id}
                  onChange={handleChange}
                  className="mt-1 input"
                  required
                >
                  <option value="">선택하세요</option>
                  {itemTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  아이템 레벨 *
                </label>
                <input
                  type="number"
                  name="item_level"
                  value={formData.item_level}
                  onChange={handleChange}
                  className="mt-1 input"
                  min="1"
                  max="999"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  레이드 *
                </label>
                <select
                  name="raid_id"
                  value={formData.raid_id}
                  onChange={handleChange}
                  className="mt-1 input"
                  required
                >
                  <option value="">선택하세요</option>
                  {raids.map(raid => (
                    <option key={raid.id} value={raid.id}>
                      {raid.name} ({raid.tier})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  층 *
                </label>
                <select
                  name="floor"
                  value={formData.floor}
                  onChange={handleChange}
                  className="mt-1 input"
                  required
                >
                  <option value="1">1층</option>
                  <option value="2">2층</option>
                  <option value="3">3층</option>
                  <option value="4">4층</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_weapon"
                    checked={formData.is_weapon}
                    onChange={handleChange}
                    className="rounded text-ff14-accent focus:ring-ff14-accent"
                  />
                  <span className="ml-2 text-sm text-gray-700">무기 여부</span>
                </label>
              </div>
            </div>
          </div>
          
          {/* 재화 요구사항 */}
          <div className="border-b border-gray-200 pb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">필요 재화</h2>
              <button
                type="button"
                onClick={addCurrencyRequirement}
                className="btn btn-secondary text-sm"
                disabled={raidCurrencies.length === 0}
              >
                재화 추가
              </button>
            </div>
            
            {raidCurrencies.length === 0 ? (
              <p className="text-sm text-gray-500">레이드를 먼저 선택해주세요.</p>
            ) : currencyRequirements.length === 0 ? (
              <p className="text-sm text-gray-500">필요한 재화가 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {currencyRequirements.map((req, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <select
                      value={req.currency_id}
                      onChange={(e) => updateCurrencyRequirement(index, 'currency_id', e.target.value)}
                      className="flex-1 input"
                    >
                      <option value="">재화 선택</option>
                      {raidCurrencies.map(currency => (
                        <option key={currency.id} value={currency.id}>
                          {currency.name}
                        </option>
                      ))}
                    </select>
                    
                    <input
                      type="number"
                      value={req.amount}
                      onChange={(e) => updateCurrencyRequirement(index, 'amount', e.target.value)}
                      placeholder="수량"
                      className="w-24 input"
                      min="1"
                    />
                    
                    <button
                      type="button"
                      onClick={() => removeCurrencyRequirement(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* 직업 제한 */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">직업 제한</h2>
            <p className="text-sm text-gray-500 mb-4">
              선택하지 않으면 모든 직업이 착용 가능합니다.
            </p>
            
            <div className="space-y-4">
              {['tank', 'healer', 'melee', 'ranged', 'caster'].map(role => (
                <div key={role}>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    {role === 'tank' && '탱커'}
                    {role === 'healer' && '힐러'}
                    {role === 'melee' && '근딜'}
                    {role === 'ranged' && '원딜'}
                    {role === 'caster' && '캐스터'}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {jobs
                      .filter(job => job.role === role)
                      .map(job => (
                        <label key={job.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.job_restrictions.includes(job.id.toString())}
                            onChange={() => handleJobToggle(job.id.toString())}
                            className="rounded text-ff14-accent focus:ring-ff14-accent"
                          />
                          <span className="ml-2 text-sm">{job.name}</span>
                        </label>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 에러/성공 메시지 */}
          {error && <ErrorMessage message={error} onClose={() => setError('')} />}
          {success && <SuccessMessage message={success} />}
          
          {/* 버튼 */}
          <div className="flex justify-end space-x-3">
            <Link
              to="/admin/items"
              className="btn btn-secondary"
            >
              취소
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? <LoadingSpinner size="small" text="" /> : (isEditMode ? '수정' : '생성')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemForm;