"use server";

import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function registerUser(data: {
  username: string;
  name?: string;
  email?: string;
  password?: string;
}) {
  const username = data.username.trim().toLowerCase();
  const email = data.email?.trim().toLowerCase();
  const name = data.name?.trim() || username;
  const password = data.password;

  if (!username || username.length < 3) {
    throw new Error("Username must be at least 3 characters long.");
  }

  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }

  // Check username collision
  const existingUsername = await db.user.findUnique({
    where: { username },
  });

  if (existingUsername) {
    throw new Error("Username is already taken. Please choose another username.");
  }

  // Check email collision if email provided
  if (email) {
    const existingEmail = await db.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      throw new Error("Email address is already registered.");
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await db.user.create({
    data: {
      username,
      name,
      email: email || `${username}@aliverso.local`,
      password: hashedPassword,
      role: Role.USER,
      image: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
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
}
