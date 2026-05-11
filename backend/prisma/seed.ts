import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding PMLab database...');

  // 1. Create Branches
  const branches = await Promise.all([
    prisma.branch.upsert({
      where: { id: 'branch-gardens' },
      update: {},
      create: { id: 'branch-gardens', name: 'Gardens', nameAr: 'الجاردنز', mapUrl: 'https://goo.gl/maps/asvFww5e4cCyeooA7', phone: '+962770780788' },
    }),
    prisma.branch.upsert({
      where: { id: 'branch-shmeisani1' },
      update: {},
      create: { id: 'branch-shmeisani1', name: 'Shmeisani 1', nameAr: 'الشميساني 1', mapUrl: 'https://www.google.com/maps?q=31.9797644,35.900452', phone: '+962799130409' },
    }),
    prisma.branch.upsert({
      where: { id: 'branch-shmeisani2' },
      update: {},
      create: { id: 'branch-shmeisani2', name: 'Shmeisani 2', nameAr: 'الشميساني 2', mapUrl: 'https://www.google.com/maps?q=31.9797644,35.900452', phone: '+962799127570' },
    }),
    prisma.branch.upsert({
      where: { id: 'branch-khaldi1' },
      update: {},
      create: { id: 'branch-khaldi1', name: 'Khaldi 1', nameAr: 'الخالدي 1', mapUrl: 'https://g.page/PMLab?share', phone: '+962795107110' },
    }),
    prisma.branch.upsert({
      where: { id: 'branch-khaldi2' },
      update: {},
      create: { id: 'branch-khaldi2', name: 'Khaldi 2', nameAr: 'الخالدي 2', mapUrl: 'https://goo.gl/maps/7NhukpUaH6YWnuQG6', phone: '+962796155090' },
    }),
    prisma.branch.upsert({
      where: { id: 'branch-fuheis' },
      update: {},
      create: { id: 'branch-fuheis', name: 'Fuheis', nameAr: 'الفحيص', mapUrl: 'https://g.page/PmlabFuhais?share', phone: '+962798400449' },
    }),
    prisma.branch.upsert({
      where: { id: 'branch-karak' },
      update: {},
      create: { id: 'branch-karak', name: 'Karak', nameAr: 'الكرك', mapUrl: 'https://goo.gl/maps/QqRENVYTJbn4eNDD8', phone: '+962776696669' },
    }),
    prisma.branch.upsert({
      where: { id: 'branch-jerash' },
      update: {},
      create: { id: 'branch-jerash', name: 'Jerash', nameAr: 'جرش', mapUrl: 'https://goo.gl/maps/JerashLocationLink', phone: '+962791112223' },
    }),
  ]);
  console.log(`✅ ${branches.length} branches seeded`);

  // 2. Create Lab Tests
  const tests = await Promise.all([
    prisma.test.upsert({ where: { id: 'test-cbc' }, update: {}, create: { id: 'test-cbc', name: 'Complete Blood Count (CBC)', nameAr: 'فحص تعداد الدم الكامل', price: 15, description: 'Measures red/white blood cells, platelets, and hemoglobin.' } }),
    prisma.test.upsert({ where: { id: 'test-lipid' }, update: {}, create: { id: 'test-lipid', name: 'Lipid Panel', nameAr: 'فحص الدهنيات', price: 20, description: 'Cholesterol and triglyceride levels.' } }),
    prisma.test.upsert({ where: { id: 'test-thyroid' }, update: {}, create: { id: 'test-thyroid', name: 'Thyroid Function Test', nameAr: 'فحص وظائف الغدة الدرقية', price: 25, description: 'TSH, T3, T4 levels.' } }),
    prisma.test.upsert({ where: { id: 'test-liver' }, update: {}, create: { id: 'test-liver', name: 'Liver Function Test', nameAr: 'فحص وظائف الكبد', price: 22, description: 'ALT, AST, and bilirubin.' } }),
    prisma.test.upsert({ where: { id: 'test-kidney' }, update: {}, create: { id: 'test-kidney', name: 'Kidney Function Test', nameAr: 'فحص وظائف الكلى', price: 22, description: 'Creatinine, BUN, and eGFR.' } }),
    prisma.test.upsert({ where: { id: 'test-glucose' }, update: {}, create: { id: 'test-glucose', name: 'Blood Sugar (Glucose)', nameAr: 'فحص السكر في الدم', price: 8, description: 'Fasting blood glucose level.' } }),
    prisma.test.upsert({ where: { id: 'test-vitd' }, update: {}, create: { id: 'test-vitd', name: 'Vitamin D Test', nameAr: 'فحص فيتامين د', price: 18, description: '25-hydroxy vitamin D level.' } }),
    prisma.test.upsert({ where: { id: 'test-iron' }, update: {}, create: { id: 'test-iron', name: 'Iron Studies', nameAr: 'دراسات الحديد', price: 20, description: 'Serum iron, ferritin, TIBC.' } }),
  ]);
  console.log(`✅ ${tests.length} tests seeded`);

  // 3. Create demo Admin users (Super and Branch specific)
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  const adminsData = [
    { email: 'admin@pmlab.jo', branchId: null, label: 'Super Admin' },
    { email: 'gardens@pmlab.jo', branchId: 'branch-gardens', label: 'Gardens Admin' },
    { email: 'karak@pmlab.jo', branchId: 'branch-karak', label: 'Karak Admin' },
    { email: 'fuheis@pmlab.jo', branchId: 'branch-fuheis', label: 'Fuheis Admin' },
    { email: 'khaldi@pmlab.jo', branchId: 'branch-khaldi1', label: 'Khaldi Admin' },
    { email: 'shmeisani@pmlab.jo', branchId: 'branch-shmeisani1', label: 'Shmeisani Admin' },
    { email: 'jerash@pmlab.jo', branchId: 'branch-jerash', label: 'Jerash Admin' },
  ];

  for (const admin of adminsData) {
    await prisma.user.upsert({
      where: { email: admin.email },
      update: { branchId: admin.branchId, role: 'ADMIN' },
      create: {
        email: admin.email,
        password: adminPassword,
        role: 'ADMIN',
        branchId: admin.branchId,
      },
    });
    console.log(`✅ ${admin.label} seeded: ${admin.email}`);
  }

  console.log('\n🎉 Seeding complete! Database is clean and ready for real users.');
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
