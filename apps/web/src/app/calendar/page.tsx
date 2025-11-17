'use client';

import { useState } from 'react';
import { Calendar } from '@/components/calendar';
import { useQuery } from '@tanstack/react-query';

export default function CalendarPage() {
  const selectedYear = new Date().getFullYear();
  const selectedMonth = new Date().getMonth() + 1;
  
  // Mock user ID - in production, this would come from auth
  const userId = 'demo-user-123';

  // Fetch attendance data for the selected month
  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ['attendance', 'month', userId, selectedYear, selectedMonth],
    queryFn: async () => {
      // In production, this would call the actual API
      // For now, return mock data
      return [
        {
          date: '2025-11-15',
          clock_in: '09:00',
          clock_out: '18:30',
          total_hours: 9.5,
          work_mode: 'ONSITE',
        },
        {
          date: '2025-11-16',
          clock_in: '09:15',
          clock_out: '18:00',
          total_hours: 8.75,
          work_mode: 'ONSITE',
        },
        {
          date: '2025-11-17',
          clock_in: '09:00',
          clock_out: '17:00',
          total_hours: 8,
          work_mode: 'REMOTE',
        },
      ];
    },
  });

  // Calculate monthly stats
  const monthlyStats = attendanceData?.reduce(
    (acc, record) => {
      acc.totalHours += record.total_hours;
      acc.workDays += 1;
      if (record.work_mode === 'REMOTE') {
        acc.remoteDays += 1;
      }
      return acc;
    },
    { totalHours: 0, workDays: 0, remoteDays: 0 }
  ) || { totalHours: 0, workDays: 0, remoteDays: 0 };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>근무 캘린더</h1>
        <p className="page-description">월별 근무 시간과 일정을 확인하세요</p>
      </div>

      {/* Monthly Stats */}
      <div className="stats-summary">
        <div className="stat-card">
          <span className="stat-label">총 근무일</span>
          <span className="stat-value">{monthlyStats.workDays}일</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">총 근무시간</span>
          <span className="stat-value">{monthlyStats.totalHours.toFixed(1)}시간</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">재택근무</span>
          <span className="stat-value">{monthlyStats.remoteDays}일</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">평균 근무시간</span>
          <span className="stat-value">
            {monthlyStats.workDays > 0
              ? (monthlyStats.totalHours / monthlyStats.workDays).toFixed(1)
              : 0}
            시간/일
          </span>
        </div>
      </div>

      {/* Calendar */}
      <Calendar 
        year={selectedYear}
        month={selectedMonth}
        attendanceData={attendanceData}
        isLoading={isLoading}
      />

      {/* Attendance Details */}
      {attendanceData && attendanceData.length > 0 && (
        <div className="attendance-details">
          <h2>상세 내역</h2>
          <div className="details-list">
            {attendanceData
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((record) => (
                <div key={record.date} className="detail-item">
                  <div className="detail-date">
                    <strong>{record.date}</strong>
                    <span className={`work-mode-badge ${record.work_mode.toLowerCase()}`}>
                      {record.work_mode === 'ONSITE'
                        ? '현장근무'
                        : record.work_mode === 'REMOTE'
                        ? '재택근무'
                        : '외근'}
                    </span>
                  </div>
                  <div className="detail-time">
                    <span>출근: {record.clock_in}</span>
                    <span>퇴근: {record.clock_out}</span>
                    <span className="total-hours">
                      총 {record.total_hours}시간
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
