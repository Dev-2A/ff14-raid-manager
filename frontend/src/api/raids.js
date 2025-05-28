import api from './config';

// 레이드 목록 조회
export const getRaids = async () => {
  try {
    const response = await api.get('/raids/raids/');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// 레이드 상세 조회
export const getRaid = async (id) => {
  try {
    const response = await api.get(`/raids/raids/${id}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// 공대 목록 조회
export const getRaidGroups = async () => {
  try {
    const response = await api.get('/raids/groups/');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// 내가 속한 공대 목록
export const getMyRaidGroups = async () => {
  try {
    const response = await api.get('/raids/groups/my_groups/');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// 공대 상세 조회
export const getRaidGroup = async (id) => {
  try {
    const response = await api.get(`/raids/groups/${id}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// 공대 생성
export const createRaidGroup = async (groupData) => {
  try {
    const response = await api.post('/raids/groups/', groupData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// 공대 가입
export const joinRaidGroup = async (groupId, playerData) => {
  try {
    const response = await api.post(`/raids/groups/${groupId}/join/`, playerData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// 공대 탈퇴
export const leaveRaidGroup = async (groupId) => {
  try {
    const response = await api.post(`/raids/groups/${groupId}/leave/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// 직업 목록 조회
export const getJobs = async () => {
  try {
    const response = await api.get('/raids/jobs/');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// 공대원 목록 조회
export const getPlayers = async (raidGroupId, activeOnly = true) => {
  try {
    const response = await api.get('/raids/players/', {
      params: { 
        raid_group: raidGroupId,
        active_only: activeOnly
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// 아이템 목록 조회
export const getItems = async (raidId) => {
  try {
    const response = await api.get('/raids/items/', {
      params: { raid: raidId }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// 아이템 상세 조회
export const getItem = async (id) => {
  try {
    const response = await api.get(`/raids/items/${id}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// 아이템 생성
export const createItem = async (itemData) => {
  try {
    const response = await api.post('/raids/items/', itemData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// 아이템 수정
export const updateItem = async (id, itemData) => {
  try {
    const response = await api.patch(`/raids/items/${id}/`, itemData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// 아이템 타입 목록 조회
export const getItemTypes = async () => {
  try {
    const response = await api.get('/raids/item-types/');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// 재화 목록 조회
export const getCurrencies = async () => {
  try {
    const response = await api.get('/raids/currencies/');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// 장비 세트 목록 조회
export const getEquipmentSets = async (playerId) => {
  try {
    const response = await api.get('/raids/equipment-sets/', {
      params: { player: playerId }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// 장비 세트 생성
export const createEquipmentSet = async (setData) => {
  try {
    const response = await api.post('/raids/equipment-sets/', setData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// 장비 일괄 업데이트
export const bulkUpdateEquipments = async (setId, items) => {
  try {
    const response = await api.post(`/raids/equipment-sets/${setId}/bulk_update_equipments/`, { items });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// 아이템 분배 기록 조회
export const getItemDistributions = async (raidGroupId) => {
  try {
    const response = await api.get('/raids/distributions/', {
      params: { raid_group: raidGroupId }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// 아이템 분배 기록 생성
export const createItemDistribution = async (distributionData) => {
  try {
    const response = await api.post('/raids/distributions/', distributionData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// 재화 필요량 계산
export const calculateCurrencyNeeds = async (playerId) => {
  try {
    const response = await api.get('/raids/calculate-currency-needs/', {
      params: { player_id: playerId }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// 분배 우선순위 계산
export const calculateDistributionPriority = async (raidGroupId) => {
  try {
    const response = await api.post('/raids/calculate-distribution-priority/', {
      raid_group_id: raidGroupId
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// 레이드 일정 조회
export const getRaidSchedules = async (raidGroupId) => {
  try {
    const response = await api.get('/raids/schedules/', {
      params: { raid_group: raidGroupId }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// 레이드 일정 생성
export const createRaidSchedule = async (scheduleData) => {
  try {
    const response = await api.post('/raids/schedules/', scheduleData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};