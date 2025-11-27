# KidTunes - Children's Music Player

A safe music streaming app for children, managed by parents. Built with React, TypeScript, Tailwind CSS, DaisyUI, and deployed to Cloudflare Pages.

## Features

- **Google OAuth Authentication** - Sign in with Google to access YouTube Music
- **Parent/Child Device Types** - Choose device role during setup
- **QR Code Pairing** - Easy device linking via QR codes
- **Music Whitelist** - Parents curate approved artists, tracks, and playlists
- **Child Playlists** - Children create playlists from approved content
- **Parent Dashboard** - View and manage children's music activity

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, DaisyUI v5
- **State Management**: Zustand
- **Backend**: Cloudflare Pages Functions
- **Database**: Cloudflare D1 (SQLite)
- **CI/CD**: GitHub Actions
- **Hosting**: Cloudflare Pages

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Cloudflare account
- Google Cloud Console project with OAuth credentials

### Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Configure your `.env` file with:
   - `GOOGLE_CLIENT_ID` - From Google Cloud Console
   - `GOOGLE_CLIENT_SECRET` - From Google Cloud Console
   - `JWT_SECRET` - Random secret key

5. Create D1 database:
   ```bash
   npm run db:create
   npm run db:migrate
   ```

6. Start development server:
   ```bash
   npm run dev
   ```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable YouTube Data API v3
4. Configure OAuth consent screen
5. Create OAuth 2.0 credentials
6. Add authorized redirect URIs:
   - Development: `http://localhost:5173/api/auth/callback`
   - Production: `https://your-domain.pages.dev/api/auth/callback`

### Cloudflare Setup

1. Create a Cloudflare Pages project
2. Create a D1 database:
   ```bash
   npm run db:create
   ```
3. Update `wrangler.toml` with your database ID
4. Add secrets in Cloudflare dashboard:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `JWT_SECRET`

### Deployment

Push to main branch to trigger automatic deployment via GitHub Actions.

Manual deployment:
```bash
npm run pages:deploy
```

## Project Structure

```
├── src/
│   ├── api/          # API client
│   ├── components/   # Reusable UI components
│   ├── hooks/        # Custom React hooks
│   ├── pages/        # Page components
│   │   ├── parent/   # Parent-specific pages
│   │   └── child/    # Child-specific pages
│   ├── store/        # Zustand state stores
│   ├── types/        # TypeScript types
│   └── utils/        # Utility functions
├── functions/        # Cloudflare Pages Functions (API)
│   └── api/
│       ├── auth/     # Authentication endpoints
│       ├── device/   # Device management
│       ├── pairing/  # Device pairing
│       ├── whitelist/# Music whitelist
│       ├── music/    # Music search
│       └── playlists/# Playlist management
├── public/           # Static assets
└── schema.sql        # D1 database schema
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- `npm run pages:dev` - Run with Cloudflare Pages locally
- `npm run pages:deploy` - Deploy to Cloudflare Pages
- `npm run db:create` - Create D1 database
- `npm run db:migrate` - Run database migrations locally
- `npm run db:migrate:remote` - Run migrations on production

## License

MIT
