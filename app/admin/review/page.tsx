import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { AdminReviewTable } from "@/components/admin-review-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield } from "lucide-react";


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
      <Skeleton className="h-20 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

export default function AdminReviewPage() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-10 flex flex-col gap-8">
      <div className="flex flex-col gap-2.5 border-b pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium w-fit">
          <Shield className="size-3.5" /> Admin Moderation Console
        </div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-foreground">Photo Submissions Review</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Approve or reject user photos before they appear in the public Aliverso gallery.
        </p>
      </div>

      <Suspense fallback={<AdminSkeleton />}>
        <AdminReviewData />
      </Suspense>
    </div>
  );
}
