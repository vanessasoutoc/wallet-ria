import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { CreatePaymentFormData, PaymentForm } from '../../components/payments/form';
import { paymentService } from '../../services/payments';
import z from 'zod';

export const NewPaymentScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const onSubmit = async (
    data: CreatePaymentFormData,
    reset: () => void,
  ) => {
    setIsLoading(true);
    try {
      const response = await paymentService.createPayment(data);
      Alert.alert(
        t('common.success'),
        t('payments.new.successCreated'),
      );
      reset();
    } catch (err) {
      if (err instanceof z.ZodError) {
        console.warn('Validation error:', err.flatten().fieldErrors);
      }
      Alert.alert(t('common.error'), t('payments.new.errorCreate'));
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
          <PaymentForm isLoading={isLoading} onSubmitPayment={onSubmit} />
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
