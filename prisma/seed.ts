import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Hash password
  const passwordHash = await bcrypt.hash('Password@123!', 10);

  // Create first admin user
  const user1 = await prisma.user.upsert({
    where: { email: 'jbandu@gmail.com' },
    update: {},
    create: {
      email: 'jbandu@gmail.com',
      passwordHash,
      firstName: 'Jayaprakash',
      lastName: 'Bandu',
      role: 'admin',
      profile: {
        create: {
          preferences: {
            preferredCabinClass: 'business',
            preferredAirlines: ['UA', 'DL', 'AA'],
            seatPreference: 'window',
            notificationPreferences: {
              email: true,
              sms: true,
              push: true,
            },
          },
        },
      },
    },
  });

  console.log(`✅ Created admin user: ${user1.email}`);

  // Create second admin user
  const user2 = await prisma.user.upsert({
    where: { email: 'arindam2808@gmail.com' },
    update: {},
    create: {
      email: 'arindam2808@gmail.com',
      passwordHash,
      firstName: 'Arindam',
      lastName: 'Mukherjee',
      role: 'admin',
      profile: {
        create: {
          preferences: {
            preferredCabinClass: 'business',
            preferredAirlines: ['UA', 'BA', 'LH'],
            seatPreference: 'aisle',
            notificationPreferences: {
              email: true,
              sms: false,
              push: true,
            },
          },
        },
      },
    },
  });

  console.log(`✅ Created admin user: ${user2.email}`);

  console.log('🎉 Seeding completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
