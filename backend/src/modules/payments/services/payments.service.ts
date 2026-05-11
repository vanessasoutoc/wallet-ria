import { Injectable } from '@nestjs/common';
import delay from '../../../common/utils/delay';
import randomBetween from '../../../common/utils/random-between';
import { CreatePaymentDto } from '../dto/create-payment.dto';

type StepName =
  | 'account_validation'
  | 'card_validation'
  | 'anti_fraud'
  | 'acquirer_processing'
  | 'payment'
  | 'notification';

const STEP_TIMINGS: Record<StepName, [number, number]> = {
  account_validation: [450, 730],
  card_validation: [300, 800],
  anti_fraud: [700, 1500],
  acquirer_processing: [1000, 2500],
  payment: [800, 1250],
  notification: [200, 300],
};

const STEP_ORDER: StepName[] = [
  'account_validation',
  'card_validation',
  'anti_fraud',
  'acquirer_processing',
  'payment',
  'notification',
];

@Injectable()
export class PaymentsService {
  private selectSteps(): StepName[] {
    const count = randomBetween(3, 6);
    const shuffled = [...STEP_ORDER].sort(() => Math.random() - 0.5);
    const selected = new Set(shuffled.slice(0, count));
    return STEP_ORDER.filter((s) => selected.has(s));
  }

  private async runStep(
    name: StepName,
  ): Promise<{ step: string; timeMs: number }> {
    const [min, max] = STEP_TIMINGS[name];
    const duration = randomBetween(min, max);
    await delay(duration);
    return { step: name, timeMs: duration };
  }

  async processPayment(dto: CreatePaymentDto) {
    const steps = this.selectSteps();
    const results: { step: string; timeMs: number }[] = [];

    for (const step of steps) {
      const result = await this.runStep(step);
      results.push(result);
    }

    const totalTimeMs = results.reduce((sum, r) => sum + r.timeMs, 0);
    const declined = Math.random() < 0.1;

    return {
      status: declined ? 'declined' : 'approved',
      transactionId: `txn_${Date.now()}`,
      totalTimeMs,
      steps: results,
    };
  }

  async getAllPayments() {
    return [
      {
        id: '1',
        amount: 100,
        status: 'approved',
        createdAt: new Date(),
      },
      {
        id: '2',
        amount: 200,
        status: 'declined',
        createdAt: new Date(),
      },
    ];
  }
}
