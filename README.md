# GEN-PAY

**One account. Every client's money kept apart from your own.**

Freelancers in Indonesia get paid into the same account they use for rent and groceries. GEN-PAY gives that account structure — separate wallets for personal and client money, every transaction tagged to a project, no spreadsheet in sight.

---

## Table of Contents

- [The Problem](#the-problem)
- [Our Solution](#our-solution)
- [Who GEN-PAY Is For](#who-gen-pay-is-for)
- [Current Features](#current-features)
- [Product Roadmap](#product-roadmap)
- [Product Screenshots](#product-screenshots)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Security](#security)
- [Team](#team)
- [About GENVORI](#about-genvori)
- [Contributing](#contributing)
- [License](#license)

---

## The Problem

Our co-founder's first client payment landed in his personal bank account. Fine — one client, easy to track in his head.

Then a second client. A third. Now three pools of money sat in one account, each meant for different expenses, none of them labeled. He opened a spreadsheet. Then an invoicing tool, because the spreadsheet couldn't send invoices. Then tax season arrived, and a weekend went to reconstructing six months of transactions to figure out what was actually business income.

He wasn't disorganized. There was just no product built for where he was: making real money from real clients, without a registered company. Banks assume you're a business. E-wallets assume you're a consumer. Nobody builds for the middle.

So the work of staying organized fell on him — five tools stitched together by hand:

- A **wallet** to hold the money
- A **spreadsheet** to remember whose it was
- A **budgeting app** to see what he could actually spend
- A **project tracker** for deadlines
- Eventually, a **business account**, once the spreadsheet gave out

Every tool worked fine alone. The cost was in stitching them together — done by the one person with the least time to do it.

---

## Our Solution

GEN-PAY doesn't ask you to switch accounts. It starts from the one you already use to get paid, and adds what's missing: separation.

Create a wallet for personal money and one for client money. Tag every transfer to a project. The history builds itself as you work, instead of getting rebuilt every April.

Get paid → route it → tag it → check the balance whenever you need to. That's the whole app.

---

## Who GEN-PAY Is For

**An Indonesian freelancer or solo entrepreneur getting paid by real clients, with no registered business entity yet.**

This person falls through the gap on both sides — too much of a business for a consumer wallet, not enough of one for corporate banking, which wants a PT/CV, a business account, or a transaction minimum they don't hit yet. GEN-PAY isn't for registered SMEs or finance teams. It's for the stretch of a career banks and wallets both pretend doesn't exist.

---

## Current Features

**Keep client money separate from your own.**
Create dedicated wallets — personal, business, or per-client — and move money between them on purpose.

**Pay collaborators without leaving the app.**
Send funds to another GEN-PAY wallet by account number.

**Get paid without a separate top-up flow.**
Add funds to any wallet directly from the app.

**Know which client a transaction belongs to, instantly.**
Tag income and expenses to a project so nothing blends into one balance.

**See your full financial history at a glance.**
A chronological, per-wallet, per-project record — no reconstruction required.

**Know the moment money moves.**
Real-time alerts for anything in or out of a wallet.

**Open the app without typing a password.**
JWT-secured sessions, PIN-locked for fast, safe access on mobile.

---

## Product Roadmap

**Phase 1 — Money can actually enter the app**
Today, GEN-PAY moves money that's already inside it. This phase changes that: a freelancer connects a real client payment — bank transfer, virtual account, or QRIS — and runs a full month of real income through GEN-PAY for the first time.

**Phase 2 — Staying organized stops being manual work**
Right now, separation still takes intention. This phase makes it the default: a dedicated business wallet, invoicing, and project-level cash flow views mean early users track real income without lifting a finger to sort it.

**Phase 3 — Users tell us what's worth paying for**
We introduce a paid tier and let real usage decide what it covers. Success here isn't a feature list — it's a set of customers who pay to keep using GEN-PAY and stick around.

**Phase 4 — Solo work becomes team work**
The same freelancer, further along, now has a collaborator or a small team. This phase gives them shared access to a business wallet with permissions — not a new customer, the same one, at their next stage.

---

## Product Screenshots

| Screen | What it shows |
|---|---|
| **Dashboard** | Total balance across wallets, recent activity, quick top-up and transfer. |
| **Wallet** | Wallet balance, wallet-specific history, wallet creation. |
| **Transfer** | Send funds by account number, with confirmation before it completes. |
| **Top Up** | Add funds to a wallet, with available top-up methods. |
| **History** | Full transaction log, filterable by wallet and project. |
| **Profile** | Account details, linked wallets, saved accounts for repeat transfers. |
| **Notifications** | Real-time alerts for incoming and outgoing transactions. |

---

## Tech Stack

**Backend**

| Layer | Choice |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database & Auth | Supabase (PostgreSQL) |
| Caching | Redis |
| Security | Helmet, bcryptjs, JWT |
| Validation | Zod |
| Email | Resend |

**Frontend**

| Layer | Choice |
|---|---|
| Framework | React Native (Expo) |
| Routing | Expo Router |
| Data Fetching | TanStack Query |
| Storage | AsyncStorage, Expo Secure Store |
| UI / Animation | React Native Reanimated, Expo Blur, Expo Image, Expo Symbols |

**Architecture**

```text
React Native App (Expo)
        │
        ▼
REST API — Express.js, secured via x-api-key gateway header
        │
        ▼
Supabase (PostgreSQL) — data, auth
        │
        ├── Redis — caching / session support
        └── Resend — transactional email
```

---

## Project Structure

```text
.
├── Backend/
│   └── genpay-backend/       # Express API, Supabase integration
├── Frontend/
│   └── genvori.pay/          # React Native (Expo) app
├── screenshots/               # Product screenshots used in this README
├── README.md
└── LICENSE
```

---

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- A Supabase project (URL + service role key)
- A Resend account for transactional email

### Backend

```bash
cd Backend/genpay-backend
npm install
```

Create a `.env` file in this directory:

| Variable | Description |
|---|---|
| `PORT` | Port for the server (e.g., `3000`) |
| `FRONTEND_URL` | URL of the deployed frontend |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `JWT_SECRET` | Secret used to sign JWTs |
| `GATEWAY_API_KEY` | API key required in the `x-api-key` header |
| `RESEND_API_KEY` | Resend API key |
| `MAIL_FROM_ADDRESS` | Sender email address |
| `MAIL_FROM_NAME` | Sender display name |

```bash
npm start
```

### Frontend

```bash
cd Frontend/genvori.pay
npm install
npm start
```

Run on a specific platform:

```bash
npm run android   # Android
npm run ios       # iOS
npm run web       # Web
```

---

## Security

GEN-PAY moves money, so security isn't a checklist we bolted on at the end.

- **Every session is verified.** Signed tokens are checked on every wallet and transaction request.
- **Losing your phone doesn't mean losing your wallet.** The app is PIN-locked after login.
- **Only trusted clients can reach the API.** Every backend request is gated behind an API key.
- **Bad input never reaches the database.** Every request is validated before it's processed.
- **Passwords are never stored as plaintext.** They're hashed, always.

This is where we are today, not where we stop. As GEN-PAY starts moving real client payments, this section grows — rate limiting, fraud checks, and audit logging are next.

---

## Live Demo

### Android APK

Download the latest Android demo build here:

https://github.com/NzxCode/Genvori.Pay/releases/latest

---

## Team

**Nicolas Gabriel Kurnadi** — Co-Founder & CPO. Product strategy, UI/UX, business development, infrastructure integration.

**Andicha Fariq Putra Pratama** — Co-Founder & CTO. Fullstack, Mobile, infrastructure Engineer.

---

## About GENVORI

We're starting with one product, for one person, solving one problem — because trying to serve everyone at once is how most fintech ideas die before they ship.

That person is a freelancer whose finances don't fit any existing box. If we get GEN-PAY right for them, we'll know because they keep using it, not because we assumed they would. Everything after that — new products, new users — gets decided by what they teach us, not by what we guess.

---

## Contributing

GEN-PAY is early-stage and under active development.

1. Open an issue before submitting a pull request, so scope and approach can be discussed first.
2. Keep pull requests focused — one fix or feature per PR.
3. Match the existing code style in the relevant directory (`Backend/` or `Frontend/`).

---

## License

Licensed under the MIT License. See [LICENSE](./LICENSE) for details.
