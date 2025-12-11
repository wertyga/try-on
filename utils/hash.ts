import 'react-native-get-random-values';
import { TryOnPayload } from '@/hooks/useTryOnStore';
import { storage } from '@/utils/storage';

export function hash(s: string) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return (h >>> 0).toString(16);
}

export function fingerprintFromPayload(p: TryOnPayload) {
  const key = [
    p.mode,
    hash(p.userBase64 || ''),
    hash(p.dressBase64 || ''),
    hash(p.upperBase64 || ''),
    hash(p.lowerBase64 || ''),
  ].join('|');
  return key;
}

export const deviceId = {
  get: async () => {
    return await storage.get('device_id');
  },
  set: async (deviceId: string) => {
    await storage.set('device_id', deviceId);
  },
};
