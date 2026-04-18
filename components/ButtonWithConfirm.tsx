import React, { FC, useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { TButtonProps } from '@/components/ui/button/button';
import { BottomModal } from '@/components/ui/BottomModal';
import { Input } from '@/components/ui/Input';

export type TButtonWithConfirmProps = TButtonProps & {
  onPress: (value?: string) => void | Promise<void>;
  alertText: string;
  alertDescription?: string;
  confirmText?: string;
  errorText?: string;
  requirePassword?: boolean;
  passwordPlaceholder?: string;
  passwordErrorText?: string;
};

export const ButtonWithConfirm: FC<TButtonWithConfirmProps> = ({
  onPress,
  alertText,
  alertDescription,
  confirmText,
  errorText,
  requirePassword,
  passwordPlaceholder,
  passwordErrorText,
  isLoading,
  ...buttonProps
}) => {
  const { t } = useTranslation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | undefined>();

  const closeModal = useCallback(() => {
    if (isLoading) return;

    setIsModalVisible(false);
    setPassword('');
    setLocalError(undefined);
  }, [isLoading]);

  const submitWithPassword = useCallback(async () => {
    const trimmedPassword = password.trim();

    if (!trimmedPassword) {
      setLocalError(passwordErrorText || t('profile.deleteDataPasswordRequired'));
      return;
    }

    setLocalError(undefined);

    try {
      await onPress(trimmedPassword);
      closeModal();
    } catch (e: any) {
      Alert.alert(
        t('common.error'),
        e?.message || errorText || t('errors.failedToDelete'),
      );
    }
  }, [closeModal, errorText, onPress, password, passwordErrorText, t]);

  const handleClick = () => {
    if (requirePassword) {
      setPassword('');
      setLocalError(undefined);
      setIsModalVisible(true);
      return;
    }

    Alert.alert(alertText, alertDescription, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: confirmText || t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await onPress();
          } catch (e: any) {
            Alert.alert(
              t('common.error'),
              e?.message || errorText || t('errors.failedToDelete'),
            );
          }
        },
      },
    ]);
  };

  return (
    <>
      <Button {...buttonProps} isLoading={isLoading} onPress={handleClick} />

      {requirePassword ? (
        <BottomModal visible={isModalVisible} onClose={closeModal} isLoading={isLoading}>
          <View style={s.content}>
            <Text style={s.title}>{alertText}</Text>
            {!!alertDescription && <Text style={s.description}>{alertDescription}</Text>}

            <Input
              value={password}
              onChange={(value) => {
                setPassword(value);
                if (localError) setLocalError(undefined);
              }}
              placeholder={passwordPlaceholder || t('profile.deleteDataPasswordPlaceholder')}
              secureTextEntry
              textContentType="password"
              autoCapitalize="none"
              autoCorrect={false}
              error={localError}
              style={s.input}
            />

            <View style={s.actions}>
              <Button transparent onPress={closeModal} disabled={isLoading}>
                {t('common.cancel')}
              </Button>
              <Button dark onPress={submitWithPassword} isLoading={isLoading}>
                {confirmText || t('common.delete')}
              </Button>
            </View>
          </View>
        </BottomModal>
      ) : null}
    </>
  );
};

const s = StyleSheet.create({
  content: {
    gap: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  description: {
    color: '#6B7280',
  },
  input: {
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
