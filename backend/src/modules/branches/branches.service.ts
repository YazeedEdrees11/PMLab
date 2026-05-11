import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.branch.findMany({
      include: {
        _count: {
          select: {
            staff: true,
            appointments: true,
          }
        }
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.branch.findUnique({ where: { id } });
  }

  async create(data: any) {
    return this.prisma.branch.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.branch.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.branch.delete({
      where: { id },
    });
  }
}
