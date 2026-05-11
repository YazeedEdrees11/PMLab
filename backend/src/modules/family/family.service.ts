import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FamilyService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { patient: true }
    });

    if (!user || !user.patient) {
      throw new NotFoundException('Patient record not found for this user');
    }

    // Convert date string to Date object if provided
    const dob = data.dob ? new Date(data.dob) : null;

    return this.prisma.familyMember.create({
      data: {
        name: data.name,
        relation: data.relation,
        nationalId: data.nationalId,
        gender: data.gender,
        dob: dob,
        patientId: user.patient.id,
      },
    });
  }

  async findAll(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { patient: true }
    });

    if (!user || !user.patient) {
      return [];
    }

    return this.prisma.familyMember.findMany({
      where: { patientId: user.patient.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(userId: string, id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { patient: true }
    });

    if (!user || !user.patient) {
      throw new NotFoundException('Patient record not found');
    }

    const result = await this.prisma.familyMember.deleteMany({
      where: { id, patientId: user.patient.id },
    });

    if (result.count === 0) {
      throw new NotFoundException('Family member not found or does not belong to you');
    }

    return { message: 'Family member removed successfully' };
  }
}
