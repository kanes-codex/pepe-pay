import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { itemId, userId } = await req.json();

  const assignment = await prisma.assignment.upsert({
    where: { itemId },
    update: { userId },
    create: { itemId, userId },
  });

  return NextResponse.json(assignment);
}