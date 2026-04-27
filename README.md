# Quick Invoice Generator

A production-ready SaaS web app optimized for freelancers (especially in Egypt) to create professional invoices in under 30 seconds.

## Features
- **Ultra-fast Invoice Creation**: Create invoices quickly with a live preview.
- **Local Payments**: Support for InstaPay and Vodafone Cash manual verification flow.
- **PDF Export**: Generate high-quality, print-ready PDFs.
- **Monetization**: Free (5 invoices/month) and Pro (unlimited, custom branding) tiers.
- **Admin Panel**: Manage users, approve manual payments, and generate promo codes.

## Tech Stack
- Next.js 15 (App Router)
- Tailwind CSS & Shadcn UI
- Prisma & PostgreSQL
- NextAuth.js
- UploadThing
- @react-pdf/renderer

## Setup

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Copy `.env.example` to `.env` and fill in the values.**
   ```bash
   cp .env.example .env
   ```

3. **Initialize the database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## Admin Access
To access the admin panel (`/admin`), you need to set your user role to `ADMIN` directly in the database after signing up.
