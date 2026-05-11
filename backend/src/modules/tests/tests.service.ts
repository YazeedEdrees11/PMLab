import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TestsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.test.create({ data });
  }

  async findAll() {
    return this.prisma.test.findMany();
  }

  async findOne(id: string) {
    return this.prisma.test.findUnique({
      where: { id },
      include: {
        results: true
      }
    });
  }

  async update(id: string, data: any) {
    return this.prisma.test.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.test.delete({ where: { id } });
  }
}
