import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getPlayers,
  getEquipmentSets,
  createEquipmentSet,
  getItems,
  getItemTypes,
  bulkUpdateEquipments,
  getRaidGroup
} from '../../api/raids';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import SuccessMessage from '../../components/SuccessMessage';
import { getItemTypeIcon } from '../../utils/helpers';

const EquipmentEdit = () => {
  const { playerId, setType } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [player, setPlayer] = useState(null);
  const [raidGroup, setRaidGroup] = useState(null);
  const [equipmentSet, setEquipmentSet] = useState(null);
  const [items, setItems] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});

  const setTypeLabels = {
    start: '출발 비스',
    current: '현재 비스',
    target: '최종 비스'
  };

  useEffect(() => {
    fetchData();
  }, [playerId, setType]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // 플레이어 정보 가져오기
      const playersData = await getPlayers();
      const players = Array.isArray(playersData) ? playersData : (playersData.results || []);
      const playerInfo = players.find(p => p.id === parseInt(playerId));

      if (!playerInfo) {
        setError('플레이어 정보를 찾을 수 없습니다.');
        return;
      }

      setPlayer(playerInfo);

      // 공대 정보 가져오기
      const groupData = await getRaidGroup(playerInfo.raid_group);
      setRaidGroup(groupData);

      // 아이템 타입과 아이템 목록 가져오기
      const [typesData, itemsData] = await Promise.all([
        getItemTypes(),
        getItems(groupData.raid.id)
      ]);

      const types = Array.isArray(typesData) ? typesData : (typesData.results || []);
      const allItems = Array.isArray(itemsData) ? itemsData : (itemsData.results || []);

      setItemTypes(types);
      setItems(allItems);

      // 기존 장비 세트 가져오기
      const setsData = await getEquipmentSets(playerId);
      const sets = Array.isArray(setsData) ? setsData : (setsData.results || []);
      const existingSet = sets.find(s => s.set_type === setType);

      if (existingSet) {
        setEquipmentSet(existingSet);

        // 기존 장비 정보로 selectedItems 초기화
        const selected = {};
        existingSet.equipments?.forEach(eq => {
          selected[eq.item.item_type.id] = {
            item_id: eq.item.id.toString(),
            is_pentamelded: eq.is_pentamelded
          };
        });
        setSelectedItems(selected);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelect = (itemTypeId, itemId) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemTypeId]: {
        item_id: itemId,
        is_pentamelded: prev[itemTypeId]?.is_pentamelded || false
      }
    }));
  };

  const handlePentameldToggle = (itemTypeId) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemTypeId]: {
        ...prev[itemTypeId],
        is_pentamelded: !prev[itemTypeId]?.is_pentamelded
      }
    }));
  };

  const calculateItemLevel = () => {
    let totalItemLevel = 0;
    let count = 0;

    Object.values(selectedItems).forEach(({ item_id }) => {
      const item = items.find(i => i.id === parseInt(item_id));
      if (item) {
        // 무기는 2배 가중치
        if (item.is_weapon) {
          totalItemLevel += item.item_level * 2;
          count += 2;
        } else {
          totalItemLevel += item.item_level;
          count += 1;
        }
      }
    });

    return count > 0 ? Math.round(totalItemLevel / count) : 0;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');

      // 장비 세트가 없으면 먼저 생성
      let setId = equipmentSet?.id;
      if (!setId) {
        const newSet = await createEquipmentSet({
          player: parseInt(playerId),
          set_type: setType
        });
        setId = newSet.id;
      }

      // 선택된 아이템들 준비
      const itemsToSave = Object.values(selectedItems)
        .filter(item => item.item_id)
        .map(item => ({
          item_id: parseInt(item.item_id),
          is_pentamelded: item.is_pentamelded || false
        }));
      
      // 장비 일괄 업데이트
      await bulkUpdateEquipments(setId, itemsToSave);

      setSuccess('장비 세트가 저장되었습니다!');
      setTimeout(() => {
        navigate('/equipment');
      }, 1500);
    } catch (err) {
      console.error('Failed to save equipment set:', err);
      setError('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 직업에 맞는 아이템만 필터링
  const getItemsForSlot = (itemType) => {
    return items.filter(item => {
      if (item.item_type.id !== itemType.id) return false;

      // 직업 제한이 없으면 모든 직업이 착용 가능
      if (!item.job_restrictions || item.job_restrictions.length === 0) return true;

      // 직업 제한이 있으면 해당 직업만 착용 가능
      return item.job_restrictions.some(job => job.id === player.job.id);
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" text="로딩 중..." />
      </div>
    );
  }

  if (!player || !raidGroup) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">정보를 찾을 수 없습니다.</p>
        <Link to="/equipment" className="text-ff14-accent hover:text-yellow-600">
          장비 관리로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {setTypeLabels[setType]} 편집
          </h1>
          <div className="text-sm text-gray-600">
            <span>{player.character_name}</span>
            <span className="mx-2">|</span>
            <span>{player.job.name}</span>
            <span className="mx-2">|</span>
            <span>{raidGroup.name}</span>
          </div>
        </div>

        {/* 평균 아이템 레벨 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">평균 아이템 레벨</span>
            <span className="text-2xl font-bold text-gray-900">IL{calculateItemLevel()}</span>
          </div>
        </div>

        {/* 에러/성공 메시지 */}
        {error && <ErrorMessage message={error} onClose={() => setError('')} />}
        {success && <SuccessMessage message={success} />}

        {/* 장비 슬롯 목록 */}
        <div className="space-y-4 mb-6">
          {itemTypes.map(itemType => {
            const availableItems = getItemsForSlot(itemType);
            const selectedItem = selectedItems[itemType.id];
            
            return (
              <div key={itemType.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{getItemTypeIcon(itemType.name)}</span>
                    <h3 className="font-medium text-gray-900">{itemType.name}</h3>
                  </div>
                  {selectedItem?.item_id && items.find(i => i.id === parseInt(selectedItem.item_id)) && (
                    <span className="text-sm text-gray-600">
                      IL{items.find(i => i.id === parseInt(selectedItem.item_id)).item_level}
                    </span>
                  )}
                </div>
                
                <div className="space-y-2">
                  <select
                    value={selectedItem?.item_id || ''}
                    onChange={(e) => handleItemSelect(itemType.id, e.target.value)}
                    className="w-full input"
                    disabled={saving}
                  >
                    <option value="">선택하지 않음</option>
                    {availableItems.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} (IL{item.item_level}) - {item.floor}층
                      </option>
                    ))}
                  </select>
                  
                  {/* 금단 옵션 (무기와 액세서리는 제외) */}
                  {selectedItem?.item_id && !['무기', '귀걸이', '목걸이', '팔찌', '반지'].includes(itemType.name) && (
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedItem.is_pentamelded || false}
                        onChange={() => handlePentameldToggle(itemType.id)}
                        disabled={saving}
                        className="rounded text-ff14-accent focus:ring-ff14-accent"
                      />
                      <span>금단 적용</span>
                    </label>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 저장 버튼 */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/equipment')}
            className="btn btn-secondary"
            disabled={saving}
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn btn-primary"
            disabled={saving || Object.keys(selectedItems).length === 0}
          >
            {saving ? <LoadingSpinner size="small" text="" /> : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EquipmentEdit;