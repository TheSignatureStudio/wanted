'use client';

import Link from 'next/link';
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
      
      <div className="page-container">
        <div className="page-header">
          <h1>출퇴근 관리</h1>
          <p className="page-description">출퇴근을 기록하고 주간 근무시간을 확인하세요</p>
        </div>

        <div className="dashboard-grid">
          {/* Left Column - Attendance Check */}
          <div className="dashboard-main">
            <AttendanceCheck userId={userId} />
          </div>

          {/* Right Column - Stats */}
          <div className="dashboard-sidebar">
            {/* Weekly Hours Card */}
            <div className="stats-card">
              <h3>이번 주 근무시간</h3>
              
              <div className="progress-section">
                <div className="progress-header">
                  <span>진행률</span>
                  <span className="progress-value">
                    {totalHours}시간 {totalMinutes}분 / {weeklyLimit}시간
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${
                      usagePercent > 100
                        ? 'exceeded'
                        : usagePercent > 80
                        ? 'warning'
                        : 'normal'
                    }`}
                    style={{ width: `${Math.min(usagePercent, 100)}%` }}
                  />
                </div>
              </div>

              {summary?.summary.exceeds_limit === 1 && (
                <div className="alert alert-danger">
                  <p><strong>⚠️ 주 52시간 초과</strong></p>
                  <p>초과 근무: {overtimeHours}시간</p>
                </div>
              )}

              {usagePercent > 80 && usagePercent <= 100 && (
                <div className="alert alert-warning">
                  <p><strong>⚠️ 근무시간 주의</strong></p>
                  <p>주 52시간 제한에 근접하고 있습니다</p>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="stats-card">
              <h3>빠른 통계</h3>
              
              <div className="quick-stats">
                <div className="stat-item">
                  <span className="stat-label">이번 달 근무일</span>
                  <span className="stat-value">-</span>
                </div>
                
                <div className="stat-item">
                  <span className="stat-label">남은 연차</span>
                  <span className="stat-value">-</span>
                </div>
                
                <div className="stat-item">
                  <span className="stat-label">승인 대기 중</span>
                  <span className="stat-value">-</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="stats-card">
              <h3>바로가기</h3>
              
              <div className="quick-actions">
                <Link href="/remote" className="action-button">
                  <strong>재택 신청</strong>
                  <span>원격 근무 일정 등록</span>
                </Link>
                
                <Link href="/leave" className="action-button">
                  <strong>휴가 신청</strong>
                  <span>연차 사용 신청</span>
                </Link>
                
                <Link href="/reservations" className="action-button">
                  <strong>회의실 예약</strong>
                  <span>회의 공간 예약</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

