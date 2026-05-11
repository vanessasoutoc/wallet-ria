import { Alert } from 'react-native';

export interface CreatePaymentRequest {
  cardNumber: string;
  holderName: string;
  expirationDate: string;
  cvv: string;
  amount: number;
}

export interface CreatePaymentResponse {
  id: string;
  cardNumber: string;
  holderName: string;
  expirationDate: string;
  amount: number;
  createdAt: string;
}

const API_BASE_URL = 'http://localhost:3000/v1';

export const paymentService = {
  async createPayment(data: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create payment';
      Alert.alert('Error', message);
      throw error;
    }
  },
};
