import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import FormInput from '../FormInput';
import Button from '../Button';
import i18n from '../../i18n';
import { getCardBrand } from './get-card-brand';

export const createPaymentFormSchema = z.object({
  cardNumber: z
    .string()
    .min(1, i18n.t('payments.validation.cardNumberRequired'))
    .regex(/^\d{16}$/, i18n.t('payments.validation.cardNumberDigits')),
  holderName: z
    .string()
    .min(1, i18n.t('payments.validation.holderNameRequired'))
    .min(3, i18n.t('payments.validation.holderNameMin')),
  expirationDate: z
    .string()
    .min(1, i18n.t('payments.validation.expirationDateRequired'))
    .regex(/^\d{2}\/\d{2}$/, i18n.t('payments.validation.expirationDateFormat')),
  cvv: z
    .string()
    .min(1, i18n.t('payments.validation.cvvRequired'))
    .regex(/^\d{3,4}$/, i18n.t('payments.validation.cvvDigits')),
  amount: z
    .number()
    .min(0.01, i18n.t('payments.validation.amountMin'))
    .multipleOf(0.01, i18n.t('payments.validation.amountDecimals')),
});

export type CreatePaymentFormData = z.infer<typeof createPaymentFormSchema>;

interface PaymentFormProps {
  isLoading: boolean;
  onSubmitPayment: (
    data: CreatePaymentFormData,
    reset: () => void,
  ) => Promise<void>;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  isLoading,
  onSubmitPayment,
}) => {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreatePaymentFormData>({
    resolver: zodResolver(createPaymentFormSchema),
    defaultValues: {
      cardNumber: '',
      holderName: '',
      expirationDate: '',
      cvv: '',
      amount: 0,
    },
  });

  return (
    <View>
      <Controller
        control={control}
        name="cardNumber"
        render={({ field: { value, onChange } }) => (
          <View>
            <FormInput
              label={t('payments.form.fields.cardNumber.label')}
              placeholder={t('payments.form.fields.cardNumber.placeholder')}
              value={value}
              onChangeText={onChange}
              keyboardType="numeric"
              maxLength={16}
              error={errors.cardNumber?.message}
            />
            {value.length > 0 && (
              <Text style={styles.brandText}>
                {t('payments.form.fields.cardNumber.brandLabel')}: {t(`payments.form.fields.cardNumber.brands.${getCardBrand(value)}`)}
              </Text>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="holderName"
        render={({ field: { value, onChange } }) => (
          <FormInput
            label={t('payments.form.fields.holderName.label')}
            placeholder={t('payments.form.fields.holderName.placeholder')}
            value={value}
            onChangeText={onChange}
            error={errors.holderName?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="expirationDate"
        render={({ field: { value, onChange } }) => (
          <FormInput
            label={t('payments.form.fields.expirationDate.label')}
            placeholder={t('payments.form.fields.expirationDate.placeholder')}
            value={value}
            onChangeText={onChange}
            maxLength={5}
            error={errors.expirationDate?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="cvv"
        render={({ field: { value, onChange } }) => (
          <FormInput
            label={t('payments.form.fields.cvv.label')}
            placeholder={t('payments.form.fields.cvv.placeholder')}
            value={value}
            onChangeText={onChange}
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
            error={errors.cvv?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="amount"
        render={({ field: { value, onChange } }) => (
          <FormInput
            label={t('payments.form.fields.amount.label')}
            placeholder={t('payments.form.fields.amount.placeholder')}
            value={value ? value.toString() : ''}
            onChangeText={(text) => onChange(parseFloat(text) || 0)}
            keyboardType="decimal-pad"
            error={errors.amount?.message}
          />
        )}
      />

      <View style={{ marginTop: 24, marginBottom: 16 }}>
        <Button
          title={
            isLoading
              ? t('payments.form.submit.loading')
              : t('payments.form.submit.idle')
          }
          onPress={handleSubmit((data) => onSubmitPayment(data, reset))}
          disabled={isLoading}
        />
      </View>

      {isLoading && (
        <View style={{ justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  brandText: {
    marginTop: -10,
    marginBottom: 10,
    color: '#555',
    fontSize: 12,
    fontWeight: '500',
  },
});
