import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const tickets = await prisma.ticket.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ tickets });
}

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { subject, description, department, priority } = await request.json();

  const slaHours = priority === "CRITICAL" ? 1 : priority === "HIGH" ? 4 : priority === "MEDIUM" ? 24 : 48;

  const ticket = await prisma.ticket.create({
    data: {
      subject,
      description,
      department: department ?? "Suporte",
      priority: priority ?? "MEDIUM",
      userId: session!.user.id,
      slaDeadline: new Date(Date.now() + slaHours * 60 * 60 * 1000),
    },
  });

  return NextResponse.json({ ticket }, { status: 201 });
}

export async function PATCH(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id, status, priority } = await request.json();

  const ticket = await prisma.ticket.updateMany({
    where: { id, userId: session!.user.id },
    data: { status, priority },
  });

  return NextResponse.json({ ticket });
}
