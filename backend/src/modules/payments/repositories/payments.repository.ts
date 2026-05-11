import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { CreatePaymentDto } from '../dto/create-payment.dto';

export interface StoredPayment {
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
  items: StoredPayment[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

interface CreatePaymentInput {
  payment: CreatePaymentDto;
  transactionId: string;
  status: 'approved' | 'declined';
  totalTimeMs: number;
  steps: unknown[];
}

@Injectable()
export class PaymentsRepository implements OnModuleDestroy {
  private readonly database: DatabaseSync;

  constructor() {
    const databasePath = join(process.cwd(), 'data', 'wallet.db');
    mkdirSync(dirname(databasePath), { recursive: true });

    this.database = new DatabaseSync(databasePath);
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transactionId TEXT NOT NULL,
        cardNumberLast4 TEXT NOT NULL,
        holderName TEXT NOT NULL,
        expirationDate TEXT NOT NULL,
        amount REAL NOT NULL,
        status TEXT NOT NULL,
        totalTimeMs INTEGER NOT NULL,
        steps TEXT NOT NULL,
        createdAt TEXT NOT NULL
      )
    `);
  }

  saveTransaction(input: CreatePaymentInput): StoredPayment {
    const createdAt = new Date().toISOString();
    const cardNumberLast4 = input.payment.cardNumber.slice(-4);
    const statement = this.database.prepare(`
      INSERT INTO payments (
        transactionId,
        cardNumberLast4,
        holderName,
        expirationDate,
        amount,
        status,
        totalTimeMs,
        steps,
        createdAt
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);

    const result = statement.run(
      input.transactionId,
      cardNumberLast4,
      input.payment.holderName,
      input.payment.expirationDate,
      input.payment.amount,
      input.status,
      input.totalTimeMs,
      JSON.stringify(input.steps),
      createdAt,
    );

    return {
      id: Number(result.lastInsertRowid),
      transactionId: input.transactionId,
      cardNumberLast4,
      holderName: input.payment.holderName,
      expirationDate: input.payment.expirationDate,
      amount: input.payment.amount,
      status: input.status,
      totalTimeMs: input.totalTimeMs,
      steps: JSON.stringify(input.steps),
      createdAt,
    };
  }

  listPayments(page = 1, limit = 10): PaginatedPayments {
    const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
    const safeLimit =
      Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 10;
    const offset = (safePage - 1) * safeLimit;

    const totalItemsResult = this.database
      .prepare('SELECT COUNT(*) as total FROM payments')
      .get() as { total: number };

    const rows = this.database
      .prepare(
        `
          SELECT
            id,
            transactionId,
            cardNumberLast4,
            holderName,
            expirationDate,
            amount,
            status,
            totalTimeMs,
            steps,
            createdAt
          FROM payments
          ORDER BY createdAt DESC, id DESC
          LIMIT ? OFFSET ?
        `,
      )
      .all(safeLimit, offset);

    const totalItems = Number(totalItemsResult.total ?? 0);
    const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit));

    return {
      items: rows.map((row) => ({
        id: Number((row as { id: number }).id),
        transactionId: String((row as { transactionId: string }).transactionId),
        cardNumberLast4: String(
          (row as { cardNumberLast4: string }).cardNumberLast4,
        ),
        holderName: String((row as { holderName: string }).holderName),
        expirationDate: String(
          (row as { expirationDate: string }).expirationDate,
        ),
        amount: Number((row as { amount: number }).amount),
        status: (row as { status: 'approved' | 'declined' }).status,
        totalTimeMs: Number((row as { totalTimeMs: number }).totalTimeMs),
        steps: String((row as { steps: string }).steps),
        createdAt: String((row as { createdAt: string }).createdAt),
      })),
      page: safePage,
      limit: safeLimit,
      totalItems,
      totalPages,
    };
  }

  onModuleDestroy() {
    this.database.close();
  }
}
