import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  generateTwoFactorSecret,
  generateQRCode,
  verifyTwoFactorToken,
} from "@/lib/two-factor";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { twoFactorEnabled: true },
  });

  return NextResponse.json({ enabled: user?.twoFactorEnabled ?? false });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action, token } = await request.json();

  if (action === "setup") {
    const { secret, uri } = generateTwoFactorSecret(session.user.email);
    const qrCode = await generateQRCode(uri);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { twoFactorSecret: secret },
    });

    return NextResponse.json({ secret, qrCode });
  }

  if (action === "verify") {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user?.twoFactorSecret) {
      return NextResponse.json({ error: "Setup 2FA first" }, { status: 400 });
    }

    const valid = verifyTwoFactorToken(user.twoFactorSecret, token);
    if (!valid) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { twoFactorEnabled: true },
    });

    return NextResponse.json({ enabled: true });
  }

  if (action === "disable") {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user?.twoFactorSecret || !verifyTwoFactorToken(user.twoFactorSecret, token)) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
    });

    return NextResponse.json({ enabled: false });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
