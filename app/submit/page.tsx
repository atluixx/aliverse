import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { UploadForm } from "@/components/upload-form";
import { Skeleton } from "@/components/ui/skeleton";


export const metadata = {
  title: "Submit Photo — Aliverso",
  description: "Upload a photo to be featured in the Aliverso gallery.",
};

async function SubmitData() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/submit");
  }

  const moments = await db.moment.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, caption: true },
  });

  return <UploadForm moments={moments} />;
}

function SubmitSkeleton() {
  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-4">
      <Skeleton className="h-12 w-3/4" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

export default function SubmitPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<SubmitSkeleton />}>
        <SubmitData />
      </Suspense>
    </div>
  );
}
