import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getRaids, getItems, getItemTypes, getCurrencies } from '../../api/raids';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { getItemTypeIcon } from '../../utils/helpers';

const ItemManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [raids, setRaids] = useState([]);
  const [items, setItems] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  
  const [selectedRaid, setSelectedRaid] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showExchangeItems, setShowExchangeItems] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [selectedRaid, showExchangeItems]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [raidsData, typesData, currenciesData] = await Promise.all([
        getRaids(),
        getItemTypes(),
        getCurrencies()
      ]);
      
      const raidsList = Array.isArray(raidsData) ? raidsData : (raidsData.results || []);
      const typesList = Array.isArray(typesData) ? typesData : (typesData.results || []);
      const currenciesList = Array.isArray(currenciesData) ? currenciesData : (currenciesData.results || []);
      
      setRaids(raidsList);
      setItemTypes(typesList);
      setCurrencies(currenciesList);
    } catch (err) {
      console.error('Failed to fetch initial data:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      let itemsData;
      if (selectedRaid) {
        // 특정 레이드 선택 시 해당 레이드 아이템만
        itemsData = await getItems(selectedRaid);
      } else {
        // 전체 아이템 가져오기
        itemsData = await getItems();
      }
      
      const itemsList = Array.isArray(itemsData) ? itemsData : (itemsData.results || []);
      setItems(itemsList);
    } catch (err) {
      console.error('Failed to fetch items:', err);
      setError('아이템을 불러오는데 실패했습니다.');
    }
  };

  // 필터링된 아이템 목록
  const filteredItems = items.filter(item => {
    // 교환 아이템 필터
    if (!showExchangeItems && !item.raid) return false;
    if (selectedRaid === 'exchange' && item.raid) return false;
    if (selectedRaid && selectedRaid !== 'exchange' && (!item.raid || item.raid.id !== parseInt(selectedRaid))) return false;
    
    // 타입 필터
    if (selectedType && item.item_type.id !== parseInt(selectedType)) return false;
    
    // 검색어 필터
    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    return true;
  });

  // 아이템 타입별 그룹화
  const itemsByType = filteredItems.reduce((acc, item) => {
    const typeName = item.item_type.name;
    if (!acc[typeName]) {
      acc[typeName] = [];
    }
    acc[typeName].push(item);
    return acc;
  }, {});

  // 재화 정보 포맷팅
  const formatCurrencyInfo = (item) => {
    if (!item.currency_requirements || item.currency_requirements.length === 0) {
      return <span className="text-gray-400">필요 재화 없음</span>;
    }

    return (
      <div className="flex flex-wrap gap-2">
        {item.currency_requirements.map(req => (
          <span key={req.id} className="inline-flex items-center">
            <span className="font-medium">{req.currency.name}:</span>
            <span className="ml-1">{req.amount}개</span>
          </span>
        ))}
      </div>
    );
  };

  // 획득처 정보 포맷팅
  const formatSourceInfo = (item) => {
    // 보강 아이템인지 확인 (아이템명에 '보강'이 포함되어 있는지)
    const isUpgradedItem = item.name.includes('보강');
    
    if (isUpgradedItem) {
      return (
        <span className="text-sm text-purple-600">
          보강 아이템
        </span>
      );
    }
    
    if (item.raid) {
      return (
        <span className="text-sm text-gray-600">
          {item.raid.name} {item.floor}층
        </span>
      );
    }
    
    return (
      <span className="text-sm text-ff14-accent">
        교환 아이템
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" text="로딩 중..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">아이템 관리</h1>
        <p className="mt-2 text-sm text-gray-600">
          레이드 아이템과 필요 재화를 관리합니다.
        </p>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError('')} />}

      {/* 필터 및 추가 버튼 */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              획득처
            </label>
            <select
              value={selectedRaid}
              onChange={(e) => setSelectedRaid(e.target.value)}
              className="input"
            >
              <option value="">전체</option>
              <option value="exchange">교환 아이템</option>
              {raids.map(raid => (
                <option key={raid.id} value={raid.id}>
                  {raid.name} ({raid.tier})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              아이템 타입
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="input"
            >
              <option value="">전체</option>
              {itemTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              검색
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="아이템 이름으로 검색"
              className="input"
            />
          </div>
          
          <div className="flex items-end">
            <Link
              to={`/admin/items/create${selectedRaid && selectedRaid !== 'exchange' ? `?raid=${selectedRaid}` : ''}`}
              className="btn btn-primary w-full"
            >
              아이템 추가
            </Link>
          </div>
        </div>
        
        <div className="flex items-center">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showExchangeItems}
              onChange={(e) => setShowExchangeItems(e.target.checked)}
              className="rounded text-ff14-accent focus:ring-ff14-accent"
            />
            <span className="ml-2 text-sm text-gray-700">교환 아이템 표시</span>
          </label>
        </div>
      </div>

      {/* 아이템 목록 */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {Object.keys(itemsByType).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">아이템이 없습니다.</p>
          </div>
        ) : (
          Object.entries(itemsByType).map(([typeName, typeItems]) => (
            <div key={typeName} className="border-b border-gray-200 last:border-b-0">
              <div className="bg-gray-50 px-6 py-3">
                <h3 className="text-sm font-medium text-gray-900 flex items-center">
                  <span className="mr-2">{getItemTypeIcon(typeName)}</span>
                  {typeName} ({typeItems.length})
                </h3>
              </div>
              
              <div className="divide-y divide-gray-200">
                {typeItems.map(item => (
                  <div key={item.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h4 className="text-sm font-medium text-gray-900">
                            {item.name}
                          </h4>
                          <span className="ml-2 text-sm text-gray-500">
                            IL{item.item_level}
                          </span>
                          <span className="ml-2">
                            {formatSourceInfo(item)}
                          </span>
                        </div>
                        
                        <div className="mt-1 text-sm text-gray-600">
                          {formatCurrencyInfo(item)}
                        </div>
                        
                        {/* 직업 제한 표시 */}
                        {item.job_restrictions && item.job_restrictions.length > 0 && (
                          <div className="mt-1 text-xs text-gray-500">
                            직업 제한: {item.job_restrictions.map(job => job.name).join(', ')}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Link
                          to={`/admin/items/edit/${item.id}`}
                          className="text-sm text-ff14-accent hover:text-yellow-600"
                        >
                          수정
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* 범례 */}
      <div className="mt-4 bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">범례</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
          <div>• 레이드 드롭: 레이드에서 직접 획득</div>
          <div>• 교환 아이템: 석판 등의 재화로 교환</div>
          <div>• 보강 아이템: 기존 장비를 보강하여 획득</div>
          <div>• 직업 제한: 특정 직업만 착용 가능</div>
        </div>
      </div>
    </div>
  );
};

export default ItemManagement;