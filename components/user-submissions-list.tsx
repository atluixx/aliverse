"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { toast } from "sonner";
import { deleteSubmission } from "@/lib/actions/submissions";
import { Clock, CheckCircle, XCircle, Trash2, Plus, Images } from "lucide-react";

interface UserSubmissionItem {
  id: string;
  imageUrl: string;
  caption: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt: Date | string;
  reviewedAt?: Date | string | null;
}

interface UserSubmissionsListProps {
  submissions: UserSubmissionItem[];
}

export function UserSubmissionsList({ submissions: initialSubmissions }: UserSubmissionsListProps) {
  const [submissions, setSubmissions] = useState<UserSubmissionItem[]>(initialSubmissions);
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this photo submission?")) return;

    startTransition(async () => {
      try {
        await deleteSubmission(id);
        setSubmissions((prev) => prev.filter((item) => item.id !== id));
        toast.success("Photo submission deleted.");
      } catch (err: any) {
        toast.error(err.message || "Failed to delete submission.");
      }
    });
  };

  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-xl bg-muted/30 gap-4">
        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Images className="size-6" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">No submissions yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1">
            You haven&apos;t submitted any photos to Aliverso yet. Share a memory to contribute to Ali&apos;s shared universe!
          </p>
        </div>
        <Link href="/submit" className={buttonVariants()}>
          <Plus data-icon="inline-start" />
          Submit Your First Photo
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {submissions.map((item) => (
        <Card key={item.id} className="overflow-hidden border flex flex-col justify-between shadow-sm">
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
            <Image src={item.imageUrl} alt={item.caption} fill className="object-cover" />
            <div className="absolute top-3 right-3">
              {item.status === "PENDING" && (
                <Badge className="bg-amber-500/90 text-white backdrop-blur border-none flex items-center gap-1">
                  <Clock className="size-3" /> Pending Review
                </Badge>
              )}
              {item.status === "APPROVED" && (
                <Badge className="bg-emerald-600/90 text-white backdrop-blur border-none flex items-center gap-1">
                  <CheckCircle className="size-3" /> Approved
                </Badge>
              )}
              {item.status === "REJECTED" && (
                <Badge className="bg-rose-600/90 text-white backdrop-blur border-none flex items-center gap-1">
                  <XCircle className="size-3" /> Rejected
                </Badge>
              )}
            </div>
          </div>

          <CardContent className="p-4 flex-1 flex flex-col justify-between gap-3">
            <p className="text-sm font-medium line-clamp-2">{item.caption}</p>

            <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
              <span>Submitted {new Date(item.submittedAt).toLocaleDateString()}</span>
              <Button
                variant="ghost"
                size="icon"
                className="size-10 sm:size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 active:scale-95 transition-transform"
                onClick={() => handleDelete(item.id)}
                disabled={isPending}
                title="Delete submission"
                aria-label="Delete photo submission"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
