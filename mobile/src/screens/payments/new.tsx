import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPaymentFormSchema, CreatePaymentFormData, PaymentForm } from '../../components/payments/form';
import { paymentService } from '../../services/payments';

export const NewPaymentScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
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

  const onSubmit = async (data: CreatePaymentFormData) => {
    setIsLoading(true);
    try {
      const response = await paymentService.createPayment(data);
      Alert.alert(
        t('common.success'),
        t('payments.new.successCreated', { id: response.id }),
      );
      reset();
    } catch (error) {
      Alert.alert(t('common.error'), t('payments.new.errorCreate'));
      console.error('Payment creation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          <PaymentForm
            control={control}
            errors={errors}
            isLoading={isLoading}
            onSubmit={handleSubmit(onSubmit)}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  formContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    minHeight: '100%',
  },
});

export default NewPaymentScreen;
