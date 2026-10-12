# A7-Menu — Frontend

The Angular client for **A7-Menu**, a multi-tenant SaaS platform for digital QR-code restaurant/cafe menus. Cafe owners manage their menu through an authenticated dashboard; customers scan a QR code and view the live bilingual menu instantly, with no app install.

Pairs with the [A7-Menu backend](https://github.com/ashrif2006/qr-menu-saas) (ASP.NET Core 8 + PostgreSQL).

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 18 (Standalone Components) |
| State management | Angular Signals |
| Forms | Reactive Forms |
| Styling | Hand-written CSS with CSS custom properties (design tokens) |
| Icons | Font Awesome 6 |
| HTTP | `HttpClient` + functional interceptors |
| Auth | JWT, stored in `localStorage` |

No NgRx, no Bootstrap — state is handled with Signals and components are styled directly against a shared token system (`src/styles.css`), kept deliberately framework-light for a project this size.

## Architecture

```
Component → Service (Signals-backed) → HttpClient → Backend API
```

- **`core/services`** — one service per resource (`AuthService`, `CategoryService`, `MenuItemService`, `PublicMenuService`...). Each exposes its data as a readonly `Signal` and caches it after the first successful fetch, so navigating between dashboard pages doesn't re-request data that's already loaded.
- **`core/interceptors`** — `authInterceptor` attaches the JWT to every outgoing request; `errorInterceptor` centrally catches `401` responses and redirects to `/login`, so components only need to handle request-specific error messages.
- **`core/guards`** — `authGuard` protects all `/dashboard/*` routes.
- **`features/*`** — one folder per route area (`landing`, `auth`, `dashboard`, `public-menu`), each composed of small, focused standalone components rather than large page components.
- **`shared/components`** — components reused across multiple route areas (navbar, footer).

## Key Features

- **Owner dashboard** — manage categories and menu items (bilingual Arabic/English fields, pricing or per-size price variants, availability toggling, image upload), view a generated QR code, and see a quick stats overview.
- **Public menu page** (`/menu/:slug`) — fully anonymous, bilingual, mobile-first menu view that customers reach by scanning the cafe's QR code. Categories with no items are automatically filtered out so the page never opens on an empty section.
- **Reactive, cached data layer** — each dashboard service loads its resource once per session and keeps it in a `Signal`; create/update/delete calls patch that signal directly from the API response instead of re-fetching the whole list.
- **Centralized auth handling** — token attachment and session-expiry redirects are handled once, in interceptors, not duplicated per component.
- **RTL-first, mobile-first UI** — Arabic is the default layout direction throughout; the dashboard uses a floating bottom tab bar on mobile and an icon rail on larger screens rather than a conventional fixed sidebar.

## Project Structure

```
src/app/
├── core/
│   ├── services/       # API + Signal-backed state per resource
│   ├── interceptors/   # auth + centralized error handling
│   ├── guards/          # route protection
│   └── models/          # TypeScript interfaces matching backend DTOs
├── features/
│   ├── landing/         # marketing page
│   ├── auth/             # login, register
│   ├── dashboard/        # layout, home, categories, menu items, QR code
│   └── public-menu/       # the page customers see after scanning
└── shared/
    └── components/        # navbar, footer
```

## Getting Started

```bash
npm install
ng serve
```

Navigate to `http://localhost:4200/`. The app expects the backend API URL in `src/environments/environment.ts` (`apiUrl`).

## Build

```bash
ng build
```

Build artifacts are output to `dist/`.

---

*Generated with [Angular CLI](https://github.com/angular/angular-cli) 18.2.4.*
