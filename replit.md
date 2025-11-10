# Ringtone Riches Competition Platform

## Overview

Ringtone Riches is a competition platform offering users various prize draws and instant-win games, including Spin (wheel-based), Scratch (scratch card), and Instant Win competitions. Users can purchase entries using wallet balance, ringtone points, or direct payments. The platform aims to be a full-stack web application with a React frontend, Express backend, and PostgreSQL database, handling user authentication, payment processing, competition management, ticket allocation, and winner selection.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript and Vite.
**Routing**: Wouter library.
**State Management**: TanStack Query for server state.
**UI Components**: Radix UI for accessible primitives, Tailwind CSS for styling with a dark theme and yellow/gold accents.
**Form Handling**: React Hook Form with Zod for validation.
**Account Management**: Unified tabbed interface at `/wallet` consolidates Wallet, Entries, Referral Scheme, and Address (placeholder) sections for streamlined account management.

### Backend Architecture

**Framework**: Express.js with Node.js and TypeScript.
**API Design**: RESTful API, `/api/` prefixed endpoints.
**Authentication**: Custom session-based authentication using `express-session` and PostgreSQL storage. Passwords hashed with bcrypt.
**Authorization**: Role-based access control with an `isAdmin` flag.

### Data Storage

**Database**: PostgreSQL with Drizzle ORM for type-safe queries and schema management.
**Schema Design**: Includes Users, Competitions (Spin, Scratch, Instant), Tickets, Orders, Transactions, Winners, game-specific usage tables (spinUsage, scratchCardUsage), and spinWins table for tracking segment wins and enforcing maxWins limits.
**Migrations**: Drizzle Kit.

### Payment Processing

**Primary Provider**: Cashflows payment gateway for hosted checkout.
**Fallback Provider**: Stripe integration.
**Payment Flows**: Wallet top-up, direct competition entry, ringtone points conversion, and multi-method payments.
**Transaction Recording**: All financial operations are logged.
**Webhook Idempotency**: Cashflows webhook includes order status and existing tickets checks to prevent duplicate processing during payment retries.

### Game Mechanics

**Competition Types**: Spin Wheel, Scratch Card, and Instant Win with server-side result determination and fair prize allocation.
**Play Tracking**: `remainingPlays` track multi-session entries.
**Spin Wheel Implementation**: 
- Canvas-based wheel with smooth rotation animation using requestAnimationFrame for fluid spinning
- Optimized mobile rendering (4x DPR on all devices) for crystal-clear display
- SERVER-SIDE result determination with weighted random selection based on probability and maxWins enforcement
- Single API call per spin (fixed double-consumption bug where parent component was making duplicate API calls)
- Progressive image loading - wheel displays instantly with text, images appear as they load
- Batched state updates prevent image flickering during loading
- Fetches configuration from admin API including segment colors, icons, prizes, probabilities, and win limits
- Includes overlay ring image, center video display, responsive sizing for mobile/desktop, and proper pointer-events handling for reliable button clicks
**Scratch Card Implementation**:
- SERVER-SIDE prize determination using atomic database transactions to prevent race conditions
- Weight-based random selection from `scratchCardImages` table with maxWins enforcement
- Database-level locking (FOR UPDATE) ensures concurrent requests cannot bypass prize limits
- Atomic usage tracking - scratch card consumption, prize selection, and win recording all happen in single transaction
- Only records wins for actual prizes (cash/points/physical), not "try_again" or "lose" results
- Frontend handles scratch animation and reveal, server controls all prize allocation
- Transaction rollback protection ensures cards are never consumed without awarding prizes
**R Prize (Mystery Prize)**: Special admin-configurable segment on the spin wheel with larger icon display. Configured in admin panel at `/api/admin/game-spin-config` with customizable reward type (cash/points), value, probability, and win limits. Server-side enforcement ensures maxWins limits are respected (e.g., max 1 win stops after first payout).

### Admin Panel

Provides comprehensive management for:
- **Dashboard**: Key metrics and recent orders.
- **Competition Management**: Dedicated interfaces for Spin Wheel, Scratch Card, and Instant Win competitions with full CRUD operations and prize configuration.
  - **Display Order Control**: Inline integer input on each competition card allows admins to set display order (lower numbers appear first on landing/featured pages). Defaults to 999 for new competitions. Updates on blur/Enter with proper handling of value 0 using nullish coalescing.
- **User Management**: User details, wallet balances, ringtone points, and order history.
- **Orders Management**: View, filter, and search platform orders.
- **Settings**: Platform configuration.

### Design Patterns

API request abstraction, consistent query key management, custom hooks (`useAuth`), error boundaries, component composition, responsive design (mobile-first), and unified billing component for all purchase types.

### Billing & Checkout System

**Unified Billing Component**: Single reusable component (`unified-billing.tsx`) handles all purchase types (competitions, spins, scratch cards) with consistent UX.
**Enhanced Visual Design**: Professional checkout interface with gradients, icons, security badges, payment breakdowns, and trust signals.
**Multi-Payment Options**: Users can pay using wallet balance, ringtone points, or card payments (Cashflows) in any combination.
**Smart Payment Routing**: Automatically routes to appropriate endpoint based on payment coverage - wallet-only for fully covered purchases, Cashflows for partial/full card payments.
**Mobile-Responsive**: Two-column layout on desktop (payment form + sidebar), single column on mobile.
**Order Flow**: All purchases (competitions, spins, scratches) first create a pending order, then redirect to their respective billing pages (/checkout/:orderId, /spin-billing/:orderId, /scratch-billing/:orderId) for payment processing.

### Third-Party Integrations

**Payment Gateway**: Cashflows API for payments.
**Stripe**: Secondary payment provider.
**Email Service**: Resend API for transactional emails (support@ringtoneriches.co.uk).
**Session Storage**: PostgreSQL-backed session store.
**UI Components**: Radix UI.
**Styling**: Tailwind CSS.

### Email System

**Email Provider**: Resend API integrated in `server/email.ts`.
**Sender Address**: support@ringtoneriches.co.uk
**Email Templates**: Yellow/gold themed HTML emails matching website branding.
**Email Types**:
- **Welcome Emails**: Sent after user registration with platform overview and call-to-action.
- **Order Confirmations**: Sent for all purchase types (competition tickets, spins, scratch cards) including order details, payment breakdown, and purchase date.
**Implementation**: All emails are sent non-blockingly with proper error handling to avoid impacting user experience. Webhook emails protected by idempotency guards to prevent spam during payment retries.

## External Dependencies

- **Cashflows**: Primary payment gateway.
- **Stripe**: Secondary payment provider.
- **PostgreSQL**: Primary database.
- **Neon Database Serverless**: PostgreSQL driver.
- **Radix UI**: UI primitives.
- **TanStack Query**: Server state management.
- **Wouter**: Routing library.
- **React Hook Form**: Form management.
- **Zod**: Schema validation.
- **Tailwind CSS**: Styling framework.
- **Slick Carousel**: Image carousel.
- **Vite**: Build tool.
- **TypeScript**: Language.
- **Drizzle Kit**: Database migration.
- **ESBuild**: Backend bundling.