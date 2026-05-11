import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('👷 Creating Branch Admins...');

  const password = await bcrypt.hash('admin123', 10);

  const adminData = [
    { email: 'admin@pmlab.jo', branchId: null },
    { email: 'gardens@pmlab.jo', branchId: 'branch-gardens' },
    { email: 'karak@pmlab.jo', branchId: 'branch-karak' },
    { email: 'fuheis@pmlab.jo', branchId: 'branch-fuheis' },
    { email: 'khaldi@pmlab.jo', branchId: 'branch-khaldi1' },
    { email: 'shmeisani@pmlab.jo', branchId: 'branch-shmeisani1' },
  ];

  for (const data of adminData) {
    // Delete if exists to avoid conflicts
    try {
      await prisma.user.delete({ where: { email: data.email } });
    } catch (e) {}

    await prisma.user.create({
      data: {
        email: data.email,
        password,
        role: 'ADMIN',
        branchId: data.branchId,
      },
    });
    console.log(`✅ Created: ${data.email}`);
  }

  console.log('\n🎉 All branch admins are ready!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
