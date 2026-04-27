## 1. Architecture Design
```mermaid
graph TD
    subgraph "Frontend (Next.js App Router)"
        A["Pages (Landing, Dashboard, Admin)"]
        B["Components (ShadCN UI)"]
        C["State Management (React Context / Zustand)"]
    end
    subgraph "Backend (Next.js API Routes)"
        D["Auth (NextAuth / Clerk)"]
        E["API Endpoints (Invoices, Payments, Admin)"]
        F["PDF Generation Service"]
    end
    subgraph "Data & Storage"
        G["PostgreSQL (Prisma ORM)"]
        H["AWS S3 / UploadThing"]
    end
    subgraph "External Services"
        I["PayPal API"]
    end

    A <--> E
    B <--> C
    E <--> D
    E <--> G
    E <--> H
    E <--> I
    E --> F
```

## 2. Technology Description
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS + ShadCN UI
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js (or Clerk)
- **File Storage**: UploadThing (for logos and payment screenshots)
- **PDF Generation**: Puppeteer / Playwright via serverless function, or a specialized library like `@react-pdf/renderer` for server-side PDF generation.
- **Payments**: PayPal SDK + Custom Manual Verification Flow

## 3. Route Definitions
| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/login`, `/register` | Authentication pages |
| `/dashboard` | Main user dashboard (list invoices) |
| `/dashboard/invoice/new` | Create new invoice |
| `/dashboard/invoice/[id]` | Edit existing invoice |
| `/dashboard/settings` | Branding, profile, billing, promo code redemption |
| `/dashboard/checkout` | Payment method selection and screenshot upload |
| `/admin` | Admin dashboard overview |
| `/admin/payments` | Manual payment approval queue |
| `/admin/promo-codes` | Promo code management |

## 4. API Definitions
- `POST /api/invoices`: Create a new invoice
- `GET /api/invoices`: List user's invoices
- `PUT /api/invoices/[id]`: Update invoice
- `DELETE /api/invoices/[id]`: Delete invoice
- `GET /api/invoices/[id]/pdf`: Generate and return PDF buffer
- `POST /api/payments/manual`: Submit InstaPay/Vodafone Cash screenshot
- `POST /api/payments/paypal/capture`: Capture PayPal order
- `POST /api/admin/payments/[id]/approve`: Approve manual payment
- `POST /api/promo/redeem`: Validate and apply promo code

## 5. Server Architecture Diagram
```mermaid
graph TD
    A["API Route (Next.js)"] --> B["Controller/Handler"]
    B --> C["Service (Business Logic)"]
    C --> D["Prisma Client"]
    D --> E["PostgreSQL Database"]
    C --> F["UploadThing/S3"]
    C --> G["PDF Generator"]
```

## 6. Data Model
### 6.1 Data Model Definition
```mermaid
erDiagram
    User ||--o{ Invoice : creates
    User ||--o{ Payment : makes
    User {
        string id
        string email
        string name
        string plan "FREE | PRO | LIFETIME"
        dateTime planExpiresAt
        string brandLogoUrl
        string brandColor
    }
    Invoice {
        string id
        string userId
        string invoiceNumber
        string clientName
        string clientEmail
        dateTime issueDate
        dateTime dueDate
        string currency
        float subtotal
        float tax
        float total
        string notes
        json items
    }
    Payment {
        string id
        string userId
        string method "PAYPAL | INSTAPAY | VODAFONE"
        float amount
        string status "PENDING | APPROVED | REJECTED"
        string screenshotUrl
        dateTime createdAt
    }
    PromoCode {
        string id
        string code
        string type "TRIAL | PRO"
        int maxUses
        int currentUses
        dateTime expiresAt
    }
```
