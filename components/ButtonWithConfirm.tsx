import React, { FC, useCallback } from 'react';
import { Alert } from 'react-native';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { TButtonProps } from '@/components/ui/button/button';

export type TButtonWithConfirmProps = TButtonProps & {
  onPress: () => void | Promise<void>;
  alertText: string;
};

export const ButtonWithConfirm: FC<TButtonWithConfirmProps> = ({
  onPress,
  alertText,
  ...buttonProps
}) => {
  const { t } = useTranslation();

  const handleClick = useCallback(() => {
    Alert.alert(alertText, t('alerts.deleteLookText'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await onPress();
          } catch (e: any) {
            Alert.alert(
              t('common.error'),
              e?.message || t('errors.failedToDelete'),
            );
          }
        },
      },
    ]);
  }, [t]);

  return <Button {...buttonProps} onPress={handleClick} />;
};
