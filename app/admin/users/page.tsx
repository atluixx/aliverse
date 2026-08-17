import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { AdminUsersTable } from "@/components/admin-users-table";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, UserCheck, KeyRound } from "lucide-react";

export const metadata = {
  title: "Manage Admins & Users — Aliverso",
  description: "Manage system administrator privileges and user roles.",
};

async function AdminUsersData() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/admin/users");
  }

  if (session.user.role !== Role.ADMIN) {
    redirect("/gallery?error=UnauthorizedAdminAccess");
  }

  const users = await db.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          submissions: true,
        },
      },
    },
  });

  return <AdminUsersTable initialUsers={users} currentUserId={session.user.id} />;
}

function UsersSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-14 w-48 rounded-xl" />
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>
      <Skeleton className="h-10 w-full max-w-md rounded-lg" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-8">
      {/* Admin Users Hero Header Surface */}
      <div className="flex flex-col gap-3 border-b pb-6 sm:pb-8">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-foreground">
          Admin & User Privileges
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed max-w-2xl">
          Manage system administrator access, promote trusted community members, or generate co-admin accounts.
        </p>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
          <span className="flex items-center gap-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full border border-amber-500/20 font-medium">
            <ShieldCheck className="size-3.5" /> Role Governance
          </span>
          <span className="flex items-center gap-1.5 bg-muted px-3 py-1 rounded-full border">
            <UserCheck className="size-3.5 text-primary" /> Active Contributors
          </span>
          <span className="flex items-center gap-1.5 bg-muted px-3 py-1 rounded-full border">
            <KeyRound className="size-3.5" /> Secure Credentials
          </span>
        </div>
      </div>

      <Suspense fallback={<UsersSkeleton />}>
        <AdminUsersData />
      </Suspense>
    </div>
  );
}
