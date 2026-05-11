import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PushService } from '../notifications/push.service';

import { StorageService } from '../storage/storage.service';

@Injectable()
export class ResultsService {
  constructor(
    private prisma: PrismaService,
    private pushService: PushService,
    private storageService: StorageService
  ) {}

  async create(data: any) {
    if (data.appointmentId && data.testId) {
      const existingResult = await this.prisma.result.findFirst({
        where: {
          appointmentId: data.appointmentId,
          testId: data.testId
        }
      });
      if (existingResult) {
        throw new Error('نتيجة هذا الفحص مرفوعة مسبقاً لهذا الحجز');
      }
    }

    const result = await this.prisma.result.create({ 
      data,
      include: {
        patient: { select: { userId: true, name: true } },
        test: { select: { name: true, nameAr: true } }
      }
    });

    const testName = result.test?.nameAr || result.test?.name || 'فحص جديد';
    const title = 'نتيجة فحص جاهزة 📄';
    const body = `مرحباً ${result.patient.name}، نتيجتك لـ "${testName}" أصبحت جاهزة ومتاحة الآن في التطبيق.`;

    await this.pushService.sendPushNotification(result.patient.userId, title, body, { resultId: result.id });

    return result;
  }

  async findAll() {
    return this.prisma.result.findMany({
      include: {
        patient: { select: { name: true } },
        test: { select: { name: true, nameAr: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByPatient(patientId: string) {
    const results = await this.prisma.result.findMany({
      where: { patientId },
      include: {
        test: true,
        reports: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Generate signed URLs for each result
    return Promise.all(results.map(async (r) => ({
      ...r,
      fileUrl: r.fileUrl ? await this.storageService.getSignedUrl(r.fileUrl) : null
    })));
  }

  async findOne(id: string) {
    const result = await this.prisma.result.findUnique({
      where: { id },
      include: {
        patient: true,
        test: true,
        reports: true,
      },
    });

    if (result && result.fileUrl) {
      result.fileUrl = await this.storageService.getSignedUrl(result.fileUrl);
    }

    return result;
  }

  async update(id: string, data: any) {
    return this.prisma.result.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.result.delete({ where: { id } });
  }
}
