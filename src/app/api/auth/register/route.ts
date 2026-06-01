import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const { name, email, password } = await request.json();

  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !password || password.length < 8) {
    return NextResponse.json(
      { error: "Email and password (min 8 chars) required" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      name: name ?? null,
      password: passwordHash,
      role: "USER",
    },
  });

  await prisma.subscription.create({
    data: { userId: user.id, plan: "STARTER", status: "active" },
  });

  return NextResponse.json({ ok: true, userId: user.id }, { status: 201 });
}
