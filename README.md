# Earn & Thrive

Create a modern, responsive Micro-Task / Reward (GPT) Web Application with a complete backend to integrate the TimeWall Offerwall.

### Tech Stack & Architecture:

- Frontend: HTML5, Tailwind CSS, Vanilla JavaScript (or React / Next.js)

- Backend & Database: Supabase / Firebase / Node.js (Express) with REST API

- Authentication: Email/Password & Google OAuth

### Key Features to Implement:

1. User Authentication & Profile:

   - Secure sign-up/login flow.

   - Assign each user a unique alphanumeric `userID` (UUID).

   - User profile displaying total points earned, current balance, and withdrawal history.

2. TimeWall Offerwall Integration:

   - Dedicated "Earn" page with an embedded iframe for TimeWall.

   - Construct the TimeWall dynamic URL passing the logged-in user's unique `{userID}`.

   - Clean UI showing instructions on how to complete tasks and earn coins/points.

3. TimeWall Postback Webhook API (Critical Backend):

   - Create a secure GET webhook endpoint (e.g., `/api/postback/timewall`).

   - Query Parameters to receive: `userID`, `transactionID`, `revenue`, `currencyAmount`, `hash`, `type`, `withdrawid`.

   - Security Validation:

     * Check request IP against TimeWall allowed IPs (18.156.132.55, 51.81.120.73, 142.111.248.18).

     * Verify SHA256 security hash: `sha256(userID + revenue + SECRET_KEY)`. Do not reformat or round the revenue string.

   - Transaction Handling:

     * Prevent double-crediting by checking if `transactionID` already exists.

     * If `type === 'credit'`: Add `currencyAmount` to the user's wallet balance and record the transaction.

     * If `type === 'chargeback'`: Deduct `currencyAmount` from the user's balance and mark the record as chargeback.

     * Ignore/log `hold` or `hold_cancelled` without crediting.

     * Return HTTP `200 OK` on successful handling.

4. Wallet & Withdrawal System:

   - Display real-time point balance.

   - Withdrawal request form supporting UPI, Paytm, and Google Play Redeem Codes.

   - Minimum payout threshold validation and deduction upon request.

5. Database Schema:

   - `users` (id, email, points_balance, created_at)

   - `transactions` (id, user_id, transaction_id, offer_type, amount_usd, points_credited, status, created_at)

   - `withdrawals` (id, user_id, payout_method, payout_details, points_deducted, status, created_at)

Provide clean, modular code, database migrations/SQL queries, and step-by-step instructions to test the postback locally.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2bbb3749-fdf2-49fe-81d4-741bc6560cf8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
