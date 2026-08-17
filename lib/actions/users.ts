"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function updateUserRole(targetUserId: string, newRole: Role) {
  const session = await auth();

  if (!session?.user || session.user.role !== Role.ADMIN) {
    throw new Error("Forbidden: Only admins can manage user roles.");
  }

  // Prevent self-demotion if you're the user being edited
  if (targetUserId === session.user.id && newRole !== Role.ADMIN) {
    const adminCount = await db.user.count({
      where: { role: Role.ADMIN },
    });

    if (adminCount <= 1) {
      throw new Error("Cannot demote the only remaining admin.");
    }
  }

  const updatedUser = await db.user.update({
    where: { id: targetUserId },
    data: { role: newRole },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin/review");

  return { success: true, user: updatedUser };
}

export async function createAdminUser(data: {
  username: string;
  name?: string;
  email?: string;
  password?: string;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== Role.ADMIN) {
    throw new Error("Forbidden: Only admins can create admin accounts.");
  }

  const username = data.username.trim().toLowerCase();
  const email = data.email?.trim().toLowerCase();
  const name = data.name?.trim() || username;
  const password = data.password || "admin123";

  if (!username || username.length < 3) {
    throw new Error("Username must be at least 3 characters long.");
  }

  // Check username collision
  const existingUsername = await db.user.findUnique({
    where: { username },
  });

  if (existingUsername) {
    throw new Error("Username is already taken.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newAdmin = await db.user.create({
    data: {
      username,
      name,
      email: email || `${username}@aliverso.local`,
      password: hashedPassword,
      role: Role.ADMIN,
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  });

  revalidatePath("/admin/users");

  return { success: true, user: newAdmin };
}
