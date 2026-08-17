import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { AdminReviewTable } from "@/components/admin-review-table";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, Clock, Layers } from "lucide-react";

export const metadata = {
  title: "Admin Review Dashboard — Aliverso",
  description: "Moderate and approve photo submissions for the Aliverso gallery.",
};

async function AdminReviewData() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/admin/review");
  }

  if (session.user.role !== Role.ADMIN) {
    redirect("/gallery?error=UnauthorizedAdminAccess");
  }

  const submissions = await db.submission.findMany({
    orderBy: {
      submittedAt: "desc",
    },
    select: {
      id: true,
      imageUrl: true,
      caption: true,
      status: true,
      submittedAt: true,
      reviewedAt: true,
      user: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
      reviewer: {
        select: {
          name: true,
        },
      },
    },
  });

  return <AdminReviewTable initialSubmissions={submissions} />;
}

function AdminSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
      <Skeleton className="h-10 w-full md:w-96 rounded-lg" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

export default function AdminReviewPage() {
  return (
    <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-8">
      {/* Moderation Hero Header Surface */}
      <div className="flex flex-col gap-3 border-b pb-6 sm:pb-8">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-foreground">
          Photo Submissions Review
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed max-w-2xl">
          Inspect, approve, or reject community photo contributions before they appear in the public gallery.
        </p>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
          <span className="flex items-center gap-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full border border-amber-500/20 font-medium">
            <Clock className="size-3.5" /> Pending Queue Priority
          </span>
          <span className="flex items-center gap-1.5 bg-muted px-3 py-1 rounded-full border">
            <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" /> Admin Gatekeeper
          </span>
          <span className="flex items-center gap-1.5 bg-muted px-3 py-1 rounded-full border">
            <Layers className="size-3.5" /> Direct Moderation Actions
          </span>
        </div>
      </div>

      <Suspense fallback={<AdminSkeleton />}>
        <AdminReviewData />
      </Suspense>
    </div>
  );
}
