import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🧹 Cleaning up PMLab database...');

  // Order matters due to foreign key constraints
  console.log('Deleting Reports...');
  await prisma.report.deleteMany({});
  
  console.log('Deleting Results...');
  await prisma.result.deleteMany({});
  
  console.log('Deleting AppointmentTests...');
  await prisma.appointmentTest.deleteMany({});
  
  console.log('Deleting Appointments...');
  await prisma.appointment.deleteMany({});
  
  console.log('Deleting Patients...');
  await prisma.patient.deleteMany({});
  
  console.log('Deleting Notifications...');
  await prisma.notification.deleteMany({});
  
  console.log('Deleting non-admin Users...');
  await prisma.user.deleteMany({
    where: {
      role: {
        not: 'ADMIN'
      }
    }
  });

  console.log('\n✨ Database cleaned! Only Admin and Reference Data (Tests/Branches) remain.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
