# Tera Finance Mini Apps

A standalone mini app for Tera Finance (TrustBridge) that provides cross-border payment features without requiring the WhatsApp bot. Built with Next.js 15, TypeScript, and Cardano blockchain integration.

## Features

- 🔐 **Phone Number Authentication** - Login with WhatsApp number
- 💸 **Money Transfers** - Send money globally with low fees
- 📊 **Transaction History** - View all your transfers
- 👛 **Wallet Integration** - Connect Cardano wallets (Eternl, Nami)
- 📱 **Mobile-First Design** - Responsive and optimized for mobile
- 🌐 **Telegram Mini App** - Can be embedded in Telegram
- 🎨 **Dark Mode** - Support for light and dark themes

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Blockchain**: Cardano (via MeshSDK)
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Telegram**: @twa-dev/sdk

## Prerequisites

Before you begin, ensure you have installed:

- **Node.js** v18+ ([Download](https://nodejs.org))
- **npm** or **yarn** package manager
- **Git** ([Download](https://git-scm.com))

## Getting Started

### 1. Clone the Repository

```bash
cd /home/fabian/Code/web3/Tera-Finance/Tera-MiniApps
# Or navigate to your project directory
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 15
- React 18
- Tailwind CSS
- MeshSDK (Cardano integration)
- Radix UI components
- And more...

### 3. Configure Environment Variables

The `.env.local` file is already created with default values:

```env
NEXT_PUBLIC_BACKEND_API_URL=https://api-trustbridge.izcy.tech
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

**For production**, update these values:
```bash
cp .env.local .env.production
# Edit .env.production with your production URLs
```

### 4. Run the Development Server

```bash
npm run dev
```

The app will start at **http://localhost:3000**

### 5. Open in Browser

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 3000) |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Project Structure

```
Tera-MiniApps/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Home page (dashboard)
│   ├── login/               # Login page
│   ├── history/             # Transaction history
│   ├── transfer/            # Send money flow
│   └── wallet/              # Wallet management
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── auth/                # Auth-related components
│   └── transfer/            # Transfer-related components
├── contexts/
│   └── AuthContext.tsx      # Authentication state
├── lib/
│   ├── api/                 # API service clients
│   │   ├── apiClient.ts     # HTTP client with auth
│   │   ├── authService.ts   # Authentication
│   │   ├── transferService.ts
│   │   └── exchangeService.ts
│   ├── config.ts            # API endpoints & constants
│   ├── types.ts             # TypeScript types
│   └── utils.ts             # Utility functions
└── public/                  # Static assets
```

## How It Works

### 1. Authentication Flow

1. User enters WhatsApp number on `/login`
2. Backend validates and returns JWT tokens
3. Tokens stored in localStorage
4. Auto-refresh on token expiry

```typescript
// Example login
const { login } = useAuth();
await login("+628123456789", "+62");
```

### 2. Making Transfers

1. Navigate to `/transfer`
2. Select currencies and enter amount
3. API calculates fees and exchange rate
4. Confirm payment (Wallet or Card)
5. Track status in real-time

```typescript
// Example transfer calculation
const result = await transferService.calculateTransfer(
  "WALLET",
  "mockADA",
  100,
  "IDR"
);
```

### 3. Viewing History

1. Navigate to `/history`
2. Fetch transaction history from API
3. Filter and search transactions
4. Download invoices

```typescript
// Example get history
const history = await transferService.getTransferHistory(10, 0);
```

## API Integration

The app connects to the Tera Finance backend API:

**Base URL**: `https://api-trustbridge.izcy.tech`

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Login with phone number |
| `/api/transfer/calculate` | POST | Calculate transfer fees |
| `/api/transfer/initiate` | POST | Start new transfer |
| `/api/transfer/status/:id` | GET | Check transfer status |
| `/api/transactions/history` | GET | Get transaction history |
| `/api/exchange/rate` | GET | Get exchange rates |

See `lib/config.ts` for all available endpoints.

## Supported Currencies

### Crypto (WALLET payment)
- mockADA (Cardano)
- mockUSDC (USD Coin)
- mockEUROC (Euro Coin)
- mockIDRX (Indonesian Rupiah)
- mockJPYC (Japanese Yen)
- mockMXNT (Mexican Peso)
- mockCNHT (Chinese Yuan)

### Fiat (MASTERCARD payment)
- USD, EUR, GBP, IDR, JPY, CNY, MXN, PHP, INR, THB, SGD, MYR, AUD, CAD, BND

## Authentication

The app uses JWT token-based authentication:

- **Access Token**: Stored in localStorage, expires in 15 minutes
- **Refresh Token**: Stored in localStorage, expires in 7 days
- **Auto-Refresh**: Automatically refreshes access token when expired

## Testing Locally

### Test Login
1. Go to http://localhost:3000/login
2. Select country code (e.g., `+62` for Indonesia)
3. Enter WhatsApp number (e.g., `8123456789`)
4. Click **Login**

### Test Navigation
- Home: http://localhost:3000
- History: http://localhost:3000/history
- Transfer: http://localhost:3000/transfer
- Wallet: http://localhost:3000/wallet

## Building for Production

### 1. Build the app

```bash
npm run build
```

This creates an optimized production build in `.next/`

### 2. Test production build

```bash
npm start
```

### 3. Deploy to Farcaster

For detailed instructions on deploying your Mini App to Farcaster, see:

**[FARCASTER_DEPLOYMENT.md](./FARCASTER_DEPLOYMENT.md)**

This guide covers:
- Creating required assets (icons, screenshots)
- Setting up the Farcaster manifest
- Deploying to Vercel
- Verifying domain ownership
- Testing in Farcaster

#### Quick Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Deploy to other platforms:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **Railway**
- **Custom VPS**

## Telegram Mini App Integration

To run as a Telegram Mini App:

### 1. Create Bot with BotFather

```
/newbot
Name: Tera Finance
Username: terafinance_bot
```

### 2. Set Web App URL

```
/newapp
Select your bot
Web App URL: https://your-domain.vercel.app
```

### 3. Enable Telegram SDK

The `@twa-dev/sdk` is already installed. Telegram features will auto-detect when running inside Telegram.

## Troubleshooting

### Port already in use

```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
PORT=3001 npm run dev
```

### Module not found errors

```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

### Environment variables not loading

```bash
# Restart dev server after changing .env.local
npm run dev
```

### API connection issues

- Check backend is running at `https://api-trustbridge.izcy.tech`
- Verify CORS is enabled on backend
- Check browser console for errors

## Development Status

### ✅ Completed
- [x] Project setup with Next.js 15
- [x] TypeScript configuration
- [x] Tailwind CSS + shadcn/ui
- [x] API client with JWT auth
- [x] Auth service and context
- [x] Transfer & exchange services
- [x] Login page
- [x] Home dashboard

### 🚧 In Progress
- [ ] Transaction history page
- [ ] Transfer flow (calculator → form → payment)
- [ ] Wallet integration (MeshSDK)
- [ ] Telegram Mini App features
- [ ] Dark mode toggle
- [ ] PWA configuration

### 📋 Planned
- [ ] Real-time status polling
- [ ] Invoice download
- [ ] Multi-language support (i18n)
- [ ] Analytics dashboard
- [ ] Push notifications

## Contributing

This is a private project. For any issues or suggestions, contact the development team.

## License

Proprietary - © 2025 Tera Finance

## Support

- **Documentation**: [TrustBridge Docs](https://docs.trustbridge.io)
- **Email**: support@trustbridge.io
- **WhatsApp**: Contact via main app

---

**Built with ❤️ by the Tera Finance Team**
