<p align="center">
  <h1 align="center">⚛️ Atomecom</h1>
  <p align="center">
    <strong>Modern E-commerce Platform — Built with Clean Architecture & Studio-grade UI</strong>
  </p>
  <p align="center">
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#getting-started">Getting Started</a>
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/status-🚧%20In%20Development-yellow?style=flat-square" alt="Status" />
    <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License" />
    <img src="https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node" />
    <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js&logoColor=white" alt="Next.js" />
  </p>
</p>

---

> **🚧 This project is actively under development.** Core features are functional but some modules are still being built. Contributions and feedback are welcome!

## ✨ What is Atomecom?

Atomecom is a **full-stack e-commerce platform** designed with enterprise-grade architecture and a premium, studio-inspired admin experience. It's built as a monorepo with shared types between client and server for end-to-end type safety.

## Features

### ✅ Completed

- **Authentication System** — Register, Login, JWT + Refresh Token, Email Verification, Password Reset
- **User Management** — Full CRUD, Role-based Access Control (RBAC)
- **Product Catalog** — Products, SKUs, Brands, Categories with robust REST APIs
- **Inventory Tracking** — Stock management linked to SKUs with Redis caching
- **Admin Dashboard (Frontend)** — Studio-grade Bento Grid layout with Framer Motion animations
- **End-to-end Type Safety** — 100% strict TypeScript types shared between Client and Server using Zod
- **Email System** — Asynchronous notifications using Resend & Handlebars
- **API Documentation** — Well-documented using Swagger/OpenAPI
- **Hardened Security** — 0 Vulnerabilities, 12 Middleware layers (Helmet, CORS, RateLimiter), Strict RBAC.
- **Storefront Landing** — Fully responsive storefront preview

### 🚧 In Progress (Next Steps)

- Cart & Checkout flow
- Order Management System
- Payment Gateway Integration (domestic & international)
- Customer Review module

## Tech Stack

| Layer            | Technologies                                                                                            |
| :--------------- | :------------------------------------------------------------------------------------------------------ |
| **Frontend**     | Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion, shadcn/ui, Zod, React Hook Form, i18next |
| **Backend**      | Node.js, Express, TypeScript, MongoDB (Mongoose), Redis (ioredis), JWT, Resend                          |
| **Shared**       | `@atomecom/shared` — Shared types, enums, schemas, constants                                            |
| **Architecture** | Clean Architecture, Manual DI Container, Event-Driven (EventBus), Compensating Transactions             |

## Architecture

```
atomecom/
├── client/                  # Next.js Frontend
│   ├── src/
│   │   ├── app/             # Pages & Routing
│   │   ├── components/      # UI Components (auth, dashboard, ecommerce, ui)
│   │   ├── hooks/           # Custom React Hooks
│   │   ├── services/        # API Service Layer
│   │   ├── providers/       # Context Providers
│   │   └── locales/         # i18n Translations (en, vi)
│   │
├── server/                  # Express Backend
│   ├── src/
│   │   ├── container.ts     # Manual Dependency Injection
│   │   ├── modules/         # Feature Modules
│   │   │   ├── auth/        # domain/ → use-cases/ → infra/ → presentation/
│   │   │   ├── products/    # Clean Architecture per module
│   │   │   ├── inventory/
│   │   │   ├── users/
│   │   │   ├── emails/
│   │   │   └── ...
│   │   └── shared/          # Core utilities, middlewares, configs
│   │
├── shared/                  # @atomecom/shared package
│   └── src/
│       ├── types/           # Shared TypeScript interfaces
│       ├── enums/           # Shared enums (ProductStatus, UserRole...)
│       └── schemas/         # Shared validation schemas
│
└── package.json             # Monorepo root
```

Each backend module follows **Clean Architecture** with 4 layers:

- `domain/` — Entities & Repository interfaces (zero dependencies)
- `use-cases/` — Business logic & application services
- `infra/` — Database implementations, external adapters
- `presentation/` — Controllers, routes, request/response handling

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB
- Redis

### Installation

```bash
# Clone the repo
git clone https://github.com/SangHynh/atomecom.git
cd atomecom

# Install dependencies
npm install

# Setup environment variables
cp server/.env.example server/.env
cp client/.env.example client/.env.local

# Run development servers
npm run dev          # Starts both client & server
```

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>Built with ❤️ by <a href="https://github.com/SangHynh">SangHynh</a></strong>
</p>
