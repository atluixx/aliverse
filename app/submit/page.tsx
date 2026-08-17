import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { UploadForm } from "@/components/upload-form";

export const instant = false;

export const metadata = {
  title: "Submit Photo — Aliverso",
  description: "Upload a photo to be featured in the Aliverso gallery.",
};

export default async function SubmitPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/submit");
  }

  const moments = await db.moment.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, caption: true },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <UploadForm moments={moments} />
    </div>
  );
}
