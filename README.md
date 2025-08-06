# CampayJs

JS/TS wrapper for Campay API

## Installation

```bash
npm install campayjs
```

## Usage

```js
import Campay from 'campayjs'

const campay = new Campay({
  appKey: 'YOUR_API_KEY',
  appSecret: 'YOUR_SECRET',
  baseUrl: 'https://campay.net/api', // will use demo url if not provided
})


```

### Collect payment
```js
await campay.collect({
  amount: 100,
  currency: 'XAF', // default 
  description: 'Payment for order #1234',
  phone: '2376 xxx xxx', // default
});
```

### Get transaction status
```js
await campay.getTransactionStatus(
  "c61faf9f-d5f3-4a5b-965a-3a91f7c3b6eb"
);
```

### Get balance
```js
await campay.getAppBalance();
```

### Get transaction history
```js
await campay.getTransactionHistory(
  "2022-08-01",
  "2025-08-31"
);

```

### Get payment link
```js
const paymentLink = await campay.getPaymentLink({
  amount: 4,
  currency: "XAF",
  from: "2376 xxx xxx",
  description: "Test",
  reference: "Test collection",
});
console.log("payment link: ", paymentLink);
```

## License

MIT
