import { prisma } from "@/lib/prisma";

export async function getOwnedServer(userId: string, serverDiscordId: string) {
  return prisma.server.findFirst({
    where: { ownerId: userId, discordId: serverDiscordId },
  });
}
