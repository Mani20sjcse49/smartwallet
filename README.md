# AI Smart Wallet

AI Smart Wallet is a futuristic full-stack personal finance platform designed to feel like a living financial co-pilot. It combines predictive budgeting, behavioral spending intelligence, portfolio guidance, and a conversational AI advisor inside a premium, mobile-first dashboard.

## Stack

- Frontend: React, Vite, Framer Motion, Recharts, Lucide
- Backend: Node.js, Express, MongoDB, Mongoose, JWT
- AI layer: OpenAI-ready advisor service with deterministic fallback insights
- UX: dark mode by default, glassmorphism plus neumorphism styling, responsive dashboard

## Features

- Dynamic wallet balance and predicted month-end cash flow
- AI-powered safe daily budget with risk states
- Auto-categorization heuristics and recurring-expense detection
- Predictive alerts and behavioral analytics
- Conversational financial assistant with personality modes
- Daily email report preferences with test-send support
- Investment suggestions based on income, savings, and risk appetite
- Multi-wallet support, custom categories, financial goals, and family-ready shared context
- Voice entry, OCR-ready receipt ingestion hooks, and offline caching

## Project Structure

```text
.
|-- client
|   |-- src
|   |   |-- components
|   |   |-- hooks
|   |   |-- pages
|   |   |-- services
|   |   `-- styles
|-- server
|   |-- src
|   |   |-- config
|   |   |-- controllers
|   |   |-- middleware
|   |   |-- models
|   |   |-- routes
|   |   `-- services
```

## Environment Setup

### 1. Install dependencies

Use `npm.cmd` on Windows PowerShell if execution policy blocks `npm.ps1`.

```powershell
npm.cmd install
```

### 2. Configure backend

Copy [server/.env.example](/C:/Users/Administrator/Downloads/smart%20wallet/server/.env.example) to `server/.env` and fill the values:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/ai-smart-wallet
JWT_SECRET=replace-with-a-long-secret
CLIENT_URL=http://localhost:5173
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=AI Smart Wallet <no-reply@ai-smart-wallet.local>
```

### 3. Configure frontend

Copy [client/.env.example](/C:/Users/Administrator/Downloads/smart%20wallet/client/.env.example) to `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 4. Start development

```powershell
npm.cmd run dev
```

Client runs on `http://localhost:5173` and server runs on `http://localhost:5000`.

## API Overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/wallet/dashboard`
- `POST /api/wallet/reports/test`
- `POST /api/transactions`
- `GET /api/transactions`
- `POST /api/ai/chat`
- `POST /api/ai/can-afford`
- `GET /api/insights`

## Notes

- If OpenAI credentials are not configured, the backend still returns smart deterministic guidance based on wallet data.
- If SMTP credentials are not configured, the test email uses a local JSON transport for development instead of delivering externally.
- Receipt OCR is scaffolded through a backend parsing endpoint contract so you can connect a provider later without redesigning the UI.
- Offline mode currently uses localStorage caching and optimistic transaction updates on the frontend.
