import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database (Pure Production Mode)...");

  // Delete all existing mock submissions, moments, and non-admin users
  await prisma.submission.deleteMany({});
  await prisma.moment.deleteMany({});
  await prisma.user.deleteMany({
    where: {
      email: {
        not: "ali@aliverso.com",
      },
    },
  });

  const aliPasswordHash = await bcrypt.hash("alidoaliverso", 10);

  // Seed ONLY Ali Admin user
  await prisma.user.upsert({
    where: { email: "ali@aliverso.com" },
    update: {
      username: "ali",
      name: "Ali",
      password: aliPasswordHash,
      role: Role.ADMIN,
    },
    create: {
      username: "ali",
      name: "Ali",
      email: "ali@aliverso.com",
      password: aliPasswordHash,
      role: Role.ADMIN,
    },
  });

  console.log("Database seeded: Only Ali Admin exists (ali@aliverso.com / password: 'alidoaliverso').");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
