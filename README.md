# Wallet RIA

Aplicação de processamento de pagamentos composta por um **backend** NestJS e um **app mobile** em React Native.

---

## Requisitos

### Gerais
- Node.js >= 24.14.1
- Yarn

### Backend
- Node.js >= 24.14.1
- Yarn

### Mobile
- Node.js >= 24.14.1
- Yarn
- React Native CLI
- Xcode >= 15 (iOS)
- Android Studio (Android)
- CocoaPods (iOS)
- Ruby (para CocoaPods)

---

## Estrutura

```
wallet-ria/
├── backend/          # API NestJS
│   ├── src/
│   │   ├── main.ts
│   │   ├── common/utils/
│   │   └── modules/payments/
│   └── test/
└── mobile/           # App React Native
    ├── src/
    │   ├── components/
    │   ├── screens/payments/
    │   ├── services/
    │   ├── routes/
    │   ├── i18n/
    │   └── utils/
    └── __tests__/
```

---

## Instalação

### Clonar

```bash
git clone <repo-url>
cd wallet-RIA
```

### Backend

```bash
cd backend
yarn install
```

### Mobile

```bash
cd mobile
yarn install
```

**iOS – instalar dependências nativas:**

```bash
cd mobile/ios
pod install
```

**iOS – linkar assets de fontes:**

```bash
cd mobile
npx react-native-asset
```

---

## Execução

### Backend

```bash
cd backend

# Desenvolvimento (com hot reload)
yarn start:dev

# Produção
yarn build
yarn start:prod
```

O servidor sobe por padrão em `http://localhost:3000`.

### Mobile

```bash
cd mobile

# Iniciar Metro bundler
yarn start

# iOS
yarn ios

# Android
yarn android
```

---

## Testes

### Backend

```bash
cd backend

# Unitários
yarn test

# Com cobertura
yarn test:cov

# E2E
yarn test:e2e
```

#### Resultado dos testes unitários

| Suite | Testes | Status |
|---|---|---|
| `test/main.spec.ts` | 5 | ✅ PASS |
| `test/modules/payments/controllers/payments.controller.spec.ts` | 19 | ✅ PASS |
| `test/modules/payments/services/payments.service.spec.ts` | 18 | ✅ PASS |
| `test/modules/payments/repositories/payments.repository.spec.ts` | 15 | ✅ PASS |
| `test/modules/payments/dto/create-payment.dto.spec.ts` | 6 | ✅ PASS |
| `test/common/utils/delay.spec.ts` | 7 | ✅ PASS |
| `test/common/utils/random-beetween.spec.ts` | 4 | ✅ PASS |

```
Test Suites: 8 passed, 8 total
Tests:       84 passed, 84 total
```

<details>
<summary>Detalhe dos testes — backend</summary>

**main.spec.ts**
- ✓ should create the NestJS app and call listen
- ✓ should enable URI versioning
- ✓ should register a ValidationPipe with whitelist and forbidNonWhitelisted
- ✓ should listen on PORT env variable when set
- ✓ should listen on port 3000 by default when PORT is not set

**PaymentsController**
- ✓ should call processPayment with the provided DTO
- ✓ should return the result from processPayment
- ✓ should return approved status when service returns approved
- ✓ should return declined status when service returns declined
- ✓ should return the transactionId from the service response
- ✓ should return the steps array from the service response
- ✓ should return the totalTimeMs from the service response
- ✓ should throw InternalServerErrorException when service throws an error
- ✓ should throw InternalServerErrorException with message "Payment processing failed"
- ✓ should throw InternalServerErrorException even when service throws a non-Error value
- ✓ should not expose the original error message to the client
- ✓ should call getAllPayments with page and default limit of 10
- ✓ should call getAllPayments with provided limit parameter
- ✓ should enforce maximum limit of 100 items per page
- ✓ should enforce minimum limit of 1 item per page
- ✓ should return full paginated response with items and metadata
- ✓ should return paginated response with empty items array when no payments exist
- ✓ should return paginated response with items from the specified page

**PaymentsService**
- ✓ should return a response with the expected shape
- ✓ should return status "approved" when Math.random() returns a value >= 0.1
- ✓ should return status "declined" when Math.random() returns a value < 0.1
- ✓ should generate a UUID transactionId
- ✓ should generate a unique transactionId on each call
- ✓ should select exactly 3 steps when randomBetween returns value for count
- ✓ should select exactly 4 steps when randomBetween returns value for count
- ✓ should select exactly 5 steps when randomBetween returns value for count
- ✓ should select exactly 6 steps when randomBetween returns value for count
- ✓ should return only valid and known step names
- ✓ should return steps in logical order (preserving STEP_ORDER sequence)
- ✓ should set totalTimeMs equal to the sum of all step timMs
- ✓ should return each step with "step" (string) and "timeMs" (number) fields
- ✓ should use the duration returned by randomBetween as each step timeMs
- ✓ should not include duplicate steps in the response
- ✓ should fetch payments with default limit of 10 when no limit provided
- ✓ should fetch payments with custom limit when provided
- ✓ should pass page and limit to repository

