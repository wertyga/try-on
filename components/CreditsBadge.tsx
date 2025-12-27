import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useCreditsStore } from '@/stores/creditStore';
import { Colors } from '@/constants/Colors';

type Props = {
  variant?: 'compact' | 'inline';
};

export function CreditsBadge({ variant = 'compact' }: Props) {
  const { freeDailyLeft, credits, guestFreeLeft, isLoading } =
    useCreditsStore();

  if (isLoading) return null;

  const parts: string[] = [];

  if (freeDailyLeft > 0) {
    parts.push(`Free today: ${freeDailyLeft}`);
  }

  if (credits > 0) {
    parts.push(`Credits: ${credits}`);
  }

  if (freeDailyLeft <= 0 && credits <= 0 && guestFreeLeft > 0) {
    parts.push(`Free: ${guestFreeLeft}`);
  }

  // если вообще нечего показывать
  if (parts.length === 0) {
    parts.push('No generations left');
  }

  return (
    <Pressable
      onPress={() => router.push('/paywall')}
      style={[styles.badge, variant === 'inline' && styles.badgeInline]}
    >
      <Text style={styles.text}>{parts.join(' · ')}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: Colors.light.cardBg,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  badgeInline: {
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.text,
  },
});
