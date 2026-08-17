import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AdminReviewTable } from "@/components/admin-review-table";
import { AdminUsersTable } from "@/components/admin-users-table";
import { Shield, Users, Image as ImageIcon } from "lucide-react";

export const instant = false;

export const metadata = {
  title: "Admin Dashboard — Aliverso",
  description: "Unified admin panel for managing submissions, moderation, and user accounts.",
};

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== Role.ADMIN) {
    redirect("/gallery");
  }

  // Fetch submissions and users concurrently
  const [submissions, users] = await Promise.all([
    db.submission.findMany({
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
            username: true,
            name: true,
          },
        },
        reviewer: {
          select: {
            name: true,
          },
        },
      },
    }),
    db.user.findMany({
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
    }),
  ]);

  const pendingCount = submissions.filter((s) => s.status === "PENDING").length;

  return (
    <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-8">
      {/* Dashboard Header */}
      <div className="flex flex-col gap-2 border-b pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          <Shield className="size-4" />
          <span>Unified Administration Panel</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-sans font-black tracking-tighter text-foreground">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
          Manage community photo reviews, approve or reject submissions, and manage user accounts and admin roles.
        </p>
      </div>

      {/* Dashboard Tabs */}
      <Tabs defaultValue="review" className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md h-12 rounded-xl p-1 bg-muted/60 mb-6">
          <TabsTrigger value="review" className="rounded-lg text-xs font-semibold gap-2">
            <ImageIcon className="size-4 text-amber-500" /> Photo Moderation
            {pendingCount > 0 && (
              <span className="ml-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-white leading-none">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="users" className="rounded-lg text-xs font-semibold gap-2">
            <Users className="size-4 text-amber-500" /> User Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="review" className="mt-0">
          <AdminReviewTable initialSubmissions={submissions} />
        </TabsContent>

        <TabsContent value="users" className="mt-0">
          <AdminUsersTable initialUsers={users} currentUserId={session.user.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
