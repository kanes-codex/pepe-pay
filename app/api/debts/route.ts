
import { sendDiscordMessage } from "@/lib/discord";
import { prisma } from "@/lib/prisma";
import { REMINDER_TEMPLATES } from "@/lib/remindersTemplates";

export async function POST(req: Request) {
  const { debts } = await req.json();

  await prisma.debt.createMany({
    data: debts.map((d: any) => ({
      fromId: d.fromId,
      toId: d.toId,
      amount: d.amount,
    })),
  });

  for (const debt of debts) {
    const randomTemplate =
      REMINDER_TEMPLATES[Math.floor(Math.random() * REMINDER_TEMPLATES.length)];

    const amount = Number(debt.amount) || 0;

    const message = `💸 ${debt.fromName} owes £${amount.toFixed(
      2
    )}. ${randomTemplate.message} <@463840025042223114>`;

    console.log(randomTemplate);

    await sendDiscordMessage(message);
  }

  return Response.json({ success: true });
}