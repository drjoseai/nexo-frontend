# NEXO Frontend v2.0

[![CI](https://github.com/drjoseai/nexo-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/drjoseai/nexo-frontend/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/drjoseai/nexo-frontend/branch/main/graph/badge.svg)](https://codecov.io/gh/drjoseai/nexo-frontend)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)

> Plataforma de Compañía Emocional con IA - Frontend Application

## 🚀 Tech Stack

- **Framework:** Next.js 15.0 (App Router)
- **Language:** TypeScript 5.6
- **Styling:** Tailwind CSS 3.4 + shadcn/ui
- **State Management:** Zustand 5.0
- **Internationalization:** next-intl 3.22
- **Testing:** Jest + React Testing Library + Playwright

## 📊 Project Status

| Metric | Status |
|--------|--------|
| Unit Tests | 514 passing |
| E2E Tests | 18 passing |
| Coverage | ~60% |
| Build | ✅ Passing |

## 🛠️ Getting Started

### Prerequisites

- Node.js 20.x
- npm 10.x

### Installation
```bash
# Clone the repository
git clone https://github.com/drjoseai/nexo-frontend.git
cd nexo-frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run test:e2e     # Run E2E tests with Playwright
```

## 📁 Project Structure
```
frontend/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   ├── (marketing)/       # Public pages
│   └── dashboard/         # Protected dashboard routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── chat/             # Chat interface components
│   ├── profile/          # Profile components
│   ├── settings/         # Settings components
│   └── subscription/     # Subscription components
├── lib/                   # Utilities and configurations
│   ├── api/              # API client
│   ├── store/            # Zustand stores
│   └── utils/            # Helper functions
├── messages/             # i18n translation files
├── e2e/                  # Playwright E2E tests
└── __tests__/            # Jest unit tests
```

## 🧪 Testing

### Unit Tests (Jest)
```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### E2E Tests (Playwright)
```bash
# Run E2E tests
npm run test:e2e

# Run with UI
npx playwright test --ui
```

## 🌐 Internationalization

The app supports multiple languages:
- 🇪🇸 Spanish (default)
- 🇺🇸 English

Translation files are in `/messages/` directory.

## 🔒 Environment Variables

Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📈 Performance

- ⚡ Lazy loading on all dashboard pages
- 📦 Optimized bundle splitting
- 🖼️ Image optimization (AVIF, WebP)
- 🔒 Security headers configured

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'feat: add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ by the NEXO Team
