import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123456", 12);

  await prisma.user.upsert({
    where: { email: "admin@nexora.ai" },
    create: {
      email: "admin@nexora.ai",
      name: "NEXORA Admin",
      password: passwordHash,
      role: "ADMIN",
      emailVerified: new Date(),
    },
    update: {
      password: passwordHash,
      role: "ADMIN",
    },
  });

  const admin = await prisma.user.findUnique({ where: { email: "admin@nexora.ai" } });
  if (admin) {
    await prisma.subscription.upsert({
      where: { userId: admin.id },
      create: { userId: admin.id, plan: "ENTERPRISE", status: "active" },
      update: { plan: "ENTERPRISE", status: "active" },
    });
  }

  await prisma.liveMetric.upsert({
    where: { id: "global" },
    create: {
      id: "global",
      onlineUsers: 2847,
      requestsPerMin: 12453,
      eventsProcessed: 892,
    },
    update: {
      onlineUsers: 2847,
      requestsPerMin: 12453,
      eventsProcessed: 892,
    },
  });

  console.log("Seed OK — admin@nexora.ai / admin123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
