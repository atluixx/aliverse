import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UserSubmissionsList } from "@/components/user-submissions-list";
import { AdminReviewTable } from "@/components/admin-review-table";
import { AdminUsersTable } from "@/components/admin-users-table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
  Shield,
  Users,
  Image as ImageIcon,
  User as UserIcon,
  Upload,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  LayoutDashboard,
} from "lucide-react";

export const instant = false;

export const metadata = {
  title: "Dashboard — Aliverso",
  description: "Unified dashboard for photo submissions, profile management, and admin moderation.",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/dashboard");
  }

  const userId = session.user.id;
  const isAdmin = session.user.role === Role.ADMIN;

  // Fetch user profile and user's personal submissions
  const [userProfile, userSubmissions] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        createdAt: true,
      },
    }),
    db.submission.findMany({
      where: { userId },
      orderBy: { submittedAt: "desc" },
      select: {
        id: true,
        imageUrl: true,
        caption: true,
        status: true,
        submittedAt: true,
        reviewedAt: true,
      },
    }),
  ]);

  // If user is Admin, fetch all submissions and all users for admin tabs
  let adminSubmissions: any[] = [];
  let adminUsers: any[] = [];

  if (isAdmin) {
    [adminSubmissions, adminUsers] = await Promise.all([
      db.submission.findMany({
        orderBy: { submittedAt: "desc" },
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
        orderBy: { createdAt: "desc" },
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
  }

  const userApprovedCount = userSubmissions.filter((s) => s.status === "APPROVED").length;
  const userPendingCount = userSubmissions.filter((s) => s.status === "PENDING").length;
  const userRejectedCount = userSubmissions.filter((s) => s.status === "REJECTED").length;

  const adminPendingCount = isAdmin
    ? adminSubmissions.filter((s) => s.status === "PENDING").length
    : 0;

  const usernameDisplay = userProfile?.username ? `@${userProfile.username}` : userProfile?.name || "User";

  return (
    <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col gap-8">
      {/* User Header Profile Card */}
      {userProfile && (
        <Card className="overflow-hidden border shadow-sm rounded-2xl">
          <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <UserIcon className="size-6" />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-sans font-black tracking-tighter text-foreground">
                    {usernameDisplay}
                  </h1>
                  {isAdmin ? (
                    <Badge className="bg-amber-500 hover:bg-amber-600 text-white gap-1 text-xs font-semibold px-2.5 py-0.5">
                      <Shield className="size-3" /> ADMIN
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5">
                      USER
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" /> Member since {new Date(userProfile.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* User Submission Summary Counters */}
            <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-6 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6">
              <div className="flex flex-col items-center px-2 text-center">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="size-3 text-emerald-500" /> Approved
                </span>
                <span className="text-xl font-bold text-foreground">{userApprovedCount}</span>
              </div>
              <Separator orientation="vertical" className="h-8 hidden sm:block" />
              <div className="flex flex-col items-center px-2 text-center">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="size-3 text-amber-500" /> Pending
                </span>
                <span className="text-xl font-bold text-foreground">{userPendingCount}</span>
              </div>
              <Separator orientation="vertical" className="h-8 hidden sm:block" />
              <div className="flex flex-col items-center px-2 text-center">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <XCircle className="size-3 text-rose-500" /> Rejected
                </span>
                <span className="text-xl font-bold text-foreground">{userRejectedCount}</span>
              </div>
              <Link href="/submit" className={buttonVariants({ size: "sm", className: "ml-2 h-10 px-4 gap-1.5 font-semibold rounded-xl" })}>
                <Upload className="size-4" />
                Submit Photo
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unified Dashboard Tabs */}
      <Tabs defaultValue="my-submissions" className="w-full">
        <TabsList className="flex items-center justify-start w-full overflow-x-auto no-scrollbar h-12 rounded-xl p-1 bg-muted/60 mb-6">
          <TabsTrigger value="my-submissions" className="rounded-lg text-xs font-semibold gap-2 min-h-[38px] px-4">
            <LayoutDashboard className="size-4 text-primary" /> My Submissions ({userSubmissions.length})
          </TabsTrigger>

          {isAdmin && (
            <>
              <TabsTrigger value="moderation" className="rounded-lg text-xs font-semibold gap-2 min-h-[38px] px-4">
                <ImageIcon className="size-4 text-amber-500" /> Photo Moderation
                {adminPendingCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-white leading-none">
                    {adminPendingCount}
                  </span>
                )}
              </TabsTrigger>

              <TabsTrigger value="users" className="rounded-lg text-xs font-semibold gap-2 min-h-[38px] px-4">
                <Users className="size-4 text-amber-500" /> User Management ({adminUsers.length})
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {/* Tab 1: My Submissions */}
        <TabsContent value="my-submissions" className="mt-0 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-sans font-black tracking-tighter text-foreground">
              My Submissions
            </h2>
          </div>
          <UserSubmissionsList submissions={userSubmissions} />
        </TabsContent>

        {/* Tab 2 & 3: Admin Gated Controls */}
        {isAdmin && (
          <>
            <TabsContent value="moderation" className="mt-0">
              <AdminReviewTable initialSubmissions={adminSubmissions} />
            </TabsContent>

            <TabsContent value="users" className="mt-0">
              <AdminUsersTable initialUsers={adminUsers} currentUserId={session.user.id} />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