**PaymentsRepository**
- ✓ should save a transaction and return it with the expected shape
- ✓ should extract the last 4 digits of the card number
- ✓ should store steps as a JSON string
- ✓ should create a createdAt timestamp
- ✓ should save declined status correctly
- ✓ should return paginated results with correct pagination metadata
- ✓ should respect pagination limits and offsets
- ✓ should handle invalid page numbers gracefully
- ✓ should order results by createdAt DESC (newest first)
- ✓ should calculate totalPages correctly
- ✓ should return results of expected shape
- ✓ should close the database connection
- ✓ should return empty paginated result when no payments exist
- ✓ should default to page 1 and limit 10
- ✓ should handle invalid limit values gracefully

**CreatePaymentDto**
- ✓ accepts a valid payload
- ✓ rejects cardNumber shorter than 16 characters
- ✓ rejects cvv shorter than 3 characters
- ✓ rejects expirationDate that does not match MM/YY
- ✓ rejects expirationDate in the current month
- ✓ accepts expirationDate in a future month

**delay**
- ✓ should return a Promise
- ✓ should resolve after the specified number of milliseconds
- ✓ should not resolve before the specified time has elapsed
- ✓ should resolve with undefined
- ✓ should resolve immediately when called with 0ms
- ✓ should call setTimeout with the correct delay value
- ✓ should work independently for multiple concurrent calls

**randomBetween**
- ✓ should return a number
- ✓ should return an integer (no decimal places)
- ✓ should return min when Math.random() returns 0
- ✓ should return max when Math.random() returns a value just below 1
</details>

---

### Mobile

```bash
cd mobile

# Unitários
yarn test

# Em modo watch
yarn test --watch
```

#### Resultado dos testes unitários

| Suite | Testes | Status |
|---|---|---|
| `__tests__/App.test.tsx` | 1 | ✅ PASS |
| `__tests__/components/Button.test.tsx` | 4 | ✅ PASS |
| `__tests__/components/FormInput.test.tsx` | 3 | ✅ PASS |
| `__tests__/components/payments/get-card-brand.test.ts` | 7 | ✅ PASS |
| `__tests__/utils/format-expiration-date.test.ts` | 5 | ✅ PASS |
| `__tests__/utils/formatters.test.ts` | 8 | ✅ PASS |
| `__tests__/services/payments.test.ts` | 5 | ✅ PASS |
| `__tests__/screens/payments/list.test.tsx` | 2 | ✅ PASS |
| `__tests__/screens/payments/new.test.tsx` | 3 | ✅ PASS |

```
Test Suites: 9 passed, 9 total
Tests:       38 passed, 38 total
```

<details>
<summary>Detalhe dos testes — mobile</summary>

**App**
- ✓ renders correctly

**Button**
- ✓ renders title when not loading
- ✓ calls onPress when pressed
- ✓ is disabled when disabled is true
- ✓ shows loader and disables press when loading is true

**FormInput**
- ✓ renders label and placeholder
- ✓ renders error message when error is provided
- ✓ calls onChangeText from TextInput

**getCardBrand**
- ✓ detects visa
- ✓ detects mastercard
- ✓ detects amex
- ✓ detects discover
- ✓ detects jcb
- ✓ returns unknown for unsupported numbers
- ✓ ignores non-digit characters

**formatCardNumber**
- ✓ formats 16 digits into groups of 4
- ✓ ignores non-digit characters and keeps grouping
- ✓ limits to 16 digits
- ✓ returns empty string for empty input

**formatExpirationDate**
- ✓ keeps up to 2 digits without slash
- ✓ formats as MM/YY when more than 2 digits
- ✓ ignores non-digit characters
- ✓ limits to 4 digits

**formatExpirationDate (dedicated suite)**
- ✓ returns empty string for empty input
- ✓ keeps one or two digits without slash
- ✓ adds slash when there are more than two digits
- ✓ ignores non-digit characters
- ✓ limits output to MM/YY (4 digits)

**paymentService**
- ✓ createPayment sends POST and returns parsed response
- ✓ createPayment throws message from API when response is not ok
- ✓ listPayments sends GET with page and limit params
- ✓ listPayments uses default pagination params when omitted
- ✓ listPayments throws fallback status message when API has no message

**PaymentsListScreen**
- ✓ renders payment item when list request succeeds
- ✓ shows translated error when request fails

**NewPaymentScreen**
- ✓ submits payment and shows success alert
- ✓ shows error alert when create payment fails
- ✓ renders payment form container
</details>

---

## IA 

Foi utilizada IA como ferramente de ajuda e otimização para o desenvolvimento.
- Testes unitários (backend e mobile);
- Documentações;