# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Farmasi is a complete personal loan management application for a lending company. It manages clients, loans, payments, interest rates, guarantees, and contracts. The system helps track loan disbursements, payment schedules, and guarantees for 6-week loan cycles.

**Current Status:** ✅ FULLY IMPLEMENTED - All core features are complete and functional.

## Development Commands

- **Development server**: `npm run dev` (uses Turbopack)
- **Build**: `npm run build` (uses Turbopack)
- **Production server**: `npm start`
- **Linting**: `npm run lint` (uses Biome)
- **Formatting**: `npm run format` (uses Biome with --write)
- **Database**: `npm run db:generate`, `npm run db:push`, `npm run db:migrate`, `npm run db:studio`, `npm run db:seed`

## Technology Stack

- **Framework**: Next.js 15.5.2 with App Router
- **React**: v19.1.0
- **TypeScript**: v5 with strict mode enabled
- **Styling**: Tailwind CSS v4 with Shadcn UI components (New York style)
- **Code Quality**: Biome (replaces ESLint + Prettier)
- **Database**: PostgreSQL with Prisma (planned)
- **Authentication**: Auth.js with credentials provider (planned)
- **UI Components**: Shadcn UI with Lucide React icons
- **Email Service**: Brevo for email sending (planned)
- **Themes**: next-themes for dark/light mode support (planned)

## Project Structure

- `src/app/` - Next.js App Router pages and layouts
- `src/lib/` - Utility functions (includes Tailwind merge utility)
- `@/components` - Reusable UI components (alias configured)
- `@/components/ui` - Shadcn UI components (alias configured)
- `@/lib` - Libraries and utilities (alias configured)
- `@/hooks` - Custom React hooks (alias configured)

## Architecture Guidelines

- **No Server Actions**: Use API routes instead of Next.js server actions
- **Component Strategy**: Use React Server Components for data fetching with direct Prisma queries where possible; use Client Components only for interactivity
- **File Organization**: Follow Next.js App Router conventions with TypeScript
- **Import Aliases**: Use `@/*` for src imports (configured in tsconfig.json)

## Business Domain

### Core Entities
- **Clients**: Personal information, contact details, documents
- **Loans**: Fixed amounts with 6-week payment cycles
- **Interest Rates**: Predefined loan amounts with corresponding weekly payments
- **Payments**: Track loan payments and balances
- **Guarantees**: Collateral items (vehicles, property, etc.) with photos
- **Contracts**: Legal agreements linking clients, loans, and guarantees

### Loan System
- Fixed 6-week payment cycles
- Predefined loan amounts and payments (500-1500 soles range)
- Clients can pay early to complete loans ahead of schedule
- All loans require guarantees/collateral

### UI Requirements
- Collapsible sidebar navigation
- Breadcrumb navigation on all pages
- Table features: pagination, search, sorting, filtering
- Dark/light theme support
- Responsive design with animations and transitions
- Document upload for client ID verification
- PDF contract generation and email sending

## Code Standards

- **Formatting**: 2-space indentation, Biome configuration in biome.json
- **TypeScript**: Strict mode enabled, target ES2017
- **Linting**: Biome with Next.js and React recommended rules
- **Import Organization**: Automatic import organization enabled via Biome
- **CSS**: Tailwind CSS variables with neutral base color