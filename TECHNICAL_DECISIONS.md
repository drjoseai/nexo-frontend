# 📋 NEXO v2.0 Frontend - Decisiones Técnicas

> Documento de referencia para decisiones arquitectónicas del Sprint Frontend Hardening.
> 
> **Última actualización:** 11 Diciembre 2025
> **Sprint:** Frontend Hardening (Semana 1 completada)
> **Commit:** `9cf1c9b`

---

## 📑 Índice

1. [Stack Tecnológico](#1-stack-tecnológico)
2. [Arquitectura de Autenticación](#2-arquitectura-de-autenticación)
3. [Internacionalización (i18n)](#3-internacionalización-i18n)
4. [Testing Strategy](#4-testing-strategy)
5. [State Management](#5-state-management)
6. [API Client](#6-api-client)
7. [Estructura de Proyecto](#7-estructura-de-proyecto)

---

## 1. Stack Tecnológico

### Decisión
| Tecnología | Versión | Razón |
|:-----------|:--------|:------|
| Next.js | 15.1.0 | App Router, Server Components, estabilidad |
| React | 19.0.0 | Última versión estable |
| TypeScript | 5.x | Type safety, mejor DX |
| Tailwind CSS | 3.x | Utility-first, consistencia de diseño |
| shadcn/ui | Latest | Componentes accesibles, customizables |
| Zustand | Latest | State management simple y performante |
| next-intl | 3.x | i18n nativo para Next.js App Router |
| Jest | Latest | Testing framework maduro |
| Testing Library | Latest | Testing centrado en usuario |

### Contexto
- **Next.js 15.1.0 específicamente:** Versiones posteriores tienen bug con Turbopack que rompe i18n. NO actualizar sin probar.
- **Zustand sobre Redux:** Menos boilerplate, mejor performance, suficiente para nuestra escala.
- **shadcn/ui sobre otras librerías:** No es una dependencia npm, es código copiado que podemos modificar libremente.

### Consecuencias
- ✅ DX excelente con TypeScript
- ✅ Build times rápidos
- ⚠️ Locked a Next.js 15.1.0 hasta que se resuelva bug de Turbopack

---

## 2. Arquitectura de Autenticación

### Decisión: TokenManager como Servicio Separado
```
┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  User Login                                                  │
│      │                                                       │
│      ▼                                                       │
│  auth.ts (API) ──────► Backend /auth/login                  │
│      │                                                       │
│      ▼                                                       │
│  useAuthStore ──────► TokenManager.setTokens()              │
│      │                       │                               │
│      │                       ▼                               │
│      │               localStorage + Cookie                   │
│      │                       │                               │
│      ▼                       ▼                               │
│  User State           Auto-refresh scheduler                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Contexto
**Problema:** Necesitábamos manejar tokens JWT con refresh automático sin crear dependencias circulares entre el API client y el auth store.

**Alternativas consideradas:**
1. ❌ Token management dentro de auth store → Dependencia circular con API client
2. ❌ Token en API client interceptors únicamente → Sin acceso desde otros módulos
3. ✅ TokenManager como servicio singleton separado → Mejor separación de responsabilidades

### Implementación
```typescript
// lib/services/token-manager.ts
class TokenManager {
  // Storage
  getAccessToken(): string | null
  getRefreshToken(): string | null
  setTokens(response: RefreshResponse): void
  clearTokens(): void

  // State
  hasTokens(): boolean
  isExpired(): boolean
  shouldRefresh(): boolean  // True if < 5 min to expiry

  // Actions
  refresh(): Promise<boolean>
  initialize(): void

  // Callbacks
  onLogout(callback: () => void): void
  onRefresh(callback: () => void): void
}
```

### Storage Keys
| Key | Contenido | Propósito |
|:----|:----------|:----------|
| `nexo_token` | Access token | Autenticación API |
| `nexo_refresh_token` | Refresh token | Renovación de sesión |
| `nexo_token_expires_at` | Timestamp (ms) | Control de expiración |
| `nexo_user` | User JSON | Cache de datos de usuario |
| `nexo_access_token` | Cookie | Middleware Next.js |

### Decisiones Específicas

**Auto-refresh 5 minutos antes de expiración:**
- Balance entre seguridad y UX
- Tiempo suficiente para retry en caso de fallo
- Evita interrupciones durante uso activo

**Singleton Promise Pattern:**
- Una sola promesa de refresh activa a la vez
- Evita múltiples requests simultáneos de refresh
- Previene race conditions

**Fetch nativo para refresh (no apiClient):**
- Evita dependencia circular
- Más simple y predecible
- No necesita interceptores para esta operación

### Consecuencias
- ✅ Separación clara de responsabilidades
- ✅ Fácil de testear (27 tests)
- ✅ Reutilizable en otros contextos
- ✅ Sin dependencias circulares
- ⚠️ Requiere coordinación con auth store via callbacks

---

## 3. Internacionalización (i18n)

### Decisión: next-intl con detección automática

### Contexto
**Requisito:** Soporte ES/EN con cambio dinámico sin reload de página.

**Alternativas consideradas:**
1. ❌ react-i18next → Más complejo para App Router
2. ❌ next-translate → Menos mantenido
3. ✅ next-intl → Diseñado para App Router, excelente DX

### Estructura
```
messages/
├── es.json    (~160 strings)
└── en.json    (~160 strings)

i18n/
├── config.ts   # Locales, tipos
└── request.ts  # Detección de locale
```

### Implementación
```typescript
// i18n/config.ts
export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'es';

// Uso en componentes
import { useTranslations } from 'next-intl';

function Dashboard() {
  const t = useTranslations('dashboard');
  return <h1>{t('greeting', { name: user.name })}</h1>;
}
```

### Decisiones Específicas

**Español como default:**
- Target market es LATAM
- Fallback a español si locale no detectado

**Locale en localStorage (no URL):**
- URLs más limpias
- No afecta SEO (app es privada, requiere auth)
- Cambio instantáneo sin navegación

**Estructura plana de mensajes:**
- `dashboard.greeting` en lugar de objetos anidados profundos
- Más fácil de mantener y buscar

### Consecuencias
- ✅ Cambio de idioma instantáneo
- ✅ Type-safe con TypeScript
- ✅ ~160 strings traducidos
- ⚠️ Requiere Next.js 15.1.0 específicamente (bug Turbopack)

---

## 4. Testing Strategy

### Decisión: Jest + Testing Library + Tests por Capa

### Pirámide de Tests
```
        ┌─────────┐
        │   E2E   │  ← Playwright (Semana 2)
        │  (5%)   │
       ─┴─────────┴─
      ┌─────────────┐
      │ Integration │  ← React Testing Library
      │   (25%)     │
     ─┴─────────────┴─
    ┌─────────────────┐
    │   Unit Tests    │  ← Jest
    │     (70%)       │
    └─────────────────┘
```

### Coverage Targets

| Fase | Statements | Branches | Functions | Lines |
|:-----|:----------:|:--------:|:---------:|:-----:|
| Semana 1 | 30% | 20% | 20% | 30% |
| Semana 2 | 50% | 40% | 40% | 50% |
| Final | 70% | 60% | 60% | 70% |

### Estado Actual (Día 5)
- **Tests:** 110 pasando
- **Statements:** 31.32%
- **Branches:** 21.41%
- **Functions:** 21.77%
- **Lines:** 32.63%

### Estructura de Tests
```
__tests__/
├── components/
│   └── ui/
│       └── language-selector.test.tsx  (14 tests)
├── lib/
│   ├── api/
│   │   ├── auth.test.ts                (27 tests)
│   │   └── client.test.ts              (6 tests)
│   ├── services/
│   │   └── token-manager.test.ts       (27 tests)
│   └── store/
│       ├── auth.test.ts                (16 tests)
│       └── chat.test.ts                (20 tests)
```

### Decisiones Específicas

**No testear Radix UI dropdowns en unit tests:**
- Radix usa portals y comportamientos asincrónicos
- Difícil de simular correctamente en JSDOM
- Mejor cubierto por E2E tests

**Mocks centralizados en jest.setup.ts:**
- localStorage, cookies, fetch
- Consistencia entre todos los tests
- Fácil de mantener

**Console filtering en tests:**
- Suprimir warnings/errors esperados
- Logs limpios que solo muestran problemas reales

### Consecuencias
- ✅ Tests rápidos (~1.3s para 110 tests)
- ✅ Alta confianza en lógica de negocio
- ✅ Coverage thresholds cumplidos
- ⚠️ Algunas interacciones UI solo en E2E

---

## 5. State Management

### Decisión: Zustand con Stores Especializados

### Contexto
**Requisito:** Estado global para auth y chat con buena DX.

**Alternativas consideradas:**
1. ❌ Redux Toolkit → Demasiado boilerplate para nuestra escala
2. ❌ Jotai → Demasiado granular
3. ❌ React Context → Performance issues con updates frecuentes
4. ✅ Zustand → Simple, performante, excelente DX

### Stores Implementados
```typescript
// useAuthStore
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login(credentials): Promise<void>;
  register(data): Promise<void>;
  logout(): Promise<void>;
  loadUser(): Promise<void>;
}

// useChatStore
interface ChatState {
  messages: Message[];
  currentAvatar: Avatar | null;
  isLoading: boolean;
  error: string | null;
  messagesRemaining: number;
  
  sendMessage(content): Promise<void>;
  loadHistory(avatarId, limit?): Promise<void>;
  setCurrentAvatar(avatar): void;
}
```

### Decisiones Específicas

**Stores separados (no monolítico):**
- Mejor separación de responsabilidades
- Permite selective re-renders
- Más fácil de testear

**Actions dentro del store:**
- Colocación junto al estado que modifican
- Reduce boilerplate vs dispatch/reducers

**Integración con TokenManager via callbacks:**
- Auth store escucha eventos de TokenManager
- Evita polling o suscripciones complejas

### Consecuencias
- ✅ Código limpio y mantenible
- ✅ Performance excelente
- ✅ Fácil de testear (36 tests entre ambos stores)
- ✅ DevTools disponibles

---

## 6. API Client

### Decisión: Axios con Interceptores

### Contexto
**Requisito:** Cliente HTTP con manejo automático de auth headers y errores.

### Implementación
```typescript
// lib/api/client.ts
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Agrega token
apiClient.interceptors.request.use((config) => {
  const token = tokenManager.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Maneja errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      tokenManager.clearTokens();
    }
    return Promise.reject(error);
  }
);
```

### Decisiones Específicas

**Backend usa OAuth2PasswordRequestForm:**
- Login requiere `Content-Type: application/x-www-form-urlencoded`
- Campo `username` en lugar de `email`
- Documentado en `lib/api/auth.ts`

**Timeout de 10 segundos:**
- Balance entre UX y tolerancia a latencia
- Suficiente para operaciones de chat

### Consecuencias
- ✅ Auth automática en todas las requests
- ✅ Manejo centralizado de errores
- ✅ Compatible con backend existente
- ⚠️ TokenManager debe estar disponible antes de requests

---

## 7. Estructura de Proyecto

### Decisión: Feature-based con separación de capas
```
frontend/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth layout group
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/         # Dashboard layout group
│   │   ├── chat/[avatarId]/
│   │   ├── profile/
│   │   ├── settings/
│   │   └── subscription/
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing redirect
├── components/
│   ├── avatars/           # Avatar-specific components
│   ├── chat/              # Chat-specific components
│   ├── layout/            # Layout components (Sidebar)
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── api/               # API functions by domain
│   │   ├── auth.ts
│   │   ├── avatars.ts
│   │   ├── chat.ts
│   │   └── client.ts
│   ├── services/          # Business logic services
│   │   └── token-manager.ts
│   └── store/             # Zustand stores
│       ├── auth.ts
│       └── chat.ts
├── types/                 # TypeScript definitions
├── messages/              # i18n translations
├── i18n/                  # i18n config
└── __tests__/             # Tests mirror src structure
```

### Decisiones Específicas

**Route Groups `(auth)` y `dashboard`:**
- Layouts diferentes sin afectar URL
- Auth pages sin sidebar
- Dashboard pages con sidebar

**`lib/` para lógica de negocio:**
- Separado de componentes UI
- Fácil de testear
- Reutilizable

**`__tests__/` separado (no colocado):**
- Estructura clara
- No mezcla tests con código de producción
- Fácil de excluir en builds

### Consecuencias
- ✅ Navegación intuitiva
- ✅ Separación clara de responsabilidades
- ✅ Escalable para nuevas features
- ✅ Fácil onboarding de nuevos devs

---

## 📚 Referencias

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Zustand GitHub](https://github.com/pmndrs/zustand)
- [Testing Library Docs](https://testing-library.com/docs/)
- [shadcn/ui](https://ui.shadcn.com/)

---

## 🔄 Historial de Cambios

| Fecha | Cambio | Autor |
|:------|:-------|:------|
| 2025-12-11 | Documento inicial con decisiones Semana 1 | Claude (MAAD) |

---

## MSW (Mock Service Worker) - Decisión Diferida

### Contexto
Se intentó configurar MSW 2.x para tests de integración (Día 5).

### Problema Encontrado
MSW 2.x + Jest + JSDOM tienen incompatibilidades conocidas:
- Conflictos de polyfills (TextEncoder, streams, fetch)
- Error: "Cannot redefine property: Request"
- Tiempo invertido: ~45 min sin resolución

### Decisión
**Diferir MSW a E2E con Playwright (Día 9)**

### Justificación
1. Los 110 tests actuales con mocks manuales de Jest funcionan correctamente
2. MSW funciona sin problemas en Playwright (browser real)
3. ROI: El tiempo de debugging > beneficio para MVP
4. Principio aplicado: "Fail fast, learn, move on"

### Plan Futuro
- Día 9: Configurar Playwright para E2E
- MSW se integrará ahí sin conflictos JSDOM
- Los mocks manuales de Jest permanecen para unit tests

### Referencias
- [MSW + Jest issues](https://github.com/mswjs/msw/issues)
- [MSW recomienda Vitest o Playwright](https://mswjs.io/docs/migrations/1.x-to-2.x)

---

*"No hay atajos en la excelencia"*
