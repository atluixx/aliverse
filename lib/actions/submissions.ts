"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role, SubmissionStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createSubmission(data: {
  imageUrl: string;
  caption: string;
  momentId?: string;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("You must be logged in to submit a photo.");
  }

  if (!data.imageUrl || !data.caption.trim()) {
    throw new Error("Image and caption are required.");
  }

  const validMomentId = (data.momentId && data.momentId !== "none") ? data.momentId : null;

  try {
    const submission = await db.submission.create({
      data: {
        userId: session.user.id,
        imageUrl: data.imageUrl,
        caption: data.caption.trim(),
        momentId: validMomentId,
        status: SubmissionStatus.PENDING,
      },
    });

    revalidatePath("/my-submissions");
    revalidatePath("/admin/review");

    return { success: true, submissionId: submission.id };
  } catch (err: any) {
    console.error("Error creating submission in DB:", err);
    throw new Error(err.message || "Failed to save submission to database.");
  }
}

export async function approveSubmission(submissionId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== Role.ADMIN) {
    throw new Error("Forbidden: Admin authorization required.");
  }

  const updated = await db.submission.update({
    where: { id: submissionId },
    data: {
      status: SubmissionStatus.APPROVED,
      reviewedBy: session.user.id,
      reviewedAt: new Date(),
    },
  });

  revalidatePath("/gallery");
  revalidatePath("/");
  revalidatePath("/admin/review");
  revalidatePath("/my-submissions");

  return { success: true, submission: updated };
}

export async function rejectSubmission(submissionId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== Role.ADMIN) {
    throw new Error("Forbidden: Admin authorization required.");
  }

  const updated = await db.submission.update({
    where: { id: submissionId },
    data: {
      status: SubmissionStatus.REJECTED,
      reviewedBy: session.user.id,
      reviewedAt: new Date(),
    },
  });

  revalidatePath("/gallery");
  revalidatePath("/");
  revalidatePath("/admin/review");
  revalidatePath("/my-submissions");

  return { success: true, submission: updated };
}

export async function deleteSubmission(submissionId: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized.");
  }

  const existing = await db.submission.findUnique({
    where: { id: submissionId },
    select: { userId: true },
  });

  if (!existing) {
    throw new Error("Submission not found.");
  }

  if (existing.userId !== session.user.id && session.user.role !== Role.ADMIN) {
    throw new Error("Forbidden.");
  }

  await db.submission.delete({
    where: { id: submissionId },
  });

  revalidatePath("/gallery");
  revalidatePath("/admin/review");
  revalidatePath("/my-submissions");

  return { success: true };
}
