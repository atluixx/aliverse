# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 16 (App Router), React 19, TypeScript, Prisma ORM (PostgreSQL), NextAuth v5, Vercel Blob, Tailwind CSS v4, Base UI

## Users

- **Community Members / Fans**: Submit photos/moments with captions, view approved community moments in the public gallery, and track their submission statuses.
- **Admin (Ali)**: Reviews pending submissions, approves or rejects photos, and manages community moments showcased across the platform.

## Product Purpose

Aliverso is a curated community photo and moment-sharing platform centered around Ali. It enables community members to share memories and photos, which undergo admin review before appearing in the public gallery.

## Positioning

A dedicated, curated community gallery ecosystem specifically built for Ali's universe ("Aliverso"), featuring direct admin moderation and themed "Moments" rather than an unmoderated generic social media feed.

## Operating Context

Responsive web app environment optimized for both mobile and desktop browsers. Includes direct image uploading via Vercel Blob, user authentication via NextAuth v5, and status tracking for submitted content.

## Capabilities and Constraints

- **Capabilities**: Public curated photo gallery, submission portal for photos with captions/tags, authentication flows, "My Submissions" user dashboard, and an Admin moderation workflow (Pending, Approved, Rejected).
- **Constraints**: Content must be approved by Admin (Ali) before appearing publicly. Built with Next.js 16 App Router and Prisma / PostgreSQL.

## Brand Commitments

- **Name**: Aliverso
- **Admin Identity**: Ali (`ali@aliverso.com`)

## Evidence on Hand

- App routes implemented under `/app` (`/gallery`, `/submit`, `/admin`, `/my-submissions`, `/auth`).
- Prisma schema with `User`, `Moment`, and `Submission` models in `prisma/schema.prisma`.
- Admin seed script in `prisma/seed.ts`.

## Product Principles

1. **Curated & Safe**: Community contributions undergo admin review by Ali to ensure positive, high-quality content.
2. **Frictionless Submission**: Quick and simple photo submission process for community members.
3. **Transparent Feedback**: Clear visibility into submission status (Pending, Approved, Rejected) for contributors.
4. **Shared Community Moments**: Emphasize togetherness and highlights within Ali's universe.

## Accessibility & Inclusion

Responsive web interface accessible across desktop, tablet, and mobile screen sizes, utilizing semantic HTML and accessible UI controls.
