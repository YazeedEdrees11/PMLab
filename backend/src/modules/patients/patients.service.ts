import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.patient.create({ data });
  }

  async findAll() {
    return this.prisma.patient.findMany({
      include: {
        user: { select: { email: true, role: true, avatarUrl: true } },
        _count: {
          select: { appointments: true }
        }
      }
    });
  }

  async findOne(id: string) {
    return this.prisma.patient.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, role: true, avatarUrl: true } },
        appointments: true,
        results: true,
      }
    });
  }

  async update(id: string, data: any) {
    return this.prisma.patient.update({ where: { id }, data });
  }

  async updateMyProfile(userId: string, data: any) {
    try {
      const patient = await this.prisma.patient.findUnique({
        where: { userId }
      });

      if (!patient) {
        throw new BadRequestException('Patient not found');
      }

      const { currentPassword, newPassword, name, phone, address } = data;

      // Password Update Logic
      if (currentPassword && newPassword) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new BadRequestException('User not found');
        
        const passwordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!passwordMatch) {
          throw new BadRequestException('كلمة المرور الحالية غير صحيحة');
        }
        const hashed = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({
          where: { id: userId },
          data: { password: hashed, name }
        });
      } else {
        await this.prisma.user.update({
          where: { id: userId },
          data: { name }
        });
      }

      // Patient Update Logic
      return await this.prisma.patient.update({
        where: { id: patient.id },
        data: { name, phone, address }
      });
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Internal Error');
    }
  }

  async remove(id: string) {
    return this.prisma.patient.delete({ where: { id } });
  }
}
