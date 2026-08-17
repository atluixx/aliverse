import { Suspense } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { SubmissionStatus } from "@prisma/client";
import { GalleryGrid } from "@/components/gallery-grid";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Upload, Images, ShieldCheck, Heart } from "lucide-react";

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col justify-between rounded-xl border bg-card p-0 overflow-hidden shadow-xs">
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="p-4 flex flex-col gap-2">
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="px-4 py-3 border-t bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function GalleryPage() {
  return (
    <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-8 sm:gap-12">
      {/* Hero Header Surface */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b pb-8 sm:pb-10">
        <div className="flex flex-col gap-4 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-foreground leading-[1.15]">
            The Shared Universe Gallery
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl">
            A curated collection of photos, memories, and moments centered around Ali. 
            Submitted by community members and verified by admins.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground pt-1">
            <span className="flex items-center gap-1.5 bg-muted/60 px-3 py-1.5 rounded-full border">
              <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" /> Moderated & Safe
            </span>
            <span className="flex items-center gap-1.5 bg-muted/60 px-3 py-1.5 rounded-full border">
              <Sparkles className="size-3.5 text-primary" /> Curated Moments
            </span>
            <span className="flex items-center gap-1.5 bg-muted/60 px-3 py-1.5 rounded-full border">
              <Heart className="size-3.5 text-rose-500" /> Community Memories
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/submit"
            className={buttonVariants({
              size: "lg",
              className: "h-12 px-6 text-sm font-semibold gap-2.5 shadow-sm active:scale-95 transition-transform",
            })}
          >
            <Upload data-icon="inline-start" className="size-4.5" />
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
