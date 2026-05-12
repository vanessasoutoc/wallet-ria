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

export interface PaymentItem {
  id: number;
  transactionId: string;
  cardNumberLast4: string;
  holderName: string;
  expirationDate: string;
  amount: number;
  status: 'approved' | 'declined';
  totalTimeMs: number;
  steps: string;
  createdAt: string;
}

export interface PaginatedPayments {
  items: PaymentItem[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

const API_BASE_URL = 'http://localhost:3000/v1';

export const paymentService = {
  async createPayment(data: CreatePaymentRequest): Promise<CreatePaymentResponse> {
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
  },

  async listPayments(page: number = 1, limit: number = 10): Promise<PaginatedPayments> {
    const response = await fetch(`${API_BASE_URL}/payments?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error: ${response.status}`);
    }

    return await response.json();
  },
};
