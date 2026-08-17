"use server";

import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function registerUser(data: {
  username: string;
  name?: string;
  email?: string;
  password?: string;
}): Promise<{ success?: boolean; user?: any; error?: string }> {
  try {
    const username = data.username.trim().toLowerCase();
    const email = data.email?.trim().toLowerCase();
    const name = data.name?.trim() || username;
    const password = data.password;

    if (!username || username.length < 3) {
      return { error: "Username must be at least 3 characters long." };
    }

    if (!password || password.length < 6) {
      return { error: "Password must be at least 6 characters long." };
    }

    // Check username collision
    const existingUsername = await db.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return { error: "Username is already taken. Please choose another username." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.user.create({
      data: {
        username,
        name,
        email: email || `${username}@aliverso.local`,
        password: hashedPassword,
        role: Role.USER,
        image: null,
      },
    });

    return {
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        role: newUser.role,
      },
    };
  } catch (err: any) {
    console.error("Error registering user:", err);
    return { error: err.message || "Failed to register account." };
  }
}
