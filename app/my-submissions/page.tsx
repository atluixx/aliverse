import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { UserSubmissionsList } from "@/components/user-submissions-list";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { Upload, UserCheck } from "lucide-react";

export const instant = false;

export const metadata = {
  title: "My Submissions — Aliverso",
  description: "Track the moderation status of your photo submissions.",
};

export default async function MySubmissionsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/my-submissions");
  }

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

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <UserCheck className="size-6 text-primary" />
            My Photo Submissions
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your pending, approved, and rejected photos submitted to the Aliverso.
          </p>
        </div>

        <Link href="/submit" className={buttonVariants()}>
          <Upload data-icon="inline-start" />
          Submit New Photo
        </Link>
      </div>

      <UserSubmissionsList submissions={submissions} />
    </div>
  );
}
