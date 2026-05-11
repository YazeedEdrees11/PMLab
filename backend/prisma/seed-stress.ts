import { PrismaClient, Role, AppointmentStatus, TestStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🚀 Starting Stress Test Seeding...');

  // 1. Create Branches (10)
  console.log('🏥 Creating 10 Branches...');
  const branches = [];
  for (let i = 0; i < 10; i++) {
    const branch = await prisma.branch.create({
      data: {
        name: `PMLab Branch ${faker.location.city()}`,
        nameAr: `فرع ${faker.person.firstName()}`,
        phone: faker.phone.number(),
        mapUrl: 'https://maps.app.goo.gl/example',
      }
    });
    branches.push(branch);
  }

  // 2. Create Staff (50)
  console.log('🧑‍⚕️ Creating 50 Staff Members...');
  for (let i = 0; i < 50; i++) {
    await prisma.user.create({
      data: {
        email: faker.internet.email(),
        password: 'password123', // In real app, hash it
        role: Role.STAFF,
        name: faker.person.fullName(),
        branchId: branches[Math.floor(Math.random() * branches.length)].id,
      }
    });
  }

  // 3. Create Tests (20)
  console.log('🧪 Creating 20 Test Types...');
  const tests = [];
  const testNames = ['CBC', 'Liver Function', 'Kidney Function', 'Vitamin D', 'TSH', 'Glucose', 'Lipid Profile', 'PCR', 'Iron', 'Urine Analysis'];
  for (const name of testNames) {
    const t = await prisma.test.create({
      data: {
        name,
        nameAr: name, // Simplified
        price: faker.number.float({ min: 10, max: 100, fractionDigits: 2 }),
        description: faker.lorem.sentence(),
      }
    });
    tests.push(t);
  }

  // 4. Create Patients (200)
  console.log('👥 Creating 200 Patients...');
  const patientIds = [];
  for (let i = 0; i < 200; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email().toLowerCase(),
        password: 'password123',
        role: Role.PATIENT,
        name: faker.person.fullName(),
      }
    });
    const patient = await prisma.patient.create({
      data: {
        userId: user.id,
        name: user.name!,
        phone: faker.phone.number(),
        nationalId: faker.string.numeric(10),
        gender: faker.helpers.arrayElement(['MALE', 'FEMALE']),
        address: faker.location.streetAddress(),
      }
    });
    patientIds.push(patient.id);
  }

  // 5. Create Appointments (500)
  console.log('📅 Creating 500 Appointments...');
  for (let i = 0; i < 500; i++) {
    const patientId = faker.helpers.arrayElement(patientIds);
    const branchId = faker.helpers.arrayElement(branches).id;
    const status = faker.helpers.arrayElement([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED]);
    
    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        branchId,
        status,
        date: faker.date.recent({ days: 30 }),
        time: '10:00 AM',
        totalPrice: faker.number.float({ min: 50, max: 500 }),
      }
    });

    // Create results for completed appointments
    if (status === AppointmentStatus.COMPLETED) {
      await prisma.result.create({
        data: {
          patientId,
          appointmentId: appointment.id,
          testId: faker.helpers.arrayElement(tests).id,
          status: TestStatus.READY,
          fileUrl: 'https://example.com/result.pdf',
        }
      });
    }
  }

  console.log('✅ Stress Test Data Seeded Successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
