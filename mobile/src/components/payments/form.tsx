import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import type { Resolver } from 'react-hook-form';
import FormInput from '../FormInput';
import Button from '../Button';
import i18n from '../../i18n';
import { getCardBrand } from './get-card-brand';
import formatExpirationDate from '../../utils/format-expiration-date';
import formatCardNumber from '../../utils/format-card-number';
import expirationDateValid from '../../utils/expiration-date-valid';

const getSchema = () => z.object({
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
    .regex(/^\d{2}\/\d{2}$/, i18n.t('payments.validation.expirationDateFormat'))
    .refine(expirationDateValid, i18n.t('payments.validation.expirationDateExpired')),
  cvv: z
    .string()
    .min(1, i18n.t('payments.validation.cvvRequired'))
    .regex(/^\d{3,4}$/, i18n.t('payments.validation.cvvDigits')),
  amount: z
    .number()
    .min(0.01, i18n.t('payments.validation.amountMin'))
    .multipleOf(0.01, i18n.t('payments.validation.amountDecimals')),
});

export const createPaymentFormSchema = getSchema();

export type CreatePaymentFormData = z.infer<typeof createPaymentFormSchema>;

const safeZodResolver = (schema: z.ZodTypeAny): Resolver<CreatePaymentFormData> =>
  async (values) => {
    const result = await schema.safeParseAsync(values);
    if (result.success) return { values: result.data as CreatePaymentFormData, errors: {} };
    return {
      values: {} as Record<string, never>,
      errors: result.error.issues.reduce((acc, issue) => {
        const key = issue.path[0] as keyof CreatePaymentFormData;
        if (!acc[key]) acc[key] = { type: issue.code, message: issue.message };
        return acc;
      }, {} as Record<keyof CreatePaymentFormData, { type: string; message: string }>),
    };
  };

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
    formState: { errors, isValid },
    reset,
  } = useForm<CreatePaymentFormData>({
    resolver: safeZodResolver(getSchema()),
    mode: 'onChange',
    defaultValues: {
      cardNumber: '',
      holderName: '',
      expirationDate: '',
      cvv: '',
      amount: 0,
    },
  });

  const onSubmit = async (data: CreatePaymentFormData) => {
    try {
      await onSubmitPayment(data, reset);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log('Validation errors:', error.flatten().fieldErrors);
        console.warn('Validation error:', error.flatten().fieldErrors);
      }
    }
  };

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
              value={formatCardNumber(value)}
              onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, 16))}
              keyboardType="numeric"
              maxLength={19}
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

      <View style={styles.rowInputs}>
        <Controller
          control={control}
          name="expirationDate"
          render={({ field: { value, onChange } }) => (
            <FormInput
              label={t('payments.form.fields.expirationDate.label')}
              placeholder={t('payments.form.fields.expirationDate.placeholder')}
              value={value}
              onChangeText={(text) => onChange(formatExpirationDate(text))}
              keyboardType="numeric"
              maxLength={5}
              error={errors.expirationDate?.message}
              containerStyle={styles.rowInputItem}
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
              containerStyle={styles.rowInputItem}
            />
          )}
        />
      </View>

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
          style={{backgroundColor: '#004c48'}}
          title={
            isLoading
              ? t('payments.form.submit.loading')
              : t('payments.form.submit.idle')
          }
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading || !isValid}
        />
      </View>

      {isLoading && (
        <View style={{ justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <ActivityIndicator size="large" color="#004c48" />
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
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  rowInputItem: {
    flex: 1,
  },
});
