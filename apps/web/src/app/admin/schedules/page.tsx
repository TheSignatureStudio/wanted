'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

interface User {
  id: string;
  name: string;
  email: string;
}

interface WorkSchedule {
  id: string;
  user_id: string;
  user_name: string;
  date: string;
  work_mode: 'ONSITE' | 'REMOTE' | 'FIELD';
  start_time: string;
  end_time: string;
  location?: string;
}

export default function AdminSchedulesPage() {
  const [selectedUser, setSelectedUser] = useState('');
  const [date, setDate] = useState('');
  const [workMode, setWorkMode] = useState<'ONSITE' | 'REMOTE' | 'FIELD'>('ONSITE');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [location, setLocation] = useState('본사');

  // Mock users - in production, fetch from API
  const { data: users } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      return [
        { id: '1', name: '김철수', email: 'kim@example.com' },
        { id: '2', name: '이영희', email: 'lee@example.com' },
        { id: '3', name: '박민수', email: 'park@example.com' },
      ];
    },
  });

  // Mock schedules - in production, fetch from API
  const { data: schedules, refetch } = useQuery<WorkSchedule[]>({
    queryKey: ['schedules'],
    queryFn: async () => {
      return [
        {
          id: '1',
          user_id: '1',
          user_name: '김철수',
          date: '2025-11-18',
          work_mode: 'ONSITE',
          start_time: '09:00',
          end_time: '18:00',
          location: '본사',
        },
        {
          id: '2',
          user_id: '2',
          user_name: '이영희',
          date: '2025-11-18',
          work_mode: 'REMOTE',
          start_time: '09:00',
          end_time: '18:00',
        },
      ];
    },
  });

  const createScheduleMutation = useMutation({
    mutationFn: async (data: {
      user_id: string;
      date: string;
      work_mode: string;
      start_time: string;
      end_time: string;
      location?: string;
    }) => {
      // API call would go here
      console.log('Creating schedule:', data);
      return data;
    },
    onSuccess: () => {
      refetch();
      setSelectedUser('');
      setDate('');
      setWorkMode('ONSITE');
      setStartTime('09:00');
      setEndTime('18:00');
      setLocation('본사');
      alert('근무 일정이 등록되었습니다.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (scheduleId: string) => {
      // API call would go here
      console.log('Deleting schedule:', scheduleId);
      return scheduleId;
    },
    onSuccess: () => {
      refetch();
      alert('근무 일정이 삭제되었습니다.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !date) {
      alert('사용자와 날짜를 선택해주세요.');
      return;
    }

    createScheduleMutation.mutate({
      user_id: selectedUser,
      date,
      work_mode: workMode,
      start_time: startTime,
      end_time: endTime,
      location: workMode === 'ONSITE' ? location : undefined,
    });
  };

  const handleDelete = (scheduleId: string) => {
    if (confirm('이 일정을 삭제하시겠습니까?')) {
      deleteMutation.mutate(scheduleId);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>근무 일정 관리</h1>
        <p className="page-description">직원들의 근무 일정을 등록하고 관리하세요</p>
      </div>

      <div className="content-grid">
        {/* Schedule Form */}
        <div className="form-card">
          <h2>일정 등록</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="user">직원</label>
              <select
                id="user"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="form-select"
              >
                <option value="">선택하세요</option>
                {users?.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="date">날짜</label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-input"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label htmlFor="workMode">근무 형태</label>
              <select
                id="workMode"
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value as 'ONSITE' | 'REMOTE' | 'FIELD')}
                className="form-select"
              >
                <option value="ONSITE">현장근무</option>
                <option value="REMOTE">재택근무</option>
                <option value="FIELD">외근</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startTime">시작 시간</label>
                <input
                  type="time"
                  id="startTime"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="endTime">종료 시간</label>
                <input
                  type="time"
                  id="endTime"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            {workMode === 'ONSITE' && (
              <div className="form-group">
                <label htmlFor="location">근무지</label>
                <input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="form-input"
                  placeholder="예: 본사, 지사"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={createScheduleMutation.isPending}
              className="btn-primary full-width"
            >
              {createScheduleMutation.isPending ? '등록 중...' : '일정 등록'}
            </button>
          </form>
        </div>

        {/* Schedule List */}
        <div className="history-card">
          <h2>등록된 일정</h2>
          <div className="request-list">
            {schedules?.map((schedule) => (
              <div key={schedule.id} className="request-item schedule-item">
                <div className="request-header">
                  <div>
                    <strong>{schedule.user_name}</strong>
                    <span className="schedule-date"> • {schedule.date}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(schedule.id)}
                    className="btn-delete"
                    aria-label="삭제"
                  >
                    🗑️
                  </button>
                </div>
                <div className="schedule-details">
                  <span className={`work-mode-badge ${schedule.work_mode.toLowerCase()}`}>
                    {schedule.work_mode === 'ONSITE'
                      ? '현장근무'
                      : schedule.work_mode === 'REMOTE'
                      ? '재택근무'
                      : '외근'}
                  </span>
                  <span className="schedule-time">
                    {schedule.start_time} ~ {schedule.end_time}
                  </span>
                  {schedule.location && (
                    <span className="schedule-location">📍 {schedule.location}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

