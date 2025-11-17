import { StyleSheet, View } from 'react-native';

import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const PLAYBOOK = [
  {
    title: 'GPS & 지오펜스',
    body: '모바일에서 위치 권한을 받은 뒤, 허용 반경 내 진입 시에만 출근 로그를 생성합니다. QA 환경에서는 mock 좌표를 제공하세요.',
  },
  {
    title: '재택 신청 흐름',
    body: '사용자가 날짜를 지정하면 승인자에게 푸시/슬랙 알림을 발송하고, 승인된 일정은 GPS 검증을 우회합니다.',
  },
  {
    title: '회의실 · Zoom 예약',
    body: 'Cloudflare Worker가 Zoom API 토큰을 저장하고, 예약 시 자동으로 회의 링크와 자원 점유 상태를 기록합니다.',
  },
  {
    title: '52시간 가드레일',
    body: '주차별 합산 시간을 D1 `weekly_summaries` 테이블에 저장하고, 초과 시 관리자 승인이 필요하도록 모바일에서 표시합니다.',
  },
];

const RESOURCE_LINKS = [
  {
    label: '요구사항 & 아키텍처',
    href: 'https://github.com/TheSignatureStudio/wanted/blob/main/docs/requirements.md',
  },
  {
    label: '진행 로그',
    href: 'https://github.com/TheSignatureStudio/wanted/blob/main/docs/progress.md',
  },
  {
    label: 'Cloudflare Worker 코드',
    href: 'https://github.com/TheSignatureStudio/wanted/tree/main/apps/worker',
  },
];

export default function TabTwoScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#e2e1ff', dark: '#1f1f2b' }}
      headerImage={
        <IconSymbol
          size={300}
          color={palette.accentStrong}
          name="sparkles"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.hero}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
            lineHeight: 38,
          }}>
          운영 가이드
        </ThemedText>
        <ThemedText style={styles.heroText}>
          QA 체크리스트와 운영 정책을 한눈에 확인하고, 자세한 문서는 GitHub에 정리했습니다.
        </ThemedText>
      </ThemedView>

      <View style={styles.playbook}>
        {PLAYBOOK.map((item) => (
          <Collapsible key={item.title} title={item.title}>
            <ThemedText style={styles.playbookText}>{item.body}</ThemedText>
          </Collapsible>
        ))}
      </View>

      <View style={styles.resources}>
        <ThemedText type="subtitle">참고 링크</ThemedText>
        <ThemedText style={styles.resourcesCaption}>
          Cloudflare, Expo, 근태 정책 문서를 이어서 읽어보세요.
        </ThemedText>
        {RESOURCE_LINKS.map((link) => (
          <ExternalLink key={link.label} href={link.href} style={styles.resourceLink}>
            <ThemedText type="link">{link.label}</ThemedText>
          </ExternalLink>
        ))}
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    bottom: -120,
    left: -20,
    position: 'absolute',
    opacity: 0.2,
  },
  hero: {
    gap: 8,
    marginBottom: 16,
  },
  heroText: {
    fontSize: 15,
    lineHeight: 24,
    opacity: 0.85,
  },
  playbook: {
    gap: 18,
  },
  playbookText: {
    lineHeight: 22,
    fontSize: 15,
    opacity: 0.85,
  },
  resources: {
    marginTop: 32,
    gap: 8,
  },
  resourcesCaption: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 12,
  },
  resourceLink: {
    paddingVertical: 6,
  },
});
