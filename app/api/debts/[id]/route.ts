import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // 👈 FIX

    const debtId = parseInt(id);

    await prisma.debt.delete({
      where: { id: debtId },
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch (err) {
    console.error(err);
    return new Response("Failed to delete debt", { status: 500 });
  }
}