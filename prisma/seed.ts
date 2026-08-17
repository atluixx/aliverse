import { PrismaClient, Role, SubmissionStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with username & password support...");

  const adminPasswordHash = await bcrypt.hash("ali123", 10);
  const userPasswordHash = await bcrypt.hash("user123", 10);

  // Seed Admin user (Ali)
  const ali = await prisma.user.upsert({
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
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      role: Role.ADMIN,
    },
  });

  // Seed standard user
  const demoUser = await prisma.user.upsert({
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
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      role: Role.USER,
    },
  });

  // Check if moments exist
  let momentParis = await prisma.moment.findFirst({ where: { caption: { contains: "Paris" } } });
  if (!momentParis) {
    momentParis = await prisma.moment.create({
      data: {
        caption: "Ali in Paris - Sunset near Eiffel Tower",
        tags: ["travel", "paris", "eiffel"],
      },
    });
  }

  let momentTech = await prisma.moment.findFirst({ where: { caption: { contains: "Tech" } } });
  if (!momentTech) {
    momentTech = await prisma.moment.create({
      data: {
        caption: "Ali Keynote at AI Summit 2026",
        tags: ["tech", "ai", "keynote"],
      },
    });
  }

  let momentParty = await prisma.moment.findFirst({ where: { caption: { contains: "Celebration" } } });
  if (!momentParty) {
    momentParty = await prisma.moment.create({
      data: {
        caption: "Aliverso Annual Celebration",
        tags: ["party", "friends", "aliverso"],
      },
    });
  }

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
