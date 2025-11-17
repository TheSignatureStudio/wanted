import { Calendar } from '@/components/calendar';

export default function CalendarPage() {
  // TODO: Get user ID from authentication context
  const userId = 'current-user-id';

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>근무시간 캘린더</h1>
        <p className="page-description">
          월별 근무시간을 확인하고 관리하세요
        </p>
      </div>

      <Calendar userId={userId} />
    </div>
  );
}

