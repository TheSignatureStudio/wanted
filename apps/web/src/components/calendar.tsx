'use client';

import { useState } from 'react';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  hours?: number;
  isToday: boolean;
}

interface CalendarProps {
  userId: string;
}

export function Calendar({ userId }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Generate calendar days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startDay = firstDayOfMonth.getDay(); // 0 = Sunday

  const days: CalendarDay[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
    days.push({
      date,
      isCurrentMonth: true,
      hours: Math.random() > 0.3 ? Math.floor(Math.random() * 10) + 4 : undefined, // Mock data
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

  const monthName = currentDate.toLocaleDateString('ko-KR', { 
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
          <span className="stat-value">{totalHours}h</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">근무일수</span>
          <span className="stat-value">{workingDays}일</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">평균 근무시간</span>
          <span className="stat-value">
            {workingDays > 0 ? (totalHours / workingDays).toFixed(1) : 0}h
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
              } ${day.hours ? 'has-hours' : ''}`}
            >
              <div className="day-number">{day.date.getDate()}</div>
              {day.hours && day.isCurrentMonth && (
                <div className="day-hours">{day.hours}h</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

