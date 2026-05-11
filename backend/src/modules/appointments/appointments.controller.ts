import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, HttpException, HttpStatus, Query } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req: any, @Body() body: any) {
    try {
      console.log('--- NEW BOOKING REQUEST ---');
      console.log('User from req:', req.user);
      console.log('Body:', body);
      
      const patientId = req.user?.patientId || body.patientId;
      console.log('Resolved patientId:', patientId);
      
      const result = await this.appointmentsService.create({
        patientId,
        ...body,
      });
      console.log('--- BOOKING SUCCESS ---');
      return result;
    } catch (error: any) {
      console.error('--- BOOKING FAILED ---');
      console.error(error);
      throw new HttpException(error.message || String(error), HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  findMine(@Request() req: any) {
    return this.appointmentsService.findByPatient(req.user.patientId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('branchId') branchId?: string,
    @Query('date') date?: string,
  ) {
    // Branch Admins (with branchId) can ONLY see their own branch stats
    let targetBranchId = branchId;
    if (req.user.branchId !== null) {
      targetBranchId = req.user.branchId;
    }

    return this.appointmentsService.findAll({ 
      branchId: targetBranchId, 
      status, 
      date 
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.appointmentsService.update(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}
