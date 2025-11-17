'use client';

import { AttendanceCheck } from '@/components/attendance-check';
import { NotificationBanner } from '@/components/notification-banner';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function DashboardPage() {
  // Mock user ID - in production, this would come from auth
  const userId = 'demo-user-123';

  // Get weekly summary
  const { data: summary } = useQuery({
    queryKey: ['weekly-summary', userId],
    queryFn: () => api.getWeeklySummary(userId),
  });

  const totalHours = summary ? Math.floor(summary.summary.total_minutes / 60) : 0;
  const totalMinutes = summary ? summary.summary.total_minutes % 60 : 0;
  const overtimeHours = summary ? Math.floor(summary.summary.overtime_minutes / 60) : 0;
  const weeklyLimit = 52;
  const usagePercent = summary ? (totalHours / weeklyLimit) * 100 : 0;

  return (
    <>
      <NotificationBanner userId={userId} />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Wanted Attendance</h1>
              <p className="text-sm text-gray-600">근태 관리 시스템</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">데모 사용자</p>
              <p className="text-xs text-gray-500">{userId}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Attendance Check */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <AttendanceCheck userId={userId} />
            </div>
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-6">
            {/* Weekly Hours Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">이번 주 근무시간</h3>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">진행률</span>
                  <span className="font-medium">
                    {totalHours}시간 {totalMinutes}분 / {weeklyLimit}시간
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      usagePercent > 100
                        ? 'bg-red-500'
                        : usagePercent > 80
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(usagePercent, 100)}%` }}
                  />
                </div>
              </div>

              {summary?.summary.exceeds_limit === 1 && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  <p className="font-medium">⚠️ 주 52시간 초과</p>
                  <p>초과 근무: {overtimeHours}시간</p>
                </div>
              )}

              {usagePercent > 80 && usagePercent <= 100 && (
                <div className="p-3 bg-yellow-50 text-yellow-700 rounded-lg text-sm">
                  <p className="font-medium">⚠️ 근무시간 주의</p>
                  <p>주 52시간 제한에 근접하고 있습니다</p>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">빠른 통계</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">이번 달 근무일</p>
                  <p className="text-2xl font-bold">-</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">남은 연차</p>
                  <p className="text-2xl font-bold">-</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">승인 대기 중</p>
                  <p className="text-2xl font-bold">-</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">바로가기</h3>
              
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <p className="font-medium">재택 신청</p>
                  <p className="text-xs text-gray-600">원격 근무 일정 등록</p>
                </button>
                
                <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <p className="font-medium">휴가 신청</p>
                  <p className="text-xs text-gray-600">연차 사용 신청</p>
                </button>
                
                <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <p className="font-medium">회의실 예약</p>
                  <p className="text-xs text-gray-600">회의 공간 예약</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      </div>
    </>
  );
}

