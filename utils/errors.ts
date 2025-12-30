import { sendLogs } from '@/api';
import { useTranslation } from 'react-i18next';

export function installGlobalErrorHandlers() {
  // RN глобальная ошибка
  const defaultHandler =
    (global as any).ErrorUtils?.getGlobalHandler?.() ?? null;

  (global as any).ErrorUtils?.setGlobalHandler?.(
    async (error: any, isFatal?: boolean) => {
      await sendLogs({
        '[GLOBAL JS ERROR]': {
          isFatal,
          message: error?.message,
          error,
        },
      });

      if (!isFatal) {
        return;
      }

      if (defaultHandler) defaultHandler(error, isFatal);
    },
  );

  // Unhandled promise rejections (часто помогает в Hermes/JSC)
  const tracking = (global as any).__rejectionTracking;
  if (tracking?.enable) {
    tracking.enable({
      allRejections: true,
      onUnhandled: async (id: any, error: any) => {
        await sendLogs({
          '[UNHANDLED REJECTION]': {
            id,
            message: error?.message,
            error,
          },
        });
      },
      onHandled: async (id: any) => {
        await sendLogs({ '[HANDLED REJECTION]': { id } });
      },
    });
  }
}

type ErrorKey =
  | 'noPerson'
  | 'wrongModelImage'
  | 'wrongClothImage'
  | 'inappropriateImage'
  | 'unsupportedImage'
  | 'default';

const ERROR_REASON_MAP: Array<{
  match: (reason: string) => boolean;
  key: ErrorKey;
}> = [
  {
    match: (r) => r.includes('NO_PERSON'),
    key: 'noPerson',
  },
  {
    match: (r) => r.includes('model image upload failed'),
    key: 'wrongModelImage',
  },
  {
    match: (r) => r.includes('clothes image upload failed'),
    key: 'wrongClothImage',
  },
  {
    match: (r) => r.includes('inappropriate image detected'),
    key: 'inappropriateImage',
  },
  {
    match: (r) => r.includes('IMAGE_SAFETY') || r.includes('IMAGE_OTHER'),
    key: 'unsupportedImage',
  },
];

export const useErrorMessage = (reason?: string) => {
  const { t } = useTranslation();

  if (!reason) return '';

  const matched = ERROR_REASON_MAP.find(({ match }) => match(reason));

  const key = matched?.key ?? 'default';

  return t(`errors.${key}`);
};
