import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { debts } = await req.json();

  await prisma.debt.createMany({
    data: debts.map((d: any) => ({
      fromId: d.fromId,
      toId: d.toId,
      amount: d.amount,
    })),
  });

  return Response.json({ success: true });
}