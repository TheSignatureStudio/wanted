import { Image } from 'expo-image';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const METRICS = [
  { label: '주 52시간 초과', value: '0건', description: '이번 주 승인 대기' },
  { label: '재택 신청', value: '12건', description: '오늘 기준' },
  { label: '회의실 점유', value: '68%', description: 'R&D 타워' },
];

const FEATURES = [
  {
    title: 'GPS 근태 & 재택',
    detail: '지오펜스 반경과 재택 승인 정책을 모바일에서 즉시 전환합니다.',
  },
  {
    title: '회의실 · Zoom 예약',
    detail: '자원별 중복 방지와 Zoom 계정 자동 할당을 지원합니다.',
  },
  {
    title: '휴가·통계 캘린더',
    detail: '월별 근로 시간과 잔여 휴가를 캘린더로 시각화합니다.',
  },
];

const NEXT_STEPS = [
  {
    title: 'Cloudflare D1 동기화',
    description: 'wrangler d1 execute 명령으로 schema.sql 초기화',
  },
  {
    title: 'Expo OTA 채널',
    description: 'EAS Update 채널을 prod/beta로 분리',
  },
  {
    title: 'GPS Mock 모드',
    description: 'QA 전용 가상 위치 플래그 추가',
  },
];

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      /* noop */
    });
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: palette.accentStrong, dark: '#1c1f38' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={[styles.reactLogo, { opacity: 0.25 }]}
        />
      }>
      <ThemedView style={[styles.hero, { borderColor: palette.border, backgroundColor: palette.card }]}>
        <View style={[styles.badge, { borderColor: palette.border, backgroundColor: palette.background }]}>
          <ThemedText type="defaultSemiBold">Wanted Attendance Suite</ThemedText>
        </View>
        <ThemedText type="title" style={styles.heroTitle}>
          근태·예약·휴가를 한 화면에서
        </ThemedText>
        <ThemedText style={styles.heroSubtitle}>
          Cloudflare Pages + D1 + Expo 기반으로 웹과 앱을 동시에 배포하고, GPS 근태부터 회의실·Zoom
          예약까지 모바일에서 바로 제어합니다.
        </ThemedText>
        <View style={styles.actionRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => openLink('https://developers.cloudflare.com/d1/')}
            style={[styles.button, styles.buttonPrimary, { backgroundColor: palette.tint }]}>
            <ThemedText type="defaultSemiBold" style={styles.buttonPrimaryText}>
              D1 설계 살펴보기
            </ThemedText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => openLink('https://github.com/TheSignatureStudio/wanted')}
            style={[styles.button, styles.buttonGhost, { borderColor: palette.border }]}>
            <ThemedText type="defaultSemiBold">GitHub</ThemedText>
          </Pressable>
        </View>
      </ThemedView>

      <View style={styles.metricRow}>
        {METRICS.map((metric) => (
          <ThemedView
            key={metric.label}
            style={[
              styles.metricCard,
              { borderColor: palette.border, backgroundColor: palette.card },
            ]}>
            <ThemedText type="subtitle">{metric.value}</ThemedText>
            <ThemedText style={styles.metricLabel}>{metric.label}</ThemedText>
            <ThemedText style={styles.metricDetail}>{metric.description}</ThemedText>
          </ThemedView>
        ))}
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle">핵심 기능</ThemedText>
        <ThemedText style={styles.sectionSubtitle}>모바일에서 즉시 확인 가능한 근무 정보</ThemedText>
        <View style={styles.cardGrid}>
          {FEATURES.map((feature) => (
            <ThemedView
              key={feature.title}
              style={[
                styles.featureCard,
                { borderColor: palette.border, backgroundColor: palette.card },
              ]}>
              <ThemedText type="defaultSemiBold">{feature.title}</ThemedText>
              <ThemedText style={styles.cardDetail}>{feature.detail}</ThemedText>
            </ThemedView>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle">다음 액션</ThemedText>
        <ThemedText style={styles.sectionSubtitle}>
          QA/배포 전에 체크할 운영 작업을 추적하세요.
        </ThemedText>
        {NEXT_STEPS.map((item) => (
          <ThemedView
            key={item.title}
            style={[styles.timelineItem, { borderColor: palette.border }]}>
            <View style={[styles.timelineDot, { backgroundColor: palette.tint }]} />
            <View style={styles.timelineBody}>
              <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
              <ThemedText style={styles.timelineDetail}>{item.description}</ThemedText>
            </View>
          </ThemedView>
        ))}
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  hero: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    gap: 16,
  },
  heroTitle: {
    lineHeight: 36,
  },
  heroSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.9,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderWidth: 1,
  },
  buttonPrimary: {
    borderWidth: 0,
  },
  buttonGhost: {},
  buttonPrimaryText: {
    color: '#050816',
  },
  metricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: 100,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  metricLabel: {
    fontSize: 14,
    opacity: 0.8,
  },
  metricDetail: {
    fontSize: 13,
    opacity: 0.6,
  },
  section: {
    gap: 12,
    marginTop: 24,
  },
  sectionSubtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  cardGrid: {
    gap: 12,
  },
  featureCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    gap: 6,
  },
  cardDetail: {
    fontSize: 15,
    opacity: 0.8,
    lineHeight: 22,
  },
  timelineItem: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  timelineBody: {
    flex: 1,
    gap: 4,
  },
  timelineDetail: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 22,
  },
  reactLogo: {
    height: 200,
    width: 320,
    bottom: -10,
    left: -10,
    position: 'absolute',
  },
});
