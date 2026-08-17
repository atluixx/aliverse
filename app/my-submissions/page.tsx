import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { UserSubmissionsList } from "@/components/user-submissions-list";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Upload, UserCheck, Shield, Mail, Calendar, CheckCircle2, Clock, XCircle, User as UserIcon } from "lucide-react";

export const instant = false;

export const metadata = {
  title: "Profile & Submissions — Aliverso",
  description: "View your user profile and track your photo submissions.",
};

export default async function MySubmissionsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/my-submissions");
  }

  const userProfile = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      image: true,
      role: true,
      createdAt: true,
    },
  });

  const submissions = await db.submission.findMany({
    where: {
      userId: session.user.id,
    },
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
    },
  });

  const approvedCount = submissions.filter((s) => s.status === "APPROVED").length;
  const pendingCount = submissions.filter((s) => s.status === "PENDING").length;
  const rejectedCount = submissions.filter((s) => s.status === "REJECTED").length;

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Profile Overview Card */}
      {userProfile && (
        <Card className="overflow-hidden border shadow-sm">
          <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="size-16 border border-border">
                <AvatarImage src={userProfile.image || undefined} alt={userProfile.name || "User"} />
                <AvatarFallback className="text-lg font-bold">
                  {userProfile.name?.charAt(0) || userProfile.username?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{userProfile.name || `@${userProfile.username}`}</h2>
                  {userProfile.role === "ADMIN" ? (
                    <Badge className="bg-amber-500 hover:bg-amber-600 text-white gap-1 text-xs">
                      <Shield className="size-3" /> Admin
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      User
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  {userProfile.username && (
                    <span className="font-mono text-foreground">@{userProfile.username}</span>
                  )}
                  {userProfile.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="size-3" /> {userProfile.email}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" /> Joined {new Date(userProfile.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Submission Stats */}
            <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6">
              <div className="flex flex-col items-center px-3 text-center">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="size-3 text-emerald-500" /> Approved
                </span>
                <span className="text-xl font-bold text-foreground">{approvedCount}</span>
              </div>
              <Separator orientation="vertical" className="h-8 hidden md:block" />
              <div className="flex flex-col items-center px-3 text-center">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="size-3 text-amber-500" /> Pending
                </span>
                <span className="text-xl font-bold text-foreground">{pendingCount}</span>
              </div>
              <Separator orientation="vertical" className="h-8 hidden md:block" />
              <div className="flex flex-col items-center px-3 text-center">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <XCircle className="size-3 text-rose-500" /> Rejected
                </span>
                <span className="text-xl font-bold text-foreground">{rejectedCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submissions Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <UserCheck className="size-5 text-primary" />
            Submitted Photos
          </h3>
          <p className="text-xs text-muted-foreground">
            Manage your submitted photos and track moderation status.
          </p>
        </div>

        <Link href="/submit" className={buttonVariants({ size: "sm" })}>
          <Upload data-icon="inline-start" />
          Submit New Photo
        </Link>
      </div>

      <UserSubmissionsList submissions={submissions} />
    </div>
  );
}
