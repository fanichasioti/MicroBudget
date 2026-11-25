# MicroBudget

MicroBudget helps students track their expenses and manage a monthly budget.

## Run locally

```sh
npm install
npm run dev
```

Create a production build with `npm run build`, or preview it with `npm run preview`.

## Data and privacy

Profile details, expenses, monthly bills, notification history, connected-app
selections, savings goals, color theme, and the budget are stored in this
browser's local storage. No account service or remote API is used. Bill
reminders are checked while the app is open; browser notifications require
permission and a supported browser. Monthly expense exports are downloaded as
CSV, and sample data can be loaded from the profile menu without replacing
existing personal records. Income entries, the selected dashboard month, and
savings simulator settings are also saved locally.

Smart Deals, promo codes, expiry dates, and estimated savings are illustrative
examples, not verified live offers. Marking a deal as used adds its estimated
savings to the local counter. App connection toggles are local preferences and
do not authenticate with third-party services. Deal links open the brands'
external websites.

