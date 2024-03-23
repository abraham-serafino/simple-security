import { PrismaClient } from '@prisma/client';
import * as process from 'process';

// initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  // create dummy user
  const post1 = await prisma.user.upsert({
    where: { email: 'test_user1@example.com' },
    update: {},
    create: {
      email: 'test_user1@example.com',
      password: 'Test_Password1',
    },
  });

  console.log({ post1 });
}

// execute the main function
(async () => {
  try {
    await main();
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
