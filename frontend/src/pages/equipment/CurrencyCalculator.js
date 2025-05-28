import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { calculateCurrencyNeeds } from '../../api/raids';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { formatNumber } from '../../utils/helpers';

 const CurrencyCalculator = () => {
  const [searchParams] = useSearchParams();
  const playerId = searchParams.get('player');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    if (playerId) {
      fetchCurrencyNeeds();
    }
  }, [playerId]);

  const fetchCurrencyNeeds = async () => {
    try {
      setLoading(true);
      const result = await calculateCurrencyNeeds(playerId);
      setData(result);
    } catch (err) {
      console.error('Failed to calculate currency needs:', err);
      setError('재화 계산에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 재화를 타입별로 분류하는 함수
  const categorizeCurrencies = (currencyNeeds) => {
    const categories = {
      layers: [], // 층별 낱장 (주간 제한 있음)
      weekly: [], // 주간 제한 재화 (석판 등)
      upgrade: [] // 업그레이드 재화
    };

    Object.entries(currencyNeeds).forEach(([currencyName, amount]) => {
      // 재화 이름으로 타입 구분
      if (currencyName.includes('낱장')) {
        // 층별 낱장 구분
        const layerMatch = currencyName.match(/(\d)층/);
        const layer = layerMatch ? layerMatch[1] : '?';
        categories.layers.push({
          name: currencyName,
          amount,
          layer,
          weeklyLimit: 1 // 각 층 주당 1개 제한
        });
      } else if (currencyName.includes('석판') && !currencyName.includes('보강')) {
        // 일반 석판 (주간 제한 있음)
        categories.weekly.push({
          name: currencyName,
          amount,
          weeklyLimit: 2000 // 주당 2000개 제한
        });
      } else if (currencyName.includes('보강')) {
        // 보강 관련 재화
        categories.upgrade.push({
          name: currencyName,
          amount,
          weeklyLimit: 0
        });
      } else {
        // 기타 재화 (제작 등)
        categories.upgrade.push({
          name: currencyName,
          amount,
          weeklyLimit: 0
        });
      }
    });

    // 층별로 정렬
    categories.layers.sort((a, b) => a.layer - b.layer);

    return categories;
  };

  // 전체 예상 소요 주수 계산
  const calculateTotalWeeks = (categorizedCurrencies) => {
    if (!categorizedCurrencies) return 0;

    let maxWeeks = 0;

    // 층별 낱장 소요 주수 (각 층별로 계산)
    categorizedCurrencies.layers.forEach(currency => {
      const weeks = Math.ceil(currency.amount / currency.weeklyLimit);
      maxWeeks = Math.max(maxWeeks, weeks);
    });

    // 석판 소요 주수
    categorizedCurrencies.weekly.forEach(currency => {
      const weeks = Math.ceil(currency.amount / currency.weeklyLimit);
      maxWeeks = Math.max(maxWeeks, weeks);
    });

    return maxWeeks;
  };

  if (!playerId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">플레이어 정보가 필요합니다.</p>
        <Link to="/equipment" className="text-ff14-accent hover:text-yellow-600">
          장비 관리로 돌아가기
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" text="재화를 계산하는 중..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorMessage message={error} />
        <div className="text-center mt-4">
          <Link to="/equipment" className="text-ff14-accent hover:text-yellow-600">
            장비 관리로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const hasNeeds = data.currency_needs && Object.keys(data.currency_needs).length > 0;
  const categorizedCurrencies = hasNeeds ? categorizeCurrencies(data.currency_needs) : null;
  const totalWeeks = calculateTotalWeeks(categorizedCurrencies);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">필요 재화 계산</h1>
          <div className="text-sm text-gray-600">
            <span>{data.player.character_name}</span>
            <span className="mx-2">|</span>
            <span>{data.player.job.name}</span>
            <span className="mx-2">|</span>
            <span>IL{data.player.item_level}</span>
          </div>
        </div>

        {/* 요약 정보 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">필요한 아이템 수</p>
              <p className="text-2xl font-bold text-gray-900">{data.needed_items_count}개</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">예상 총 소요 기간</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalWeeks > 0 ? `최소 ${totalWeeks}주` : '제한 없음'}
              </p>
            </div>
          </div>
        </div>

        {/* 재화 상세 */}
        {hasNeeds && categorizedCurrencies ? (
          <div className="space-y-6">
            {/* 층별 낱장 (주간 제한) */}
            {categorizedCurrencies.layers.length > 0 && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">⚔️</span>
                  영웅 레이드 층별 낱장
                  <span className="ml-2 text-sm text-red-600">(주간 제한)</span>
                </h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
                  <table className="min-w-full">
                    <thead className="bg-blue-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-blue-900 uppercase">층</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-blue-900 uppercase">재화명</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-blue-900 uppercase">필요량</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-blue-900 uppercase">주간 제한</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-blue-900 uppercase">예상 소요</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-200">
                      {categorizedCurrencies.layers.map((currency, index) => {
                        const weeksNeeded = Math.ceil(currency.amount / currency.weeklyLimit);
                        return (
                          <tr key={index} className="bg-white">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {currency.layer}층
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {currency.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                              {formatNumber(currency.amount)}개
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 text-right">
                              {currency.weeklyLimit}개/주
                            </td>
                            <td className="px-4 py-3 text-sm text-blue-700 text-right font-medium">
                              {weeksNeeded}주
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="bg-blue-100 px-4 py-2 text-xs text-blue-800">
                    * 각 층은 주당 1개씩만 획득 가능하며, 여러 개가 필요한 경우 해당 주수만큼 반복 클리어가 필요합니다.
                  </div>
                </div>
              </div>
            )}

            {/* 주간 제한 재화 (석판) */}
            {categorizedCurrencies.weekly.length > 0 && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">💎</span>
                  석판 (주간 제한)
                </h2>
                <div className="bg-purple-50 border border-purple-200 rounded-lg overflow-hidden">
                  <table className="min-w-full">
                    <thead className="bg-purple-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-purple-900 uppercase">재화명</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-purple-900 uppercase">필요량</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-purple-900 uppercase">주간 제한</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-purple-900 uppercase">예상 소요</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-200">
                      {categorizedCurrencies.weekly.map((currency, index) => {
                        const weeksNeeded = Math.ceil(currency.amount / currency.weeklyLimit);
                        return (
                          <tr key={index} className="bg-white">
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {currency.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                              {formatNumber(currency.amount)}개
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 text-right">
                              {formatNumber(currency.weeklyLimit)}개/주
                            </td>
                            <td className="px-4 py-3 text-sm text-purple-700 text-right font-medium">
                              {weeksNeeded}주
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 업그레이드 재화 */}
            {categorizedCurrencies.upgrade.length > 0 && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">🔧</span>
                  보강/기타 재화
                </h2>
                <div className="bg-green-50 border border-green-200 rounded-lg overflow-hidden">
                  <table className="min-w-full">
                    <thead className="bg-green-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-green-900 uppercase">재화명</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-green-900 uppercase">필요량</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-green-900 uppercase">획득 방법</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-green-200">
                      {categorizedCurrencies.upgrade.map((currency, index) => (
                        <tr key={index} className="bg-white">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {currency.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                            {formatNumber(currency.amount)}개
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {currency.name.includes('보강') 
                              ? '레이드 드랍 또는 낱장 교환'
                              : '제작 또는 장터 구매'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 팁 */}
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-amber-900 mb-2">💡 획득 방법 안내</h3>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• <strong>층별 낱장</strong>: 각 층 클리어 시 획득 (각 층당 주 1개 제한)</li>
                <li>• <strong>석판</strong>: 일일 던전, 주간 퀘스트 등으로 획득 (주당 2,000개 제한)</li>
                <li>• <strong>보강 재화</strong>: 레이드 보스 처치 시 확률적 드랍 또는 낱장으로 교환</li>
                <li>• <strong>제작 장비</strong>: 제작 직업이나 장터를 통해 획득</li>
              </ul>
            </div>

            {/* 주의사항 */}
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-red-900 mb-2">⚠️ 주의사항</h3>
              <p className="text-sm text-red-700">
                실제 획득 기간은 공대 분배 방식, 경쟁 인원, 운 등에 따라 크게 달라질 수 있습니다. 
                위 예상 소요 기간은 모든 재화를 혼자 획득하는 경우를 가정한 최소 기간입니다.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              현재 장비와 목표 장비가 동일하거나, 목표 장비가 설정되지 않았습니다.
            </p>
            <Link to="/equipment" className="text-ff14-accent hover:text-yellow-600">
              장비 관리로 돌아가기
            </Link>
          </div>
        )}

        {/* 버튼 */}
        <div className="mt-6 flex justify-end">
          <Link to="/equipment" className="btn btn-secondary">
            장비 관리로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CurrencyCalculator;