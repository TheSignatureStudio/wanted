'use client';

import { useState } from 'react';

interface AttendanceRecord {
  date: string;
  clock_in: string;
  clock_out: string;
  total_hours: number;
  work_mode: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  hours?: number;
  isToday: boolean;
  workMode?: string;
}

interface CalendarProps {
  year?: number;
  month?: number;
  attendanceData?: AttendanceRecord[];
  isLoading?: boolean;
}

export function Calendar({ year: propYear, month: propMonth, attendanceData, isLoading }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const year = propYear || currentDate.getFullYear();
  const month = (propMonth ? propMonth - 1 : currentDate.getMonth());

  // Generate calendar days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startDay = firstDayOfMonth.getDay(); // 0 = Sunday

  const days: CalendarDay[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Create a map of attendance data by date
  const attendanceMap = new Map<string, AttendanceRecord>();
  attendanceData?.forEach((record) => {
    attendanceMap.set(record.date, record);
  });

  // Previous month days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDay - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDay - i);
    days.push({
      date,
      isCurrentMonth: false,
      isToday: date.getTime() === today.getTime(),
    });
  }

  // Current month days
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const date = new Date(year, month, i);
    const dateStr = date.toISOString().split('T')[0];
    const attendance = attendanceMap.get(dateStr);
    
    days.push({
      date,
      isCurrentMonth: true,
      hours: attendance?.total_hours,
      workMode: attendance?.work_mode,
      isToday: date.getTime() === today.getTime(),
    });
  }

  // Next month days
  const remainingDays = 42 - days.length; // 6 weeks * 7 days
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i);
    days.push({
      date,
      isCurrentMonth: false,
      isToday: date.getTime() === today.getTime(),
    });
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthName = new Date(year, month).toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: 'long' 
  });

  const totalHours = days
    .filter(d => d.isCurrentMonth && d.hours)
    .reduce((sum, d) => sum + (d.hours || 0), 0);

  const workingDays = days.filter(d => d.isCurrentMonth && d.hours).length;

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="calendar-controls">
          <button onClick={goToPreviousMonth} className="btn-icon" aria-label="이전 월">
            ←
          </button>
          <h2 className="calendar-title">{monthName}</h2>
          <button onClick={goToNextMonth} className="btn-icon" aria-label="다음 월">
            →
          </button>
        </div>
        <div className="calendar-actions">
          <button onClick={goToToday} className="btn-secondary">
            오늘
          </button>
          <div className="view-toggle">
            <button 
              className={viewMode === 'month' ? 'active' : ''}
              onClick={() => setViewMode('month')}
            >
              월
            </button>
            <button 
              className={viewMode === 'week' ? 'active' : ''}
              onClick={() => setViewMode('week')}
            >
              주
            </button>
          </div>
        </div>
      </div>

      <div className="calendar-stats">
        <div className="stat-item">
          <span className="stat-label">총 근무시간</span>
          <span className="stat-value">{isLoading ? '...' : `${totalHours.toFixed(1)}h`}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">근무일수</span>
          <span className="stat-value">{isLoading ? '...' : `${workingDays}일`}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">평균 근무시간</span>
          <span className="stat-value">
            {isLoading ? '...' : workingDays > 0 ? `${(totalHours / workingDays).toFixed(1)}h` : '0h'}
          </span>
        </div>
      </div>

      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
            <div key={day} className="weekday">
              {day}
            </div>
          ))}
        </div>
        <div className="calendar-days">
          {days.map((day, index) => (
            <div
              key={index}
              className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${
                day.isToday ? 'today' : ''
              } ${day.hours ? 'has-hours' : ''} ${day.workMode ? `mode-${day.workMode.toLowerCase()}` : ''}`}
            >
              <div className="day-number">{day.date.getDate()}</div>
              {day.hours && day.isCurrentMonth && (
                <div className="day-hours">{day.hours.toFixed(1)}h</div>
              )}
              {day.workMode && day.isCurrentMonth && (
                <div className="day-mode">
                  {day.workMode === 'ONSITE' ? '🏢' : day.workMode === 'REMOTE' ? '🏡' : '🚗'}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
