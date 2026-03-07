import React, { useEffect, useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTryOnStore } from '@/stores/useTryOnStore';
import { Container } from '@/components/ui/Container';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/Colors';
import { ReccomendationProducts } from '@/components/ReccomendationProducts';
import { GenerateTaskButton } from '@/components/tryon';
import { useCreditsStore } from '@/stores/creditStore';
import { CreditsBadge } from '@/components/CreditsBadge';
import { TryOnSamplesList } from '@/components/tryon/TryOnSamplesList';
import { TTryOnSample } from '@/api/task.api';

export default function TryOn() {
  const credits = useCreditsStore();
  const [selectedSample, setSelectedSample] = useState<TTryOnSample | null>(
    null,
  );
  const { t } = useTranslation();

  const { userPhoto } = useTryOnStore();

  function goWelcome() {
    router.push('/welcome');
  }

  useEffect(() => {
    credits.load();
  }, []);

  return (
    <Container.WithTabBar
      keyboardShouldPersistTaps="handled"
      title={t('home.title')}
    >
      {/*/!* Your photo *!/*/}
      <View style={s.card}>
        <Text style={s.cardTitle}>{t('home.yourPhoto')}</Text>
        {userPhoto ? (
          <View style={s.previewFrame}>
            <Image
              source={{ uri: userPhoto.uri }}
              style={s.preview}
              resizeMode="contain"
            />
          </View>
        ) : (
          <Text style={s.muted}>{t('home.noPhoto')}</Text>
        )}
        <Pressable style={s.linkBtn} onPress={goWelcome}>
          <Text style={s.linkBtnText}>
            {userPhoto ? t('home.changePhoto') : t('home.addPhoto')}
          </Text>
        </Pressable>
      </View>

      {/*/!* Try-on items *!/*/}
      {/*<TryOnListUploader />*/}
      <TryOnSamplesList
        selectedSampleId={selectedSample?._id}
        onSelectSample={setSelectedSample}
      />

      <View style={{ alignItems: 'flex-end', marginBottom: 8 }}>
        <CreditsBadge />
      </View>

      {/* Generate */}
      <GenerateTaskButton selfUpload={false} selectedSample={selectedSample} />

      <ReccomendationProducts />
    </Container.WithTabBar>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.cardBg,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderColor: Colors.light.border,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  muted: { color: '#6B7280' },

  linkBtn: {
    marginTop: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
  },
  linkBtnText: { color: '#111827', fontWeight: '700' },

  previewFrame: {
    width: '100%',
    height: 320,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  preview: { width: '100%', height: '100%' },
});
