import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { theme } from '@/constants/theme';

interface TodaySchedule {
  work_mode: 'ONSITE' | 'REMOTE' | 'FIELD';
  start_time: string;
  end_time: string;
  location: string;
}

export default function AttendanceScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(false);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);

  // Mock today's schedule
  const todaySchedule: TodaySchedule = {
    work_mode: 'ONSITE',
    start_time: '09:00',
    end_time: '18:00',
    location: '본사',
  };

  useEffect(() => {
    if (todaySchedule.work_mode === 'ONSITE') {
      getLocation();
    }
  }, []);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '위치 권한이 필요합니다.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    } catch (error) {
      Alert.alert('오류', '위치를 가져올 수 없습니다.');
    }
  };

  const handleClockIn = async () => {
    if (todaySchedule.work_mode === 'ONSITE' && !location) {
      Alert.alert('오류', '위치 정보를 가져오는 중입니다.');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsClockedIn(true);
      setClockInTime(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }));
      setLoading(false);
      Alert.alert('성공', '출근이 완료되었습니다.');
    }, 1000);
  };

  const handleClockOut = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert('성공', '퇴근이 완료되었습니다.');
      // Reset for demo
      setIsClockedIn(false);
      setClockInTime(null);
    }, 1000);
  };

  const getWorkModeText = (mode: string) => {
    switch (mode) {
      case 'ONSITE':
        return '현장근무';
      case 'REMOTE':
        return '재택근무';
      case 'FIELD':
        return '외근';
      default:
        return mode;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>출퇴근 체크</Text>
          <Text style={styles.subtitle}>오늘도 화이팅! 💪</Text>
        </View>

        {/* Today's Schedule */}
        <View style={styles.scheduleCard}>
          <Text style={styles.cardTitle}>오늘의 근무</Text>
          <View style={styles.scheduleInfo}>
            <View style={styles.scheduleItem}>
              <Text style={styles.scheduleLabel}>근무 형태</Text>
              <View style={[styles.badge, styles[`badge${todaySchedule.work_mode}`]]}>
                <Text style={styles.badgeText}>{getWorkModeText(todaySchedule.work_mode)}</Text>
              </View>
            </View>
            <View style={styles.scheduleItem}>
              <Text style={styles.scheduleLabel}>근무 시간</Text>
              <Text style={styles.scheduleValue}>
                {todaySchedule.start_time} ~ {todaySchedule.end_time}
              </Text>
            </View>
            {todaySchedule.work_mode === 'ONSITE' && (
              <View style={styles.scheduleItem}>
                <Text style={styles.scheduleLabel}>근무지</Text>
                <Text style={styles.scheduleValue}>{todaySchedule.location}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Current Status */}
        {isClockedIn && (
          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>출근 시각</Text>
            <Text style={styles.statusValue}>{clockInTime}</Text>
            <Text style={styles.statusSubtext}>근무 중입니다</Text>
          </View>
        )}

        {/* Location Status */}
        {todaySchedule.work_mode === 'ONSITE' && (
          <View style={styles.locationCard}>
            {location ? (
              <>
                <Text style={styles.locationTitle}>현재 위치</Text>
                <Text style={styles.locationCoords}>
                  위도: {location.coords.latitude.toFixed(6)}
                </Text>
                <Text style={styles.locationCoords}>
                  경도: {location.coords.longitude.toFixed(6)}
                </Text>
                <Text style={styles.locationStatus}>✅ 출근 가능 범위</Text>
              </>
            ) : (
              <>
                <Text style={styles.locationTitle}>위치 정보 가져오는 중...</Text>
                <ActivityIndicator size="small" color={theme.colors.accent} />
              </>
            )}
          </View>
        )}

        {/* Action Button */}
        <View style={styles.actionContainer}>
          {!isClockedIn ? (
            <TouchableOpacity
              style={[
                styles.button,
                styles.clockInButton,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleClockIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>출근하기</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.button,
                styles.clockOutButton,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleClockOut}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>퇴근하기</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Help Info */}
        {todaySchedule.work_mode === 'ONSITE' && !isClockedIn && (
          <View style={styles.helpCard}>
            <Text style={styles.helpTitle}>💡 현장근무 출근 방법</Text>
            <Text style={styles.helpText}>1. 위치 권한을 허용해주세요</Text>
            <Text style={styles.helpText}>2. 근무지 반경 내에 있어야 합니다</Text>
            <Text style={styles.helpText}>3. 출근하기 버튼을 눌러주세요</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.subtext,
  },
  scheduleCard: {
    backgroundColor: theme.colors.panel,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.panelBorder,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.accent,
    marginBottom: 16,
  },
  scheduleInfo: {
    gap: 12,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleLabel: {
    fontSize: 14,
    color: theme.colors.subtext,
  },
  scheduleValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeONSITE: {
    backgroundColor: 'rgba(124, 93, 255, 0.15)',
  },
  badgeREMOTE: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  badgeFIELD: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.accent,
  },
  statusCard: {
    backgroundColor: 'rgba(124, 93, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(124, 93, 255, 0.3)',
  },
  statusLabel: {
    fontSize: 14,
    color: theme.colors.subtext,
    marginBottom: 8,
  },
  statusValue: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.accent,
    marginBottom: 4,
  },
  statusSubtext: {
    fontSize: 14,
    color: theme.colors.subtext,
  },
  locationCard: {
    backgroundColor: theme.colors.panel,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.panelBorder,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  locationCoords: {
    fontSize: 14,
    color: theme.colors.subtext,
    marginBottom: 4,
  },
  locationStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ade80',
    marginTop: 8,
  },
  actionContainer: {
    marginVertical: 24,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockInButton: {
    backgroundColor: theme.colors.accent,
  },
  clockOutButton: {
    backgroundColor: '#ef4444',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  helpCard: {
    backgroundColor: 'rgba(124, 93, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(124, 93, 255, 0.2)',
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 13,
    color: theme.colors.subtext,
    marginBottom: 4,
  },
});

