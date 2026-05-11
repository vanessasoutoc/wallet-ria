# Backend – Payment BFF (NestJS)

BFF (Backend for Frontend) que orquestra um fluxo de pagamento mockado com etapas simuladas, medição de tempo por etapa e recusa aleatória (~10%).

---

## Requisitos

| Ferramenta | Versão mínima |
|---|---|
| Node.js | 20.x LTS (testado com v25.8.0) |
| yarn | 10.x (testado com v11.11.0) |
| NestJS CLI | 11.x (testado com v11.0.21) |

> **Recomendado:** use [nvm](https://github.com/nvm-sh/nvm) para gerenciar versões do Node.

---

## Principais bibliotecas

### Dependências de produção

| Pacote | Versão |
|---|---|
| `@nestjs/common` | ^11.0.1 |
| `@nestjs/core` | ^11.0.1 |
| `@nestjs/platform-express` | ^11.0.1 |
| `@nestjs/swagger` | ^11.4.2 |
| `class-validator` | ^0.15.1 |
| `class-transformer` | ^0.5.1 |
| `nestjs-pino` | ^4.6.1 |
| `prom-client` | ^15.1.3 |
| `rxjs` | ^7.8.1 |
| `uuid` | ^14.0.0 |

### Dependências de desenvolvimento

| Pacote | Versão |
|---|---|
| `@nestjs/testing` | ^11.0.1 |
| `jest` | ^30.4.2 |
| `ts-jest` | ^29.2.5 |
| `typescript` | ^5.7.3 |
| `eslint` | ^9.18.0 |
| `prettier` | ^3.4.2 |
| `supertest` | ^7.2.2 |

---

## Instalação

```bash
yarn install
```

---

## Executar o projeto

### Desenvolvimento (hot reload)

```bash
yarn run start:dev
```

### Produção

```bash
yarn run build
yarn run start:prod
```

### Modo padrão (sem watch)

```bash
yarn run start
```

O servidor sobe em `http://localhost:3000` por padrão.  
Para alterar a porta, defina a variável de ambiente `PORT`:

```bash
PORT=4000 yarn run start:dev
```

---

## Endpoint disponível

### `POST /v1/payments`

Orquestra entre 3 e 6 etapas mockadas do fluxo de pagamento.

**Body (JSON):**

```json
{
  "cardNumber": "4111111111111111",
  "holderName": "John Doe",
  "expirationDate": "12/28",
  "cvv": "123",
  "amount": 150.00
}
```

**Resposta de sucesso (200):**

```json
{
  "status": "approved",
  "transactionId": "txn_1715000000000",
  "totalTimeMs": 2100,
  "steps": [
    { "step": "card_validation", "timeMs": 420 },
    { "step": "anti_fraud", "timeMs": 820 },
    { "step": "acquirer_processing", "timeMs": 860 }
  ]
}
```

**Erros:**

| Código | Motivo |
|---|---|
| `400` | `amount` ausente, zero ou negativo / campos obrigatórios faltando |
| `500` | Falha inesperada durante o processamento |

---

## Executar testes

### Todos os testes unitários

```bash
yarn test
```

### Apenas os testes do módulo de pagamentos

```bash
yarn test -- --testPathPattern="payments"
```

### Modo watch (re-executa ao salvar)

```bash
yarn run test:watch
```

### Cobertura de código

```bash
yarn run test:cov
```

O relatório de cobertura é gerado em `coverage/`.

### Testes E2E

```bash
yarn run test:e2e
```

---

## Estrutura do projeto

```
src/
├── common/
│   └── utils/
│       ├── delay.ts              # Wrapper de setTimeout em Promise
│       └── random-between.ts    # Gerador de inteiro aleatório em intervalo
├── modules/
│   └── payments/
│       ├── controllers/
│       │   ├── payments.controller.ts
│       │   └── payments.controller.spec.ts
│       ├── services/
│       │   ├── payments.service.ts
│       │   └── payments.service.spec.ts
│       ├── dto/
│       │   └── create-payment.dto.ts
│       ├── interfaces/
│       │   └── payment-step-result.ts
│       └── payments.module.ts
├── app.module.ts
└── main.ts
```

---

## Lint e formatação

```bash
# Lint com correção automática
yarn run lint

# Formatação com Prettier
yarn run format
```
