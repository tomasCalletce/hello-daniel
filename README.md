# ZapSign Campaign: "Haz que Daniel Bilbao sea juez"

A Next.js application for collecting digital signatures through ZapSign integration to support Daniel Bilbao as a judge for the IA Hackathon at Colombia TechFest.

## Features

- **Digital Signature Collection**: Integrated with ZapSign for secure document signing
- **Real-time Counter**: Live tracking of signature count toward 5,000 goal
- **Referral System**: Personal referral links for sharing
- **Mobile Optimized**: Responsive design for mobile-first experience
- **Clean UI**: Minimalist design following GitHub/Vercel aesthetics

## Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS, shadcn/ui
- **Backend**: Next.js API routes, Drizzle ORM
- **Database**: Neon PostgreSQL
- **External API**: ZapSign integration
- **State Management**: TanStack Query

## Setup

### 1. Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@host:5432/database"

# ZapSign Configuration
ZAPSIGN_API_KEY="your_zapsign_api_key"
ZAPSIGN_DOCUMENT_TEMPLATE_ID="your_template_id"
ZAPSIGN_WEBHOOK_URL="https://yourdomain.com/api/zapsign/webhook"
ZAPSIGN_WEBHOOK_SECRET="your_webhook_secret"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Database Setup

```bash
# Install dependencies
npm install

# Generate database schema
npm run db:generate

# Push schema to database
npm run db:push

# Optional: Open Drizzle Studio
npm run db:studio
```

### 3. ZapSign Setup

1. Create a ZapSign account and obtain API credentials
2. Create a document template with minimal required fields
3. Configure the template for public access and mass signing
4. Set up webhook endpoint for signature verification

### 4. Development

```bash
# Start development server
npm run dev
```

## API Endpoints

- `POST /api/sign` - Create new signer record
- `POST /api/create-signer` - Generate ZapSign signer token
- `GET /api/counter` - Get current signature count
- `GET /api/me?ref=[code]` - Get referral information
- `POST /api/zapsign/webhook` - Handle ZapSign webhooks

## Database Schema

### Signers Table
- Personal information (name, email, city, role)
- Verification status and referral tracking
- Unique referral codes for sharing

### Counters Table
- Real-time signature count tracking
- Goal progress monitoring

### Events Table
- Audit trail for signature events
- Analytics data collection

## Deployment

The application is designed to be deployed on Vercel with automatic environment variable configuration and serverless database connectivity.

## Contributing

This is a hackathon project focused on demonstrating ZapSign integration and modern web development practices.