import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';

import { sendFeedback } from '@/api';
import { Container } from '@/components/ui/Container';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/button';
import { Colors } from '@/constants/Colors';
import { useUserStore } from '@/stores';

type FeedbackFormValues = {
  message: string;
  email?: string;
};

export default function FeedbackScreen() {
  const { t } = useTranslation();
  const { user, deviceId } = useUserStore();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FeedbackFormValues>({
    defaultValues: {
      message: '',
      email: user?.email ?? '',
    },
  });

  const validationRules = useMemo(
    () => ({
      message: {
        required: t('feedback.validation.messageRequired'),
        minLength: {
          value: 10,
          message: t('feedback.validation.messageLength'),
        },
      },
      email: {
        pattern: {
          value: /\S+@\S+\.\S+/,
          message: t('feedback.validation.email'),
        },
      },
    }),
    [t],
  );

  const onSubmit = async (values: FeedbackFormValues) => {
    setIsSubmitting(true);

    try {
      await sendFeedback({
        message: values.message.trim(),
        email: values.email?.trim() || undefined,
        deviceId,
        user: user?._id,
      });

      Toast.show({
        type: 'success',
        text1: t('feedback.successTitle'),
      });

      reset({
        message: '',
        email: user?.email ?? '',
      });
    } catch (e) {
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container title={t('feedback.title')}>
      <View style={s.card}>
        <Text style={s.description}>{t('feedback.subtitle')}</Text>

        <Text style={s.label}>{t('feedback.messageLabel')}</Text>
        <Controller
          name="message"
          control={control}
          rules={validationRules.message}
          render={({ field: { onChange, value } }) => (
            <Input
              onChange={onChange}
              value={value}
              placeholder={t('feedback.messagePlaceholder')}
              multiline
              inputStyle={s.messageInput}
              error={errors.message?.message}
            />
          )}
        />

        <Text style={s.label}>{t('feedback.emailLabel')}</Text>
        <Controller
          name="email"
          control={control}
          rules={validationRules.email}
          render={({ field: { onChange, value } }) => (
            <Input
              onChange={onChange}
              value={value}
              placeholder={t('feedback.emailPlaceholder')}
              keyboardType="email-address"
              autoCapitalize="none"
              inputStyle={{ height: 42 }}
              error={errors.email?.message}
            />
          )}
        />

        <Button
          fullWidth
          onPress={handleSubmit(onSubmit)}
          isLoading={isSubmitting}
          dark
        >
          {t('feedback.submit')}
        </Button>
      </View>
    </Container>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  description: {
    color: Colors.light.text,
  },
  label: {
    fontWeight: '700',
    color: Colors.light.text,
  },
  messageInput: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingVertical: 10,
  },
});
