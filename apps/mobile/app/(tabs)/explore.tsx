import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { theme } from '@/constants/theme';

interface MenuItem {
  icon: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
}

export default function ExploreScreen() {
  const menuItems: MenuItem[] = [
    {
      icon: '📅',
      title: '캘린더',
      subtitle: '월별 근무 시간 확인',
    },
    {
      icon: '🏡',
      title: '재택근무 신청',
      subtitle: '원격 근무 일정 등록',
    },
    {
      icon: '🌴',
      title: '휴가 신청',
      subtitle: '연차 및 휴가 관리',
    },
    {
      icon: '🏢',
      title: '회의실 예약',
      subtitle: '회의 공간 및 Zoom 예약',
    },
    {
      icon: '📊',
      title: '근무 통계',
      subtitle: '주간/월간 근무 시간',
    },
    {
      icon: '⚙️',
      title: '설정',
      subtitle: '알림 및 계정 설정',
    },
  ];

  const handleGithub = () => {
    Linking.openURL('https://github.com/TheSignatureStudio/wanted');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>더보기</Text>
          <Text style={styles.subtitle}>다양한 기능을 이용해보세요</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>데모 사용자</Text>
            <Text style={styles.profileEmail}>demo@wanted.com</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>기능</Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>정보</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Wanted Attendance</Text>
            <Text style={styles.infoText}>Version 1.0.0</Text>
            <Text style={styles.infoText}>GPS 기반 스마트 출퇴근 관리</Text>
            <TouchableOpacity onPress={handleGithub} style={styles.linkButton}>
              <Text style={styles.linkText}>GitHub에서 보기 →</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>주요 기능</Text>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>📍</Text>
            <Text style={styles.featureTitle}>GPS 기반 출퇴근</Text>
            <Text style={styles.featureText}>
              지정된 위치에서만 출퇴근이 가능합니다
            </Text>
          </View>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🏡</Text>
            <Text style={styles.featureTitle}>재택근무 지원</Text>
            <Text style={styles.featureText}>
              관리자 승인을 통한 원격 근무 관리
            </Text>
          </View>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>⏰</Text>
            <Text style={styles.featureTitle}>52시간 근무제</Text>
            <Text style={styles.featureText}>
              주 52시간을 초과하지 않도록 자동 체크
            </Text>
          </View>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>📅</Text>
            <Text style={styles.featureTitle}>휴가 관리</Text>
            <Text style={styles.featureText}>
              연차 및 휴가 신청과 잔여일수 확인
            </Text>
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.panel,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.panelBorder,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 28,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: theme.colors.subtext,
  },
  menuSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.panel,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.panelBorder,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: theme.colors.subtext,
  },
  menuArrow: {
    fontSize: 24,
    color: theme.colors.subtext,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: theme.colors.panel,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.panelBorder,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.subtext,
    marginBottom: 4,
  },
  linkButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(124, 93, 255, 0.1)',
    borderRadius: 8,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.accent,
  },
  featuresSection: {
    marginBottom: 24,
  },
  featureCard: {
    backgroundColor: theme.colors.panel,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.panelBorder,
  },
  featureIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 14,
    color: theme.colors.subtext,
    lineHeight: 20,
  },
});
