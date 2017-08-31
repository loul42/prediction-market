# prediction-market
A decentralized prediction market based on Ethereum

Currently the contract allows you to :

* As an administrator, you can add a yes/no question.
* As a regular user you can bet on an outcome of the question.
* As a trusted source, you can resolve the question.
* As a regular user, you can trigger the mutual-based payouts.


## Installation procedure

```
git clone https://github.com/loul42/prediction-market.git
cd prediction-market
npm install
```

Run it :

```
test rpc
truffle migrate --reset
npm run dev
```
Project will run on http://localhost:8080
