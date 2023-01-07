import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const main = async () => {
  prisma.$connect();
  console.log(await prisma.user.findMany());
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
