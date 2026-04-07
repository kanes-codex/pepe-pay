import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = parseInt(searchParams.get("userId") || "0");

    const debts = await prisma.debt.findMany({
      where: {
        fromId: userId, // 👈 user owes money
      },
      include: {
        to: true, // who they owe
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return Response.json(debts);
  } catch (err) {
    console.error(err);
    return new Response("Failed to fetch reminders", { status: 500 });
  }
}