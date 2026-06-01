import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Discord from "next-auth/providers/discord";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: UserRole;
      twoFactorEnabled: boolean;
    };
  }

  interface User {
    role?: UserRole;
    twoFactorEnabled?: boolean;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    twoFactorEnabled: boolean;
    email?: string;
    name?: string | null;
  }
}

const providerIdField = {
  discord: "discordId",
  google: "googleId",
  github: "githubId",
} as const;

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/dashboard/bot",
  },
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: { params: { scope: "identify email guilds" } },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = (credentials.email as string).trim().toLowerCase();

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user?.password) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          twoFactorEnabled: user.twoFactorEnabled,
        };
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return `${baseUrl}/dashboard`;
    },
    async jwt({ token, user, trigger, session }) {
      if (user?.id) {
        token.id = user.id;
        token.email = user.email ?? token.email;
        token.name = user.name ?? token.name;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, twoFactorEnabled: true, email: true, name: true },
        });
        token.role = dbUser?.role ?? user.role ?? "USER";
        token.twoFactorEnabled =
          dbUser?.twoFactorEnabled ?? user.twoFactorEnabled ?? false;
        if (dbUser?.email) token.email = dbUser.email;
        if (dbUser?.name) token.name = dbUser.name;
      }

      if (trigger === "update" && session) {
        token.twoFactorEnabled =
          session.twoFactorEnabled ?? token.twoFactorEnabled;
        if (session.name) token.name = session.name;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = (token.email as string) ?? session.user.email ?? "";
        session.user.name = (token.name as string) ?? session.user.name;
        session.user.role = token.role as UserRole;
        session.user.twoFactorEnabled = token.twoFactorEnabled as boolean;
      }
      return session;
    },
    // Não fazer writes no DB aqui — corre antes do adapter criar o usuário OAuth
    async signIn() {
      return true;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      try {
        await prisma.subscription.create({
          data: { userId: user.id, plan: "STARTER", status: "active" },
        });
      } catch {
        // assinatura já existe
      }
    },
    async signIn({ user, account }) {
      if (!user.id) return;

      const field =
        account?.provider &&
        providerIdField[account.provider as keyof typeof providerIdField];

      try {
        if (field && account?.providerAccountId) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              [field]: account.providerAccountId,
              ...(user.image ? { image: user.image } : {}),
            },
          });
        }

        await prisma.subscription.upsert({
          where: { userId: user.id },
          create: { userId: user.id, plan: "STARTER", status: "active" },
          update: {},
        });

        if (account?.provider !== "credentials") {
          await prisma.deviceSession.create({
            data: {
              userId: user.id,
              token: `dev_${Date.now()}_${Math.random().toString(36).slice(2)}`,
              device: account?.provider ?? "oauth",
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          });
        } else {
          await prisma.deviceSession.create({
            data: {
              userId: user.id,
              token: `dev_${Date.now()}_${Math.random().toString(36).slice(2)}`,
              device: "email",
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          });
        }
      } catch (err) {
        console.error("[auth] signIn event:", err);
      }
    },
  },
});
