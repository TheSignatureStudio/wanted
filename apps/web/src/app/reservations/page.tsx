'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

export default function ReservationsPage() {
  const [resourceId, setResourceId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [agenda, setAgenda] = useState('');

  // Mock resources - in production, fetch from API
  const { data: resources } = useQuery({
    queryKey: ['resources'],
    queryFn: async () => {
      return [
        {
          id: '1',
          name: '대회의실 A',
          type: 'MEETING_ROOM',
          capacity: 20,
          has_zoom: true,
        },
        {
          id: '2',
          name: '소회의실 B',
          type: 'MEETING_ROOM',
          capacity: 6,
          has_zoom: true,
        },
        {
          id: '3',
          name: 'Zoom Pro #1',
          type: 'ZOOM_ACCOUNT',
          capacity: 100,
          has_zoom: false,
        },
      ];
    },
  });

  // Mock reservations - in production, fetch from API
  const { data: reservations } = useQuery({
    queryKey: ['reservations'],
    queryFn: async () => {
      return [
        {
          id: '1',
          resource_name: '대회의실 A',
          starts_at: '2025-11-20T14:00:00',
          ends_at: '2025-11-20T15:00:00',
          status: 'confirmed',
          agenda: '팀 회의',
        },
        {
          id: '2',
          resource_name: '소회의실 B',
          starts_at: '2025-11-18T10:00:00',
          ends_at: '2025-11-18T11:00:00',
          status: 'confirmed',
          agenda: '1:1 미팅',
        },
      ];
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: {
      resource_id: string;
      starts_at: string;
      ends_at: string;
      agenda: string;
    }) => {
      // API call would go here
      console.log('Submitting reservation:', data);
      return data;
    },
    onSuccess: () => {
      setResourceId('');
      setDate('');
      setStartTime('');
      setEndTime('');
      setAgenda('');
      alert('예약이 완료되었습니다.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceId || !date || !startTime || !endTime) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }
    
    const starts_at = `${date}T${startTime}:00`;
    const ends_at = `${date}T${endTime}:00`;
    
    if (new Date(starts_at) >= new Date(ends_at)) {
      alert('종료 시간은 시작 시간보다 이후여야 합니다.');
      return;
    }

    submitMutation.mutate({ resource_id: resourceId, starts_at, ends_at, agenda });
  };

  const selectedResource = resources?.find((r) => r.id === resourceId);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>회의실 예약</h1>
        <p className="page-description">회의실 및 Zoom 계정을 예약하세요</p>
      </div>

      <div className="content-grid">
        {/* Reservation Form */}
        <div className="form-card">
          <h2>예약하기</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="resource">회의실 / Zoom</label>
              <select
                id="resource"
                value={resourceId}
                onChange={(e) => setResourceId(e.target.value)}
                className="form-select"
              >
                <option value="">선택하세요</option>
                {resources?.map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resource.name} ({resource.capacity}명)
                    {resource.has_zoom && ' 🎥'}
                  </option>
                ))}
              </select>
            </div>

            {selectedResource && (
              <div className="resource-info">
                <p>
                  <strong>수용 인원:</strong> {selectedResource.capacity}명
                </p>
                {selectedResource.has_zoom && (
                  <p>
                    <strong>Zoom 지원:</strong> ✅
                  </p>
                )}
              </div>
            )}

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

            <div className="form-group">
              <label htmlFor="agenda">회의 안건</label>
              <textarea
                id="agenda"
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
                className="form-textarea"
                rows={3}
                placeholder="회의 안건을 입력하세요"
              />
            </div>

            <button
              type="submit"
              disabled={submitMutation.isPending}
              className="btn-primary full-width"
            >
              {submitMutation.isPending ? '예약 중...' : '예약하기'}
            </button>
          </form>
        </div>

        {/* Reservation History */}
        <div className="history-card">
          <h2>예약 내역</h2>
          <div className="request-list">
            {reservations?.map((reservation) => (
              <div key={reservation.id} className="request-item reservation-item">
                <div className="request-header">
                  <span className="request-type">{reservation.resource_name}</span>
                  <span className={`status-badge ${reservation.status}`}>
                    {reservation.status === 'confirmed' ? '확정' : '대기중'}
                  </span>
                </div>
                <p className="reservation-time">
                  {new Date(reservation.starts_at).toLocaleString('ko-KR', {
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {' ~ '}
                  {new Date(reservation.ends_at).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                {reservation.agenda && (
                  <p className="request-reason">{reservation.agenda}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

