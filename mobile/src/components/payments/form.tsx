import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import { z } from 'zod';
import FormInput from '../FormInput';
import Button from '../Button';

export const createPaymentFormSchema = z.object({
  cardNumber: z
    .string()
    .min(1, 'Card number is required')
    .regex(/^\d{16}$/, 'Card number must be 16 digits'),
  holderName: z
    .string()
    .min(1, 'Cardholder name is required')
    .min(3, 'Name must be at least 3 characters'),
  expirationDate: z
    .string()
    .min(1, 'Expiration date is required')
    .regex(/^\d{2}\/\d{2}$/, 'Expiration date must be in MM/YY format'),
  cvv: z
    .string()
    .min(1, 'CVV is required')
    .regex(/^\d{3,4}$/, 'CVV must be 3 or 4 digits'),
  amount: z
    .number()
    .min(0.01, 'Amount must be greater than 0')
    .multipleOf(0.01, 'Amount must have up to 2 decimal places'),
});

export type CreatePaymentFormData = z.infer<typeof createPaymentFormSchema>;

interface PaymentFormProps {
  control: Control<CreatePaymentFormData>;
  errors: FieldErrors<CreatePaymentFormData>;
  isLoading: boolean;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  control,
  errors,
  isLoading,
  onSubmit,
}) => {
  return (
    <View>
      <Controller
        control={control}
        name="cardNumber"
        render={({ field: { value, onChange } }) => (
          <FormInput
            label="Card Number"
            placeholder="1234567891234567"
            value={value}
            onChangeText={onChange}
            keyboardType="numeric"
            maxLength={16}
            error={errors.cardNumber?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="holderName"
        render={({ field: { value, onChange } }) => (
          <FormInput
            label="Cardholder Name"
            placeholder="John Doe"
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
            label="Expiration Date"
            placeholder="MM/YY"
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
            label="CVV"
            placeholder="123"
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
            label="Amount"
            placeholder="150.00"
            value={value ? value.toString() : ''}
            onChangeText={(text) => onChange(parseFloat(text) || 0)}
            keyboardType="decimal-pad"
            error={errors.amount?.message}
          />
        )}
      />

      <View style={{ marginTop: 24, marginBottom: 16 }}>
        <Button
          title={isLoading ? 'Creating...' : 'Create Payment'}
          onPress={onSubmit}
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
