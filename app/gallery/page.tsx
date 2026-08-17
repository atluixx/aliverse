import { Suspense } from "react";
import { db } from "@/lib/db";
import { SubmissionStatus } from "@prisma/client";
import { GalleryGrid } from "@/components/gallery-grid";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Aliverso — Shared Universe Gallery",
  description: "Explore photos and moments celebrating Ali's shared universe.",
};

async function GalleryData() {
  const submissions = await db.submission.findMany({
    where: {
      status: SubmissionStatus.APPROVED,
    },
    orderBy: {
      submittedAt: "desc",
    },
    select: {
      id: true,
      userId: true,
      imageUrl: true,
      caption: true,
      submittedAt: true,
      user: {
        select: {
          id: true,
          username: true,
          name: true,
        },
      },
      moment: {
        select: {
          id: true,
          caption: true,
          tags: true,
        },
      },
    },
  });

  return <GalleryGrid submissions={submissions} />;
}

function GallerySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <Skeleton className="h-5 w-3/4 rounded-md" />
          <Skeleton className="h-4 w-1/3 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export default function GalleryPage() {
  return (
    <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-6">
      {/* Clean Gallery Grid Section with Suspense Stream */}
      <Suspense fallback={<GallerySkeleton />}>
        <GalleryData />
      </Suspense>
    </div>
  );
}
