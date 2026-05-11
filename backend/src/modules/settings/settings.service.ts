import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getAllSettings() {
    const settings = await this.prisma.setting.findMany();
    // Convert array of {key, value} to object
    const obj = settings.reduce((acc: any, curr: any) => {
      let val: any = curr.value;
      if (val === 'true') val = true;
      else if (val === 'false') val = false;
      acc[curr.key] = val;
      return acc;
    }, {} as Record<string, any>);

    // Default settings if empty
    return {
      labName: obj.labName || "PMLab - Precision Medical Lab",
      email: obj.email || "contact@pmlab.jo",
      phone: obj.phone || "+962 79 000 0000",
      address: obj.address || "Amman, Jordan",
      heroTitle: obj.heroTitle || "Precision Medical Laboratory",
      heroSubtitle: obj.heroSubtitle || "Accurate Results, Better Health. We provide the most advanced medical testing services.",
      enableSms: obj.enableSms !== undefined ? obj.enableSms : true,
      enableEmail: obj.enableEmail !== undefined ? obj.enableEmail : true,
    };
  }

  async updateSettings(data: Record<string, any>) {
    const promises = Object.entries(data).map(([key, value]) => {
      return this.prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      });
    });

    await Promise.all(promises);
    return this.getAllSettings();
  }
}
