import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@sitesfy.ai" },
    update: {},
    create: {
      email: "admin@sitesfy.ai",
      name: "Admin",
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Seeded admin user:", admin.email);

  // Seed the default proposal template CSS
  const templateExists = await prisma.proposalTemplate.findFirst({
    where: { name: "默认模板 v1" },
  });

  if (!templateExists) {
    await prisma.proposalTemplate.create({
      data: {
        name: "默认模板 v1",
        cssContent: "/* Will be populated from Sitesfy_x_LCSC_Proposal.html */",
        htmlSkeleton: "<!-- Will be populated from Sitesfy_x_LCSC_Proposal.html -->",
        placeholders: [],
        isLocked: true,
      },
    });
    console.log("Seeded default proposal template");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
