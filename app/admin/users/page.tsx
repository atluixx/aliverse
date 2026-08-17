import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { AdminUsersTable } from "@/components/admin-users-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield } from "lucide-react";


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
      email: true,
      image: true,
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
      <Skeleton className="h-20 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-10 flex flex-col gap-8">
      <div className="flex flex-col gap-2.5 border-b pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium w-fit">
          <Shield className="size-3.5" /> Admin Security Console
        </div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-foreground">Admin & User Privilege Management</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Promote community contributors to Administrators, manage roles, or create new admin accounts.
        </p>
      </div>

      <Suspense fallback={<UsersSkeleton />}>
        <AdminUsersData />
      </Suspense>
    </div>
  );
}
