# Arisa Nutrition — Backend API

> Production-ready dietician website backend built with **Next.js 15 App Router**, **MongoDB Atlas**, **TypeScript**, and **Clean Architecture**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Database | MongoDB Atlas + Mongoose 8 |
| Auth | JWT (`jose`) + bcryptjs + HTTP-Only Cookies |
| Validation | Zod |
| File Upload | Cloudinary |
| Email | Resend |
| Deployment | Vercel |

---

## Project Structure

```
arisa-nutrition-backend/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   └── me/route.ts
│   │   ├── blogs/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── reviews/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── gallery/
│   │   │   ├── route.ts
│   │   │   ├── [id]/route.ts
│   │   │   ├── categories/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       ├── status/route.ts
│   │   │   │       └── images/route.ts
│   │   │   └── images/
│   │   │       └── [id]/route.ts
│   │   ├── contact/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── upload/route.ts
│   │   └── dashboard/route.ts
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── db.ts           # MongoDB connection (cached)
│   ├── jwt.ts          # JWT sign / verify (jose)
│   ├── auth.ts         # Server-side auth helpers
│   ├── cloudinary.ts   # Cloudinary upload helpers
│   ├── gallery.ts      # Gallery category service helpers
│   └── resend.ts       # Email template + send helper
├── middleware/
│   └── withAuth.ts     # HOF route auth wrapper
├── middleware.ts        # Next.js edge middleware (JWT guard)
├── models/
│   ├── Admin.ts
│   ├── Blog.ts
│   ├── Review.ts
│   ├── Gallery.ts
│   ├── GalleryCategory.ts
│   ├── GalleryImage.ts
│   └── Contact.ts
├── types/
│   └── index.ts
├── utils/
│   ├── response.ts     # Standardised API response helpers
│   └── rateLimit.ts    # In-memory rate limiter
├── validations/
│   ├── auth.ts
│   ├── blog.ts
│   ├── review.ts
│   ├── gallery.ts
│   ├── galleryCategory.ts
│   └── contact.ts
├── .env.example
├── .env.local          # ← fill this in (never commit)
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## Prerequisites

- **Node.js** ≥ 20
- **npm** ≥ 10 (or pnpm / yarn)
- A **MongoDB Atlas** cluster
- A **Cloudinary** account
- A **Resend** account

---

## Installation

```bash
# 1. Clone / navigate into the project
cd "Arisa Nutrition Backend"

# 2. Install dependencies
npm install

# 3. Copy the environment template and fill in your values
cp .env.example .env.local

# 4. Start the development server
npm run dev
```

The API will be available at `http://localhost:3000`.

---

## Required npm Packages

```bash
# Production
npm install next@15.3.3 react@^19 react-dom@^19 \
  mongoose bcryptjs jose zod cloudinary resend slugify

# Dev
npm install -D typescript @types/node @types/react @types/react-dom \
  @types/bcryptjs eslint eslint-config-next
```

---

## Environment Variables

Copy `.env.example` → `.env.local` and fill in each value:

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Random string ≥ 32 chars for signing JWTs |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `RESEND_API_KEY` | Resend API key (`re_...`) |
| `ADMIN_EMAIL` | Email address to receive contact notifications |
| `NEXT_PUBLIC_APP_URL` | Public URL of the app (e.g. `https://yourdomain.com`) |

---

## Creating the First Admin User (MongoDB Atlas)

There is **no signup API** by design. Admin users are inserted manually.

### Step-by-step

1. Open **MongoDB Atlas → Collections → arisa-nutrition → admins**
2. Click **Insert Document**
3. Paste the following (replace the hash with your own bcrypt hash):

```json
{
  "email": "admin@arisanutrition.com",
  "password": "$2b$12$REPLACE_WITH_BCRYPT_HASH",
  "createdAt": { "$date": "2025-01-01T00:00:00Z" },
  "updatedAt": { "$date": "2025-01-01T00:00:00Z" }
}
```

### Generating a bcrypt hash

Run this in any Node.js REPL or a quick script:

```js
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('YourSecurePassword123!', 12);
console.log(hash); // paste this as the password field
```

Or use the online generator at https://bcrypt-generator.com (cost factor = 12).

---

## Running & Building

```bash
npm run dev       # development (hot reload)
npm run build     # production build
npm run start     # start production server
npm run type-check # TypeScript check without emit
npm run lint      # ESLint
```

---

## API Overview

See [docs/API.md](docs/API.md) for the full reference.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | ❌ | Admin login |
| POST | `/api/auth/logout` | ❌ | Clear auth cookie |
| GET | `/api/auth/me` | ✅ | Get current admin |
| GET | `/api/blogs` | ❌ | List published blogs |
| GET | `/api/blogs/:id` | ❌ | Single blog (by ID or slug) |
| POST | `/api/blogs` | ✅ | Create blog |
| PUT | `/api/blogs/:id` | ✅ | Update blog |
| DELETE | `/api/blogs/:id` | ✅ | Delete blog |
| GET | `/api/reviews` | ❌ | List approved reviews |
| POST | `/api/reviews` | ✅ | Create review |
| PUT | `/api/reviews/:id` | ✅ | Update review |
| DELETE | `/api/reviews/:id` | ✅ | Delete review |
| GET | `/api/gallery` | ❌ | List gallery items |
| POST | `/api/gallery` | ✅ | Add gallery item |
| PUT | `/api/gallery/:id` | ✅ | Update gallery item |
| DELETE | `/api/gallery/:id` | ✅ | Delete gallery item |
| GET | `/api/gallery/categories` | ❌ | List active categories (admins see all) |
| GET | `/api/gallery/categories/:id` | ❌ | Single category (+ `?include_images=true`) |
| POST | `/api/gallery/categories` | ✅ | Create category (auto-slug) |
| PUT | `/api/gallery/categories/:id` | ✅ | Update category |
| PATCH | `/api/gallery/categories/:id/status` | ✅ | Enable/disable category |
| DELETE | `/api/gallery/categories/:id` | ✅ | Delete category (cascade) |
| GET | `/api/gallery/categories/:id/images` | ❌ | List category images |
| POST | `/api/gallery/categories/:id/images` | ✅ | Multi-image upload to category |
| PATCH | `/api/gallery/images/:id` | ✅ | Update image title/description |
| DELETE | `/api/gallery/images/:id` | ✅ | Delete single image |
| POST | `/api/contact` | ❌ | Submit contact form |
| GET | `/api/contact` | ✅ | List contact submissions |
| PATCH | `/api/contact/:id` | ✅ | Update contact status |
| DELETE | `/api/contact/:id` | ✅ | Delete contact submission |
| POST | `/api/upload` | ✅ | Upload image to Cloudinary |
| GET | `/api/dashboard` | ✅ | Admin dashboard stats |

---

## Security Features

- Passwords hashed with **bcrypt** (salt rounds = 12)
- JWT stored in **HTTP-Only, SameSite=Lax** cookie (Secure in production)
- JWT expiration: **7 days**
- **Rate limiting** on login: 5 attempts / 15 min per IP
- **Zod validation** on every request body (prevents NoSQL injection via type coercion)
- **ObjectId validation** before all database lookups by ID
- HTML escaped email templates (XSS safe)
- Security headers on all API routes (`X-Content-Type-Options`, `X-Frame-Options`, etc.)
- Passwords excluded from all query results (`select: false`)

---

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the full Vercel deployment guide.
