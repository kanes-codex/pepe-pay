import { prisma } from "../lib/prisma";

async function main() {
  // Delete existing users (optional, useful for repeated testing)
  await prisma.debt.deleteMany({});
  await prisma.assignment.deleteMany({});
  await prisma.item.deleteMany({});
  await prisma.receipt.deleteMany({});
  await prisma.user.deleteMany({});

  // Add two users
  const user1 = await prisma.user.create({
    data: {
      name: "Kane",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: "Alice",
    },
  });

  console.log("Created users:", { user1, user2 });
}

main()
  .then(() => {
    console.log("✅ Seed complete");
    prisma.$disconnect();
  })
  .catch((err) => {
    console.error(err);
    prisma.$disconnect();
  });