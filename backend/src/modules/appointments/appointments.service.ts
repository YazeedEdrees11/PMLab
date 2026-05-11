import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { PushService } from '../notifications/push.service';

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    private pushService: PushService
  ) {}

  async create(data: {
    patientId?: string;
    patientInfo?: {
      name: string;
      email: string;
      phone: string;
      nationalId?: string;
    };
    branchId?: string;
    date: string;
    time?: string;
    homeVisit?: boolean;
    latitude?: number;
    longitude?: number;
    address?: string;
    testIds: string[];
    notes?: string;
  }) {
    let finalPatientId = data.patientId;

    // If no patientId but we have info, find or create
    if (!finalPatientId && data.patientInfo) {
      // 1. Check if user already exists by email
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.patientInfo.email },
        include: { patient: true }
      });

      if (existingUser) {
        if (existingUser.patient) {
          finalPatientId = existingUser.patient.id;
        } else {
          // User exists but has no patient profile, create one
          const newPatient = await this.prisma.patient.create({
            data: {
              userId: existingUser.id,
              name: data.patientInfo.name,
              phone: data.patientInfo.phone,
              nationalId: data.patientInfo.nationalId
            }
          });
          finalPatientId = newPatient.id;
        }
      } else {
        // 2. User doesn't exist. Check if patient exists by phone or nationalId
        const orConditions: any[] = [{ phone: data.patientInfo.phone }];
        if (data.patientInfo.nationalId) {
          orConditions.push({ nationalId: data.patientInfo.nationalId });
        }

        const existingPatient = await this.prisma.patient.findFirst({
          where: { OR: orConditions }
        });

        if (existingPatient) {
          finalPatientId = existingPatient.id;
        } else {
          // 3. Create User and Patient safely
          const hashedPassword = await bcrypt.hash(data.patientInfo.phone, 10);
          const newUser = await this.prisma.user.create({
            data: {
              email: data.patientInfo.email,
              password: hashedPassword,
              role: 'PATIENT',
              patient: {
                create: {
                  name: data.patientInfo.name,
                  phone: data.patientInfo.phone,
                  nationalId: data.patientInfo.nationalId
                }
              }
            },
            include: { patient: true }
          });
          finalPatientId = newUser.patient!.id;
        }
      }
    }

    if (!finalPatientId) {
      throw new Error('Patient identification required');
    }

    // Calculate total price
    const tests = await this.prisma.test.findMany({
      where: { id: { in: data.testIds } },
    });
    const totalPrice = tests.reduce((sum, t) => sum + (t.price || 0), 0);

    const appointment = await this.prisma.appointment.create({
      data: {
        patientId: finalPatientId,
        branchId: data.branchId || null,
        date: new Date(data.date),
        time: data.time || null,
        homeVisit: data.homeVisit || false,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        address: data.address || null,
        totalPrice,
        notes: data.notes || null,
        testItems: {
          create: data.testIds.map((testId) => ({ testId })),
        },
      },
      include: {
        branch: true,
        testItems: { include: { test: true } },
        patient: { select: { userId: true } }
      },
    });

    // Send confirmation notification
    const title = 'تم استلام طلب الحجز 📥';
    const body = 'لقد تلقينا طلب حجزك بنجاح. سيتم مراجعته وتأكيده من قبل فريقنا قريباً.';
    await this.pushService.sendPushNotification(appointment.patient.userId, title, body, { appointmentId: appointment.id });

    return appointment;
  }

  async findAll(filters: { branchId?: string; status?: string; date?: string } = {}) {
    const where: any = {};
    if (filters.branchId) {
      where.branchId = filters.branchId;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.date) {
      const targetDate = new Date(filters.date);
      where.date = {
        gte: new Date(targetDate.setHours(0, 0, 0, 0)),
        lte: new Date(targetDate.setHours(23, 59, 59, 999)),
      };
    }

    return this.prisma.appointment.findMany({
      where,
      include: {
        patient: true,
        branch: true,
        testItems: { include: { test: true } },
        results: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { date: 'desc' },
    });
  }

  async findByPatient(patientId: string) {
    return this.prisma.appointment.findMany({
      where: { patientId },
      include: {
        branch: true,
        testItems: { include: { test: true } },
        results: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        branch: true,
        testItems: { include: { test: true } },
        results: true,
      },
    });
  }

  async update(id: string, data: any) {
    const appointment = await this.prisma.appointment.update({ 
      where: { id }, 
      data,
      include: { patient: { select: { userId: true } } }
    });

    if (data.status) {
      let title = 'تحديث حالة الموعد';
      let body = `تم تحديث حالة موعدك إلى: ${data.status}`;
      
      if (data.status === 'CONFIRMED') {
        title = 'تم تأكيد موعدك ✅';
        body = 'موعدك القادم مع مختبرنا أصبح مؤكداً. نتمنى لك دوام الصحة!';
      } else if (data.status === 'COMPLETED') {
        title = 'اكتمل الموعد 🧪';
        body = 'تم سحب العينات بنجاح، سنقوم بإعلامك فور صدور النتائج.';
      }

      await this.pushService.sendPushNotification(appointment.patient.userId, title, body, { appointmentId: id });
    }

    return appointment;
  }

  async remove(id: string) {
    return this.prisma.appointment.delete({ where: { id } });
  }
}
