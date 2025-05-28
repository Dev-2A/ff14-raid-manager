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
              <p className="text-sm text-gray-600">주간 획득 제한</p>
              <p className="text-sm text-gray-900 mt-1">
                천옥의 낱장: 주당 8개
              </p>
            </div>
          </div>
        </div>

        {/* 재화 상세 */}
        {hasNeeds ? (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">필요 재화 상세</h2>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      재화명
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      필요량
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      예상 소요 주
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(data.currency_needs).map(([currencyName, amount]) => {
                    // 주간 제한 계산 (천옥의 낱장은 주당 8개)
                    const weeklyLimit = currencyName === '천옥의 낱장' ? 8 : 0;
                    const estimatedWeeks = weeklyLimit > 0 ? Math.ceil(amount / weeklyLimit) : '-';
                    
                    return (
                      <tr key={currencyName}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {currencyName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatNumber(amount)}개
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {estimatedWeeks === '-' ? '-' : `${estimatedWeeks}주`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="3" className="px-6 py-3 text-sm text-gray-600">
                      * 예상 소요 주는 주간 제한이 있는 재화에만 표시됩니다.
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* 팁 */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">💡 팁</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 천옥의 낱장은 1~3층에서 획득 가능하며, 주당 최대 8개까지 획득할 수 있습니다.</li>
                <li>• 천옥의 석판은 4층에서만 획득 가능하며, 무기 교환에 사용됩니다.</li>
                <li>• 공대 분배 방식에 따라 실제 획득 시기는 달라질 수 있습니다.</li>
              </ul>
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