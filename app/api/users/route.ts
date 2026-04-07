import { prisma } from "@/lib/prisma";

export async function GET() {
  console.log("API DATABASE_URL:", process.env.DATABASE_URL);
  const users = await prisma.user.findMany();
  return Response.json(users);
}