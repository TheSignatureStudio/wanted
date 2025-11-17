'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

export default function LeavePage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveType, setLeaveType] = useState('Annual');
  const [reason, setReason] = useState('');

  // Mock leave balance - in production, fetch from API
  const { data: leaveBalance } = useQuery({
    queryKey: ['leave-balance'],
    queryFn: async () => {
      return {
        Annual: { allowance: 15, used: 3, remaining: 12 },
        Sick: { allowance: 10, used: 1, remaining: 9 },
      };
    },
  });

  // Mock leave requests - in production, fetch from API
  const { data: leaveRequests } = useQuery({
    queryKey: ['leave-requests'],
    queryFn: async () => {
      return [
        {
          id: '1',
          leave_type: 'Annual',
          start_date: '2025-12-20',
          end_date: '2025-12-22',
          status: 'pending',
          reason: '가족 휴가',
        },
        {
          id: '2',
          leave_type: 'Annual',
          start_date: '2025-11-10',
          end_date: '2025-11-10',
          status: 'approved',
          reason: '개인 사유',
        },
      ];
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: {
      leave_type: string;
      start_date: string;
      end_date: string;
      reason: string;
    }) => {
      // API call would go here
      console.log('Submitting leave request:', data);
      return data;
    },
    onSuccess: () => {
      setStartDate('');
      setEndDate('');
      setReason('');
      alert('휴가 신청이 완료되었습니다.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      alert('시작일과 종료일을 선택해주세요.');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      alert('종료일은 시작일보다 이후여야 합니다.');
      return;
    }
    submitMutation.mutate({ leave_type: leaveType, start_date: startDate, end_date: endDate, reason });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>휴가 신청</h1>
        <p className="page-description">연차 및 휴가를 신청하고 관리하세요</p>
      </div>

      {/* Leave Balance */}
      <div className="balance-cards">
        {leaveBalance &&
          Object.entries(leaveBalance).map(([type, balance]) => (
            <div key={type} className="balance-card">
              <h3>{type === 'Annual' ? '연차' : '병가'}</h3>
              <div className="balance-info">
                <div className="balance-item">
                  <span className="balance-label">총 일수</span>
                  <span className="balance-value">{balance.allowance}일</span>
                </div>
                <div className="balance-item">
                  <span className="balance-label">사용</span>
                  <span className="balance-value used">{balance.used}일</span>
                </div>
                <div className="balance-item">
                  <span className="balance-label">잔여</span>
                  <span className="balance-value remaining">{balance.remaining}일</span>
                </div>
              </div>
              <div className="balance-bar">
                <div
                  className="balance-fill"
                  style={{
                    width: `${(balance.used / balance.allowance) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
      </div>

      <div className="content-grid">
        {/* Request Form */}
        <div className="form-card">
          <h2>휴가 신청</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="leaveType">휴가 유형</label>
              <select
                id="leaveType"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className="form-select"
              >
                <option value="Annual">연차</option>
                <option value="Sick">병가</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">시작일</label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="form-input"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label htmlFor="endDate">종료일</label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="form-input"
                  min={startDate || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reason">사유 (선택)</label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="form-textarea"
                rows={4}
                placeholder="휴가 사유를 입력하세요"
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
            {leaveRequests?.map((request) => (
              <div key={request.id} className="request-item">
                <div className="request-header">
                  <span className="request-type">
                    {request.leave_type === 'Annual' ? '연차' : '병가'}
                  </span>
                  <span className={`status-badge ${request.status}`}>
                    {request.status === 'pending'
                      ? '대기중'
                      : request.status === 'approved'
                      ? '승인'
                      : '거절'}
                  </span>
                </div>
                <p className="request-date-range">
                  {request.start_date} ~ {request.end_date}
                </p>
                {request.reason && <p className="request-reason">{request.reason}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

