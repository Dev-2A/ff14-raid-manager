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

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedRaid) {
      fetchItems();
    }
  }, [selectedRaid]);

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

      // 첫 번째 레이드 자동 선택
      if (raidsList.length > 0) {
        setSelectedRaid(raidsList[0].id.toString());
      }
    } catch (err) {
      console.error('Failed to fetch initial data:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const itemsData = await getItems(selectedRaid);
      const itemsList = Array.isArray(itemsData) ? itemsData : (itemsData.results || []);
      setItems(itemsList);
    } catch (err) {
      console.error('Failed to fetch items:', err);
      setError('아이템을 불러오는데 실패했습니다.');
    }
  };

  // 필터링된 아이템 목록
  const filteredItems = items.filter(item => {
    if (selectedType && item.item_type.id !== parseInt(selectedType)) return false;
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
              레이드
            </label>
            <select
              value={selectedRaid}
              onChange={(e) => setSelectedRaid(e.target.value)}
              className="input"
            >
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
              to={`/admin/items/create?raid=${selectedRaid}`}
              className="btn btn-primary w-full"
            >
              아이템 추가
            </Link>
          </div>
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
                          <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                            {item.floor}층
                          </span>
                        </div>
                        
                        <div className="mt-1 text-sm text-gray-600">
                          {item.currency_requirements && item.currency_requirements.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {item.currency_requirements.map(req => (
                                <span key={req.id} className="inline-flex items-center">
                                  <span className="font-medium">{req.currency.name}:</span>
                                  <span className="ml-1">{req.amount}개</span>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">필요 재화 없음</span>
                          )}
                        </div>
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
    </div>
  );
};

export default ItemManagement;