'use client';

import { useEffect, useState } from 'react';

interface WeeklyAlert {
  alert_level: 'none' | 'warning' | 'critical' | 'exceeded';
  message: string;
  total_hours: number;
  max_hours: number;
  remaining_hours: number;
}

interface LeaveReminder {
  leave_type: string;
  remaining_days: number;
  alert_level: 'none' | 'low' | 'critical';
  message: string;
}

interface NotificationBannerProps {
  userId: string;
}

export function NotificationBanner({ userId }: NotificationBannerProps) {
  const [weeklyAlert, setWeeklyAlert] = useState<WeeklyAlert | null>(null);
  const [leaveReminders, setLeaveReminders] = useState<LeaveReminder[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Fetch weekly alert
    fetch(`/api/v1/notifications/weekly-alert/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.alert_level !== 'none') {
          setWeeklyAlert(data);
        }
      })
      .catch(err => console.error('Failed to fetch weekly alert:', err));

    // Fetch leave reminders
    fetch(`/api/v1/notifications/leave-reminder/${userId}`)
      .then(res => res.json())
      .then(data => {
        const criticalReminders = data.reminders?.filter(
          (r: LeaveReminder) => r.alert_level === 'critical' || r.alert_level === 'low'
        ) || [];
        setLeaveReminders(criticalReminders);
      })
      .catch(err => console.error('Failed to fetch leave reminders:', err));
  }, [userId]);

  if (!isVisible || (!weeklyAlert && leaveReminders.length === 0)) {
    return null;
  }

  return (
    <div className="notification-banner-container">
      {weeklyAlert && (
        <div className={`notification-banner alert-${weeklyAlert.alert_level}`}>
          <div className="notification-content">
            <span className="notification-icon">
              {weeklyAlert.alert_level === 'exceeded' && '🚨'}
              {weeklyAlert.alert_level === 'critical' && '⚠️'}
              {weeklyAlert.alert_level === 'warning' && '💡'}
            </span>
            <div className="notification-text">
              <strong>주간 근무시간 알림</strong>
              <p>{weeklyAlert.message}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsVisible(false)} 
            className="notification-close"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
      )}

      {leaveReminders.map((reminder, index) => (
        <div key={index} className={`notification-banner alert-${reminder.alert_level}`}>
          <div className="notification-content">
            <span className="notification-icon">
              {reminder.alert_level === 'critical' ? '🚨' : '📅'}
            </span>
            <div className="notification-text">
              <strong>휴가 잔여 알림</strong>
              <p>{reminder.message}</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setLeaveReminders(prev => prev.filter((_, i) => i !== index));
            }} 
            className="notification-close"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

