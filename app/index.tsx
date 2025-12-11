import { useEffect } from 'react';
import { router } from 'expo-router';
import { useUserStore } from '@/hooks/useUserStore';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function Boot() {
  const { status, user, getUserSelf } = useUserStore();

  useEffect(() => {
    getUserSelf();
  }, [getUserSelf]);

  useEffect(() => {
    if (status !== 'ready') return;

    router.replace(user ? '/(tabs)/try-on' : '/welcome');
  }, [status, user]);

  return <LoadingScreen />;
}
