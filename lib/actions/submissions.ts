"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role, SubmissionStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createSubmission(data: {
  imageUrl: string;
  caption: string;
  momentId?: string;
}): Promise<{ success?: boolean; submissionId?: string; error?: string }> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: "You must be signed in to submit a photo." };
    }

    if (!data.imageUrl || !data.caption.trim()) {
      return { error: "Image and caption are required." };
    }

    const validMomentId = (data.momentId && data.momentId !== "none") ? data.momentId : null;

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
    console.error("Error creating submission:", err);
    return { error: err.message || "Failed to save submission to database." };
  }
}

export async function approveSubmission(submissionId: string): Promise<{ success?: boolean; submission?: any; error?: string }> {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== Role.ADMIN) {
      return { error: "Forbidden: Admin authorization required." };
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
  } catch (err: any) {
    console.error("Error approving submission:", err);
    return { error: err.message || "Failed to approve submission." };
  }
}

export async function rejectSubmission(submissionId: string): Promise<{ success?: boolean; submission?: any; error?: string }> {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== Role.ADMIN) {
      return { error: "Forbidden: Admin authorization required." };
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
  } catch (err: any) {
    console.error("Error rejecting submission:", err);
    return { error: err.message || "Failed to reject submission." };
  }
}

export async function deleteSubmission(submissionId: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { error: "Unauthorized." };
    }

    const existing = await db.submission.findUnique({
      where: { id: submissionId },
      select: { userId: true },
    });

    if (!existing) {
      return { error: "Submission not found." };
    }

    if (existing.userId !== session.user.id && session.user.role !== Role.ADMIN) {
      return { error: "Forbidden: You cannot delete this submission." };
    }

    await db.submission.delete({
      where: { id: submissionId },
    });

    revalidatePath("/gallery");
    revalidatePath("/admin/review");
    revalidatePath("/my-submissions");

    return { success: true };
  } catch (err: any) {
    console.error("Error deleting submission:", err);
    return { error: err.message || "Failed to delete submission." };
  }
}
