const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();
async function main() {
  try {
    await db.category.createMany({
      data: [
        { name: "Personnalités célèbres" },
        { name: "Films & Séries" },
        { name: "Musiciens" },
        { name: "Jeux" },
        { name: "Animaux" },
        { name: "Philosophes" },
        { name: "Scientifiques" },
      ],
    });
  } catch (e) {
    console.error("Error seeding default categories", e);
  } finally {
    await db.$disconnect();
  }
}

main();
