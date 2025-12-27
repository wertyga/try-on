import { sendLogs } from '@/api';

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
