import { useEffect } from 'react';
import { router } from 'expo-router';
import { useUserStore } from '@/stores/useUserStore';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function Boot() {
  const { status, getUserSelf } = useUserStore();

  useEffect(() => {
    getUserSelf();
  }, [getUserSelf]);

  useEffect(() => {
    if (status !== 'ready') return;

    router.replace('/(tabs)/try-on');
  }, [status]);

  return <LoadingScreen />;
}
