import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '@/constants/theme';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>안녕하세요 👋</Text>
          <Text style={styles.userName}>데모 사용자님</Text>
        </View>

        {/* Today Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>오늘의 근무</Text>
          <View style={styles.summaryContent}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>출근</Text>
              <Text style={styles.summaryValue}>--:--</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>퇴근</Text>
              <Text style={styles.summaryValue}>--:--</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>근무시간</Text>
              <Text style={styles.summaryValue}>0h</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📊</Text>
            <Text style={styles.statLabel}>이번 주</Text>
            <Text style={styles.statValue}>0시간</Text>
            <Text style={styles.statSubtext}>/ 52시간</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🌴</Text>
            <Text style={styles.statLabel}>남은 연차</Text>
            <Text style={styles.statValue}>12일</Text>
            <Text style={styles.statSubtext}>/ 15일</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>빠른 실행</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>🏡</Text>
              <Text style={styles.actionText}>재택근무</Text>
              <Text style={styles.actionSubtext}>신청</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>🌴</Text>
              <Text style={styles.actionText}>휴가</Text>
              <Text style={styles.actionSubtext}>신청</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>🏢</Text>
              <Text style={styles.actionText}>회의실</Text>
              <Text style={styles.actionSubtext}>예약</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>📅</Text>
              <Text style={styles.actionText}>캘린더</Text>
              <Text style={styles.actionSubtext}>보기</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>최근 활동</Text>
          <View style={styles.activityCard}>
            <Text style={styles.activityEmpty}>최근 활동이 없습니다</Text>
          </View>
        </View>
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
    paddingTop: 60,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: theme.colors.subtext,
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
  },
  summaryCard: {
    backgroundColor: theme.colors.accent,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.panel,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.panelBorder,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.subtext,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.accent,
  },
  statSubtext: {
    fontSize: 12,
    color: theme.colors.subtext,
    marginTop: 4,
  },
  actionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: theme.colors.panel,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.panelBorder,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  actionSubtext: {
    fontSize: 12,
    color: theme.colors.subtext,
  },
  activitySection: {
    marginBottom: 24,
  },
  activityCard: {
    backgroundColor: theme.colors.panel,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.colors.panelBorder,
    alignItems: 'center',
  },
  activityEmpty: {
    fontSize: 14,
    color: theme.colors.subtext,
  },
});
