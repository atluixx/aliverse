import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database (clean gallery mode)...");

  // Clear any old mock submissions
  await prisma.submission.deleteMany({});

  const adminPasswordHash = await bcrypt.hash("ali123", 10);
  const userPasswordHash = await bcrypt.hash("user123", 10);

  // Seed Admin user (Ali)
  await prisma.user.upsert({
    where: { email: "ali@aliverso.com" },
    update: {
      username: "ali",
      role: Role.ADMIN,
      password: adminPasswordHash,
    },
    create: {
      username: "ali",
      name: "Ali",
      email: "ali@aliverso.com",
      password: adminPasswordHash,
      role: Role.ADMIN,
    },
  });

  // Seed standard user
  await prisma.user.upsert({
    where: { email: "user@aliverso.com" },
    update: {
      username: "contributor",
      role: Role.USER,
      password: userPasswordHash,
    },
    create: {
      username: "contributor",
      name: "Universe Contributor",
      email: "user@aliverso.com",
      password: userPasswordHash,
      role: Role.USER,
    },
  });

  // Seed standard moments categories
  const moments = [
    { caption: "Ali in Paris - Sunset near Eiffel Tower", tags: ["travel", "paris", "eiffel"] },
    { caption: "Ali Keynote at AI Summit 2026", tags: ["tech", "ai", "keynote"] },
    { caption: "Aliverso Annual Celebration", tags: ["party", "friends", "aliverso"] },
  ];

  for (const m of moments) {
    const existing = await prisma.moment.findFirst({ where: { caption: m.caption } });
    if (!existing) {
      await prisma.moment.create({ data: m });
    }
  }

  console.log("Database clean seed completed successfully.");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
