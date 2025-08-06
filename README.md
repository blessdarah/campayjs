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
  apiKey: 'YOUR_API_KEY',
  secret: 'YOUR_SECRET',
})

// collect payment 
await campay.collect({
    amount: 100,
    currency: 'XAF', // default 
    description: 'Payment for order #1234',
    phone: '2376 xxx xxx', // default
});

await campay.getBalance()
```

## License

MIT
