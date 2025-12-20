import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import useCreditsStore from '@/stores/useCreditsStore';
import { Container } from '@/components/ui/Container';
import { Colors } from '@/constants/Colors';
import { PackList } from '@/components/Pack';

// простой helper: "Resets in 5h 12m"
function formatTimeLeft(resetsAt: string | null) {
  if (!resetsAt) return null;

  const end = new Date(resetsAt).getTime();
  const now = Date.now();
  const diff = end - now;

  if (Number.isNaN(end) || diff <= 0) return 'Resets soon';

  const totalMin = Math.floor(diff / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;

  if (h <= 0) return `Resets in ${m}m`;
  return `Resets in ${h}h ${m}m`;
}

export default function PaywallScreen() {
  const {
    packs,
    freeDailyLeft,
    freeDailyUsed,
    credits,
    guestFreeLeft,
    guestFreeUsed,
    resetsAt,
    isLoading,
    isBuying,
    error,
    load,
    // buyPack, // если у тебя пока нет — убери кнопку "Buy"
    clearError,
  } = useCreditsStore();

  useEffect(() => {
    load();
  }, [load]);

  const timeLeft = useMemo(() => formatTimeLeft(resetsAt), [resetsAt]);

  return (
    <Container title="Get more generations">
      <ScrollView contentContainerStyle={s.wrap}>
        {/* Header */}
        <View style={s.headerRow}>
          <Pressable onPress={() => router.back()} style={s.backBtn}>
            <Text style={s.backText}>Back</Text>
          </Pressable>
          {!!timeLeft && <Text style={s.muted}>{timeLeft}</Text>}
        </View>

        {/* Status card */}
        <View style={s.card}>
          <Text style={s.title}>Your balance</Text>

          <View style={s.line}>
            <Text style={s.label}>Free today</Text>
            <Text style={s.value}>{freeDailyLeft ?? 0}</Text>
          </View>

          <View style={s.line}>
            <Text style={s.label}>Credits</Text>
            <Text style={s.value}>{credits ?? 0}</Text>
          </View>

          {(guestFreeLeft ?? 0) > 0 || (guestFreeUsed ?? 0) > 0 ? (
            <View style={s.line}>
              <Text style={s.label}>Guest free</Text>
              <Text style={s.value}>{guestFreeLeft ?? 0}</Text>
            </View>
          ) : null}

          <Text style={s.hint}>
            Free generations reset daily. Credits never expire.
          </Text>
        </View>

        {/* Packs */}
        <PackList packs={packs} isLoading={isLoading} />

        {/* Error */}
        {error ? (
          <Pressable onPress={clearError} style={s.errorBox}>
            <Text style={s.errorText}>{error}</Text>
            <Text style={s.errorHint}>Tap to dismiss</Text>
          </Pressable>
        ) : null}

        {/* Footer */}
        <Text style={s.footer}>
          Prices and currency are finalized at checkout.
        </Text>
      </ScrollView>
    </Container>
  );
}

const s = StyleSheet.create({
  wrap: {
    padding: 12,
    paddingBottom: 28,
    gap: 12,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
  },
  backText: { fontWeight: '800', color: '#111827' },

  card: {
    backgroundColor: Colors.light.cardBg,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  title: { fontSize: 18, fontWeight: '900', marginBottom: 8 },

  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  label: { color: '#6B7280', fontWeight: '700' },
  value: { fontWeight: '900', color: '#111827' },

  hint: { marginTop: 8, color: '#6B7280', fontSize: 12 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 16, fontWeight: '900' },

  packCard: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: Colors.light.cardBg,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 16,
    padding: 12,
  },
  packTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  packTitle: { fontSize: 15, fontWeight: '900' },
  packDesc: { color: '#6B7280', marginTop: 2 },
  packMeta: { marginTop: 8, fontWeight: '800' },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#111827',
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '900' },

  buyBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#111827',
  },
  buyText: { color: '#fff', fontWeight: '900' },

  muted: { color: '#6B7280', fontWeight: '700' },

  errorBox: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: { color: '#991B1B', fontWeight: '900' },
  errorHint: { color: '#991B1B', marginTop: 4, fontSize: 12 },

  footer: { marginTop: 8, color: '#6B7280', fontSize: 12 },
});
