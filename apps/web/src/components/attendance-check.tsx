'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getCurrentLocation, formatDistance, calculateDistance } from '@/lib/geolocation';
import type { WorkMode, GeoLocation, WorkLocation } from '@/lib/types';

interface AttendanceCheckProps {
  userId: string;
}

export function AttendanceCheck({ userId }: AttendanceCheckProps) {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<WorkLocation | null>(null);

  // Mock today's work schedule - in production, this would come from API
  const todaySchedule = {
    work_mode: 'ONSITE' as WorkMode,
    start_time: '09:00',
    end_time: '18:00',
    location: '본사',
  };

  // Mock work locations - in production, this would come from API
  const workLocations: WorkLocation[] = [
    {
      id: '1',
      name: '본사',
      latitude: 37.5665,
      longitude: 126.9780,
      radius_meters: 100,
      allowed_modes: '["ONSITE","REMOTE"]',
      archived: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  // Get current location on mount if ONSITE
  useEffect(() => {
    if (todaySchedule.work_mode === 'ONSITE') {
      getCurrentLocation()
        .then((loc) => {
          setLocation(loc);
          setLocationError(null);
        })
        .catch((error) => {
          setLocationError(error.message);
        });
    }
  }, [todaySchedule.work_mode]);

  // Check today's attendance
  const { data: todayAttendance, refetch: refetchAttendance } = useQuery({
    queryKey: ['attendance', 'today', userId],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const result = await api.listAttendance({
        user_id: userId,
        start_date: today,
        end_date: today,
      });
      return result.logs[0] || null;
    },
  });

  // Clock in mutation
  const clockInMutation = useMutation({
    mutationFn: async () => {
      if (todaySchedule.work_mode === 'ONSITE' && !location) {
        throw new Error('위치 정보를 가져오는 중입니다...');
      }

      return api.clockIn({
        user_id: userId,
        work_mode: todaySchedule.work_mode,
        location_id: selectedLocation?.id,
        latitude: location?.latitude,
        longitude: location?.longitude,
      });
    },
    onSuccess: () => {
      refetchAttendance();
    },
  });

  // Clock out mutation
  const clockOutMutation = useMutation({
    mutationFn: async () => {
      return api.clockOut({
        user_id: userId,
        latitude: location?.latitude,
        longitude: location?.longitude,
      });
    },
    onSuccess: () => {
      refetchAttendance();
    },
  });

  const isClockedIn = todayAttendance && !todayAttendance.clock_out;
  const isLoading = clockInMutation.isPending || clockOutMutation.isPending;

  // Calculate distance to selected location
  const distanceToLocation =
    location && selectedLocation
      ? calculateDistance(
          location.latitude,
          location.longitude,
          selectedLocation.latitude,
          selectedLocation.longitude
        )
      : null;

  const isWithinRange =
    distanceToLocation !== null && distanceToLocation <= (selectedLocation?.radius_meters || 0);

  return (
    <div className="attendance-check">
      <h2>출퇴근 체크</h2>

      {/* Today's Schedule */}
      <div className="today-schedule">
        <h3>오늘의 근무</h3>
        <div className="schedule-info">
          <div className="schedule-item">
            <span className="schedule-label">근무 형태</span>
            <span className={`work-mode-badge ${todaySchedule.work_mode.toLowerCase()}`}>
              {todaySchedule.work_mode === 'ONSITE'
                ? '현장근무'
                : todaySchedule.work_mode === 'REMOTE'
                ? '재택근무'
                : '외근'}
            </span>
          </div>
          <div className="schedule-item">
            <span className="schedule-label">근무 시간</span>
            <span className="schedule-value">
              {todaySchedule.start_time} ~ {todaySchedule.end_time}
            </span>
          </div>
          {todaySchedule.work_mode === 'ONSITE' && (
            <div className="schedule-item">
              <span className="schedule-label">근무지</span>
              <span className="schedule-value">{todaySchedule.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Current Status */}
      {todayAttendance && (
        <div className="attendance-status">
          <div className="status-row">
            <div className="status-time">
              <span className="status-label">출근 시각</span>
              <span className="status-value">
                {new Date(todayAttendance.clock_in).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            {todayAttendance.clock_out && (
              <div className="status-time">
                <span className="status-label">퇴근 시각</span>
                <span className="status-value">
                  {new Date(todayAttendance.clock_out).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )}
            <div>
              <span className={`work-mode-badge ${todayAttendance.work_mode.toLowerCase()}`}>
                {todayAttendance.work_mode === 'ONSITE'
                  ? '현장근무'
                  : todayAttendance.work_mode === 'REMOTE'
                  ? '재택근무'
                  : '외근'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Location Selection for ONSITE */}
      {!isClockedIn && todaySchedule.work_mode === 'ONSITE' && (
        <div className="form-group">
          <label>근무지</label>
          <select
            value={selectedLocation?.id || ''}
            onChange={(e) => {
              const loc = workLocations.find((l) => l.id === e.target.value);
              setSelectedLocation(loc || null);
            }}
            className="form-select"
          >
            <option value="">근무지를 선택하세요</option>
            {workLocations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Location Status */}
      {todaySchedule.work_mode === 'ONSITE' && (
        <div className="location-status">
          {locationError ? (
            <div className="location-error">
              <p><strong>위치 정보 오류</strong></p>
              <p>{locationError}</p>
            </div>
          ) : location && selectedLocation ? (
            <div>
              <p className="location-label">현재 위치와의 거리</p>
              <p className="location-distance">
                {formatDistance(distanceToLocation || 0)}
              </p>
              {isWithinRange ? (
                <p className="location-status-text success">
                  <span>✓</span> 출근 가능 범위 내
                </p>
              ) : (
                <p className="location-status-text error">
                  <span>✗</span> 출근 가능 범위 밖
                </p>
              )}
            </div>
          ) : (
            <p>위치 정보를 가져오는 중...</p>
          )}
        </div>
      )}

      {/* Error Messages */}
      {(clockInMutation.error || clockOutMutation.error) && (
        <div className="alert alert-danger">
          {(clockInMutation.error || clockOutMutation.error)?.message}
        </div>
      )}

      {/* Action Buttons */}
      <div className="attendance-actions">
        {!isClockedIn ? (
          <button
            onClick={() => clockInMutation.mutate()}
            disabled={
              isLoading ||
              (todaySchedule.work_mode === 'ONSITE' && (!location || !selectedLocation || !isWithinRange))
            }
            className="btn-attendance clock-in"
          >
            {isLoading ? '처리 중...' : '출근하기'}
          </button>
        ) : (
          <button
            onClick={() => clockOutMutation.mutate()}
            disabled={isLoading}
            className="btn-attendance clock-out"
          >
            {isLoading ? '처리 중...' : '퇴근하기'}
          </button>
        )}
      </div>

      {/* Helpful Info */}
      {todaySchedule.work_mode === 'ONSITE' && !isClockedIn && (
        <div className="help-box">
          <p><strong>💡 현장근무 출근 방법</strong></p>
          <p>
            1. 위치 권한을 허용해주세요<br />
            2. 근무지를 선택하세요<br />
            3. 출근 가능 범위 내에 있는지 확인하세요<br />
            4. 출근하기 버튼을 누르세요
          </p>
        </div>
      )}
    </div>
  );
}

