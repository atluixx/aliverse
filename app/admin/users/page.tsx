import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { AdminUsersTable } from "@/components/admin-users-table";
import { Shield } from "lucide-react";

export const instant = false;

export const metadata = {
  title: "Manage Admins & Users — Aliverso",
  description: "Manage system administrator privileges and user roles.",
};

export default async function AdminUsersPage() {
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

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
      <div className="flex flex-col gap-2 border-b pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold w-fit">
          <Shield className="size-3.5" /> Admin Security Console
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Admin & User Privilege Management</h1>
        <p className="text-sm text-muted-foreground">
          Promote community contributors to Administrators, manage roles, or create new admin accounts.
        </p>
      </div>

      <AdminUsersTable initialUsers={users} currentUserId={session.user.id} />
    </div>
  );
}
