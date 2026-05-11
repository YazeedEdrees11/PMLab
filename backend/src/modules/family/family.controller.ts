import { Controller, Get, Post, Body, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { FamilyService } from './family.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('family')
@UseGuards(JwtAuthGuard)
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Post()
  create(@Request() req: any, @Body() data: any) {
    return this.familyService.create(req.user.id, data);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.familyService.findAll(req.user.id);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.familyService.remove(req.user.id, id);
  }
}
