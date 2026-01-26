import { PrismaClient, UserWorkFormat, UserStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.userProject.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleaned existing data');

  // Create an example user
  const exampleUser = await prisma.user.create({
    data: {
      email: 'john.doe@example.com',
      realName: 'John Doe',
      username: 'john_doe',
      discordId: '123456789012345678',
      status: UserStatus.ACTIVE,
      workFormat: UserWorkFormat.FULL_TIME,
    },
  });

  console.log(`✅ Created example user: ${exampleUser.username}`);

  // TODO: Add more users here
  console.log('\n✨ Seeding completed!');
}

main()
  .catch(e => {
    console.error('❌ Error seeding database:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
