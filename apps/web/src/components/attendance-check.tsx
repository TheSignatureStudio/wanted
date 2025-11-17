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
  const [selectedWorkMode, setSelectedWorkMode] = useState<WorkMode>('ONSITE');
  const [selectedLocation, setSelectedLocation] = useState<WorkLocation | null>(null);

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

  // Get current location on mount
  useEffect(() => {
    if (selectedWorkMode === 'ONSITE') {
      getCurrentLocation()
        .then((loc) => {
          setLocation(loc);
          setLocationError(null);
        })
        .catch((error) => {
          setLocationError(error.message);
        });
    }
  }, [selectedWorkMode]);

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
      if (selectedWorkMode === 'ONSITE' && !location) {
        throw new Error('위치 정보를 가져오는 중입니다...');
      }

      return api.clockIn({
        user_id: userId,
        work_mode: selectedWorkMode,
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
      <h2 className="text-2xl font-bold mb-6">출퇴근 체크</h2>

      {/* Current Status */}
      {todayAttendance && (
        <div className="status-card mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">출근 시각</p>
              <p className="text-lg font-semibold">
                {new Date(todayAttendance.clock_in).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            {todayAttendance.clock_out && (
              <div>
                <p className="text-sm text-gray-600">퇴근 시각</p>
                <p className="text-lg font-semibold">
                  {new Date(todayAttendance.clock_out).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            )}
            <div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  todayAttendance.work_mode === 'ONSITE'
                    ? 'bg-green-100 text-green-800'
                    : todayAttendance.work_mode === 'REMOTE'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-purple-100 text-purple-800'
                }`}
              >
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

      {/* Work Mode Selection */}
      {!isClockedIn && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">근무 형태</label>
          <div className="flex gap-2">
            {(['ONSITE', 'REMOTE', 'FIELD'] as WorkMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectedWorkMode(mode)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedWorkMode === mode
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {mode === 'ONSITE' ? '현장근무' : mode === 'REMOTE' ? '재택근무' : '외근'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Location Selection for ONSITE */}
      {!isClockedIn && selectedWorkMode === 'ONSITE' && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">근무지</label>
          <select
            value={selectedLocation?.id || ''}
            onChange={(e) => {
              const loc = workLocations.find((l) => l.id === e.target.value);
              setSelectedLocation(loc || null);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
      {selectedWorkMode === 'ONSITE' && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          {locationError ? (
            <div className="text-red-600">
              <p className="font-medium">위치 정보 오류</p>
              <p className="text-sm">{locationError}</p>
            </div>
          ) : location && selectedLocation ? (
            <div>
              <p className="text-sm text-gray-600 mb-2">현재 위치와의 거리</p>
              <p className="text-lg font-semibold mb-1">
                {formatDistance(distanceToLocation || 0)}
              </p>
              {isWithinRange ? (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <span>✓</span> 출근 가능 범위 내
                </p>
              ) : (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <span>✗</span> 출근 가능 범위 밖
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-600">위치 정보를 가져오는 중...</p>
          )}
        </div>
      )}

      {/* Error Messages */}
      {(clockInMutation.error || clockOutMutation.error) && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {(clockInMutation.error || clockOutMutation.error)?.message}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        {!isClockedIn ? (
          <button
            onClick={() => clockInMutation.mutate()}
            disabled={
              isLoading ||
              (selectedWorkMode === 'ONSITE' && (!location || !selectedLocation || !isWithinRange))
            }
            className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '처리 중...' : '출근하기'}
          </button>
        ) : (
          <button
            onClick={() => clockOutMutation.mutate()}
            disabled={isLoading}
            className="flex-1 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '처리 중...' : '퇴근하기'}
          </button>
        )}
      </div>

      {/* Helpful Info */}
      {selectedWorkMode === 'ONSITE' && !isClockedIn && (
        <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded text-sm">
          <p className="font-medium mb-1">💡 현장근무 출근 방법</p>
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

