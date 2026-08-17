# 🌌 Aliverso

> **Curated Community Photo & Moment-Sharing Platform**

A dedicated, curated community gallery ecosystem built for Ali's universe ("Aliverso"). Aliverso enables community members to share memories and photos, which undergo admin moderation before appearing in the public gallery.

---

## ✨ Features

- 🖼️ **Public Curated Gallery** — Browse approved community moments and photos with captions, tags, and dynamic grid layouts.
- 📸 **Frictionless Submission Portal** — Direct image uploading via Vercel Blob storage with caption & tag attachments.
- 📊 **Submission Tracker (`/my-submissions`)** — Personal status dashboard for contributors to view submission states (`PENDING`, `APPROVED`, `REJECTED`).
- 🛡️ **Admin Moderation Workspace (`/admin/review`)** — Dedicated review portal for Admin (Ali) to evaluate, approve, or reject pending community submissions.
- 👥 **User Management (`/admin/users`)** — Role-based access control (`USER` & `ADMIN`) and member management.
- 🔐 **Authentication & Security** — NextAuth v5 credentials provider with password hashing (`bcryptjs`) and Prisma session adapter.
- 🌓 **Dark & Light Mode** — Modern, responsive UI supporting theme switching via `next-themes`.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router & Server Actions) |
| **UI Library** | [React 19](https://react.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Database & ORM** | [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM 6](https://www.prisma.io/) |
| **Authentication** | [NextAuth.js v5](https://authjs.dev/) (`@auth/prisma-adapter`) |
| **Image Storage** | [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) |
| **Styling & Icons** | [Tailwind CSS v4](https://tailwindcss.com/), [Base UI](https://base-ui.com/), [Lucide Icons](https://lucide.dev/), [Sonner](https://sonner.emilkowal.ski/) |

---

## 📁 Project Structure

```text
aliverso/
├── app/                      # Next.js App Router pages & server routes
│   ├── admin/                # Admin moderation & user management portals
│   │   ├── review/           # Pending submission moderation queue
│   │   └── users/            # User account management table
│   ├── api/                  # API endpoints (Auth, Blob uploads, etc.)
│   ├── auth/                 # Authentication pages (Sign In & Sign Up)
│   ├── dashboard/            # User dashboard
│   ├── gallery/              # Public curated photo gallery
│   ├── my-submissions/       # User submission tracker
│   └── submit/               # Photo submission form
├── components/               # React UI components & client modules
│   ├── admin-review-table.tsx
│   ├── admin-users-table.tsx
│   ├── gallery-grid.tsx
│   ├── navbar.tsx
│   ├── upload-form.tsx
│   ├── user-submissions-list.tsx
│   └── ui/                   # Reusable UI primitives
├── lib/                      # Core utilities, Auth config & Server Actions
│   ├── actions/              # Server actions (auth, submissions, users)
│   ├── auth.ts               # NextAuth v5 authentication handlers
│   └── db.ts                 # Prisma Client singleton
├── prisma/                   # Database schema & seeding scripts
│   ├── schema.prisma         # Prisma data models (User, Moment, Submission)
│   └── seed.ts               # Database seed script for initial admin user
└── public/                   # Static assets
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.x or later
- **npm**: v9.x or later
- **PostgreSQL**: Local instance or remote database (e.g. Vercel Postgres, Supabase, Neon)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/your-username/aliverso.git
cd aliverso
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root by copying the example template:

```bash
cp .env.example .env
```

Fill in the required configuration variables:

```env
# Database Connections
DATABASE_URL="postgres://user:password@localhost:5432/aliverso?schema=public"
POSTGRES_URL="postgres://user:password@localhost:5432/aliverso"

# NextAuth v5 Configuration
AUTH_SECRET="your-32-character-secret-key-goes-here"
NEXTAUTH_SECRET="your-32-character-secret-key-goes-here"
NEXTAUTH_URL="http://localhost:3000"

# Vercel Blob Storage Token
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
```

### 3. Initialize Database & Seed Admin User

Push the Prisma schema to your PostgreSQL database and run the seed script to create the default Admin account:

```bash
# Push schema to database
npx prisma db push

# Seed database with the default Admin user (ali@aliverso.com)
npm run seed # or npx tsx prisma/seed.ts
```

> **Default Admin Credentials:**
> - **Email**: `ali@aliverso.com`
> - **Password**: `alidoaliverso`

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view **Aliverso**.

---

## 📜 Available Scripts

In the project directory, you can run:

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server on `http://localhost:3000` |
| `npm run build` | Builds the production bundle |
| `npm run start` | Runs the production build server |
| `npm run lint` | Runs ESLint to check for code style issues |
| `npx prisma db push` | Syncs the Prisma schema with your database without creating migrations |
| `npx prisma studio` | Opens Prisma Studio GUI to view and edit database contents |
| `npx tsx prisma/seed.ts` | Seeds the database with the initial Admin user |

---

## 🔒 Moderation & Permissions Workflow

```mermaid
flowchart LR
    A[Community Member] -->|Upload Photo & Caption| B(Submission Portal)
    B -->|Status: PENDING| C[Admin Queue]
    C -->|Ali Reviews| D{Decision}
    D -->|Approve| E[Public Gallery]
    D -->|Reject| F[Hidden / Rejected Status]
```

1. **Submission**: Community members log in and upload photos via `/submit`. Submissions are created with status `PENDING`.
2. **Review**: Admin (`ali@aliverso.com`) reviews submissions in `/admin/review`.
3. **Approval**: Approved submissions are assigned to or linked with curated `Moments` and displayed in the public `/gallery`.
4. **Tracking**: Contributors can track approval state under `/my-submissions`.

---

## 📄 License

This project is private and proprietary to Aliverso.
