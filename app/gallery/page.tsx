import { Suspense } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { SubmissionStatus } from "@prisma/client";
import { GalleryGrid } from "@/components/gallery-grid";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Upload, Images } from "lucide-react";

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
      imageUrl: true,
      caption: true,
      submittedAt: true,
      user: {
        select: {
          name: true,
          image: true,
          email: true,
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-xl border p-4">
          <Skeleton className="aspect-[4/3] w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export default function GalleryPage() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-10 flex flex-col gap-10">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-8">
        <div className="flex flex-col gap-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium w-fit">
            <Sparkles className="size-3.5" /> Welcome to Aliverso
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-tight text-foreground">
            The Shared Universe Gallery
          </h1>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
            A curated collection of photos, memories, and moments centered around Ali. 
            Submitted by the community, approved by admins.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/submit" className={buttonVariants({ size: "lg", className: "gap-2 shadow-xs" })}>
            <Upload data-icon="inline-start" />
            Submit Your Photo
          </Link>
        </div>
      </div>

      {/* Gallery Grid Section with Suspense Stream */}
      <Suspense fallback={<GallerySkeleton />}>
        <GalleryData />
      </Suspense>
    </div>
  );
}
