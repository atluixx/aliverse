import { PrismaClient, Role, SubmissionStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Seed Admin user (Ali)
  const ali = await prisma.user.upsert({
    where: { email: "ali@aliverso.com" },
    update: { role: Role.ADMIN },
    create: {
      name: "Ali",
      email: "ali@aliverso.com",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      role: Role.ADMIN,
    },
  });

  // Seed standard user
  const demoUser = await prisma.user.upsert({
    where: { email: "user@aliverso.com" },
    update: { role: Role.USER },
    create: {
      name: "Universe Contributor",
      email: "user@aliverso.com",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      role: Role.USER,
    },
  });

  // Seed Moments
  const momentParis = await prisma.moment.create({
    data: {
      caption: "Ali in Paris - Sunset near Eiffel Tower",
      tags: ["travel", "paris", "eiffel"],
    },
  });

  const momentTech = await prisma.moment.create({
    data: {
      caption: "Ali Keynote at AI Summit 2026",
      tags: ["tech", "ai", "keynote"],
    },
  });

  const momentParty = await prisma.moment.create({
    data: {
      caption: "Aliverso Annual Celebration",
      tags: ["party", "friends", "aliverso"],
    },
  });

  // Seed Approved Submissions for Public Gallery
  await prisma.submission.createMany({
    data: [
      {
        momentId: momentParis.id,
        userId: demoUser.id,
        imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&auto=format&fit=crop&q=80",
        caption: "Capturing Ali enjoying the Parisian sunset! Unforgettable memory.",
        status: SubmissionStatus.APPROVED,
        submittedAt: new Date(Date.now() - 86400000 * 3), // 3 days ago
        reviewedBy: ali.id,
        reviewedAt: new Date(Date.now() - 86400000 * 2),
      },
      {
        momentId: momentTech.id,
        userId: ali.id,
        imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80",
        caption: "On stage presenting the vision for the expanded Aliverso ecosystem.",
        status: SubmissionStatus.APPROVED,
        submittedAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
        reviewedBy: ali.id,
        reviewedAt: new Date(Date.now() - 86400000 * 1),
      },
      {
        momentId: momentParty.id,
        userId: demoUser.id,
        imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&auto=format&fit=crop&q=80",
        caption: "Full house celebrating another amazing milestone in the Aliverso!",
        status: SubmissionStatus.APPROVED,
        submittedAt: new Date(Date.now() - 86400000 * 1), // 1 day ago
        reviewedBy: ali.id,
        reviewedAt: new Date(),
      },
      {
        momentId: momentParty.id,
        userId: demoUser.id,
        imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80",
        caption: "Behind the scenes photo of Ali setting up the lights for the party.",
        status: SubmissionStatus.PENDING,
        submittedAt: new Date(),
      },
    ],
  });

  console.log("Seeding finished successfully.");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
