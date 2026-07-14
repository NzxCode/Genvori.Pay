# Genvori.Pay

Genvori.Pay is a comprehensive payment and wallet management application. It provides users with a system to manage digital wallets, track projects, and handle payments securely.

## 🚀 Features

- **Wallet Management**: Create, list, and manage multiple digital wallets.
- **Project Tracking**: Manage projects associated with payments or budgets.
- **Secure Authentication**: 
  - JWT-based session management.
  - PIN-based login and setup for mobile security.
  - API Gateway security using `x-api-key`.
- **Notifications & History**: Detailed transaction history and user notifications.
- **Location Services**: Integration of location-based features.

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database & Auth**: Supabase (PostgreSQL)
- **Email**: Resend
- **Caching**: Redis
- **Security**: Helmet, bcryptjs, JWT
- **Validation**: Zod

### Frontend
- **Framework**: React Native with Expo
- **Routing**: Expo Router
- **Data Fetching**: TanStack Query (React Query)
- **Storage**: AsyncStorage, Expo Secure Store
- **UI/Animations**: React Native Reanimated, Expo Blur, Expo Image, Expo Symbols

## ⚙️ Getting Started

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd Backend/genpay-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of the backend folder and add the following variables:
   - `PORT`: Port for the server (e.g., 3000)
   - `FRONTEND_URL`: URL of the deployed frontend
   - `SUPABASE_URL`: Supabase project URL
   - `SUPABASE_SERVICE_KEY`: Supabase service role key
   - `JWT_SECRET`: Secret for JWT signing
   - `GATEWAY_API_KEY`: API key for `x-api-key` header
   - `RESEND_API_KEY`: Resend API key
   - `MAIL_FROM_ADDRESS`: Sender email address
   - `MAIL_FROM_NAME`: Sender display name
4. Run the server:
   ```bash
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd Frontend/genvori.pay
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Run on your preferred platform:
   - **Android**: `npm run android`
   - **iOS**: `npm run ios`
   - **Web**: `npm run web`

## 📄 License
This project is licensed under the terms specified in the `LICENSE` file.
