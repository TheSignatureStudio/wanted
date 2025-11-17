'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

export default function RemotePage() {
  const [selectedDate, setSelectedDate] = useState('');
  const [reason, setReason] = useState('');

  // Mock data - in production, fetch from API
  const { data: remoteSchedules } = useQuery({
    queryKey: ['remote-schedules'],
    queryFn: async () => {
      return [
        {
          id: '1',
          work_date: '2025-11-20',
          status: 'pending',
          reason: '개인 사유',
        },
        {
          id: '2',
          work_date: '2025-11-15',
          status: 'approved',
          reason: '가족 행사',
        },
      ];
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: { work_date: string; reason: string }) => {
      // API call would go here
      console.log('Submitting remote request:', data);
      return data;
    },
    onSuccess: () => {
      setSelectedDate('');
      setReason('');
      alert('재택근무 신청이 완료되었습니다.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) {
      alert('날짜를 선택해주세요.');
      return;
    }
    submitMutation.mutate({ work_date: selectedDate, reason });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>재택근무 신청</h1>
        <p className="page-description">원격 근무 일정을 신청하고 관리하세요</p>
      </div>

      <div className="content-grid">
        {/* Request Form */}
        <div className="form-card">
          <h2>신청하기</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="date">날짜</label>
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="form-input"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reason">사유 (선택)</label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="form-textarea"
                rows={4}
                placeholder="재택근무 사유를 입력하세요"
              />
            </div>

            <button
              type="submit"
              disabled={submitMutation.isPending}
              className="btn-primary full-width"
            >
              {submitMutation.isPending ? '신청 중...' : '신청하기'}
            </button>
          </form>
        </div>

        {/* Request History */}
        <div className="history-card">
          <h2>신청 내역</h2>
          <div className="request-list">
            {remoteSchedules?.map((schedule) => (
              <div key={schedule.id} className="request-item">
                <div className="request-header">
                  <span className="request-date">{schedule.work_date}</span>
                  <span
                    className={`status-badge ${schedule.status}`}
                  >
                    {schedule.status === 'pending'
                      ? '대기중'
                      : schedule.status === 'approved'
                      ? '승인'
                      : '거절'}
                  </span>
                </div>
                {schedule.reason && (
                  <p className="request-reason">{schedule.reason}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

