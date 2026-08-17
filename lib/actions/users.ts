"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function updateUserRole(
  targetUserId: string,
  newRole: Role
): Promise<{ success?: boolean; user?: any; error?: string }> {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== Role.ADMIN) {
      return { error: "Forbidden: Only admins can manage user roles." };
    }

    if (targetUserId === session.user.id && newRole !== Role.ADMIN) {
      const adminCount = await db.user.count({
        where: { role: Role.ADMIN },
      });

      if (adminCount <= 1) {
        return { error: "Cannot demote the only remaining admin." };
      }
    }

    const updatedUser = await db.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin/review");

    return { success: true, user: updatedUser };
  } catch (err: any) {
    console.error("Error updating user role:", err);
    return { error: err.message || "Failed to update user role." };
  }
}

export async function createAdminUser(data: {
  username: string;
  name?: string;
  email?: string;
  password?: string;
}): Promise<{ success?: boolean; user?: any; error?: string }> {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== Role.ADMIN) {
      return { error: "Forbidden: Only admins can create admin accounts." };
    }

    const username = data.username.trim().toLowerCase();
    const email = data.email?.trim().toLowerCase();
    const name = data.name?.trim() || username;
    const password = data.password || "admin123";

    if (!username || username.length < 3) {
      return { error: "Username must be at least 3 characters long." };
    }

    const existingUsername = await db.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return { error: "Username is already taken." };
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
  } catch (err: any) {
    console.error("Error creating admin user:", err);
    return { error: err.message || "Failed to create admin account." };
  }
}

export async function deleteUser(
  targetUserId: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== Role.ADMIN) {
      return { error: "Forbidden: Only admins can delete user accounts." };
    }

    if (targetUserId === session.user.id) {
      return { error: "You cannot delete your own account from the admin dashboard." };
    }

    const targetUser = await db.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, role: true, username: true },
    });

    if (!targetUser) {
      return { error: "User not found." };
    }

    if (targetUser.role === Role.ADMIN) {
      const adminCount = await db.user.count({
        where: { role: Role.ADMIN },
      });

      if (adminCount <= 1) {
        return { error: "Cannot delete the only remaining admin account." };
      }
    }

    await db.user.delete({
      where: { id: targetUserId },
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin/review");
    revalidatePath("/gallery");
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    console.error("Error deleting user:", err);
    return { error: err.message || "Failed to delete user account." };
  }
}
