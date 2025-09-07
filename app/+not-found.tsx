import { View, Pressable, Text } from 'react-native';
import { Link, usePathname } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function NotFoundScreen() {
  const path = usePathname();
  const { t } = useTranslation();
  
  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
      <Text style={{ fontSize: 20, fontWeight: '800', marginBottom: 8 }}>
        {t('notFound.title')}
      </Text>
      
      <Text style={{ color: '#6B7280', marginBottom: 16 }}>
        {t('notFound.path', { path })}
      </Text>
      
      <Link href="/welcome" asChild>
        <Pressable style={{ backgroundColor: '#111827', padding: 12, borderRadius: 12 }}>
          <Text style={{ color: '#fff', fontWeight: '700', textAlign: 'center' }}>
            {t('notFound.goHome')}
          </Text>
        </Pressable>
      </Link>
    </View>
  );
}
