import { Controller, Post, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('register')
  register(@Body() body: { email: string; password: string; name: string; phone?: string; nationalId?: string }) {
    return this.authService.register(body);
  }

  @Post('forgot-password')
  forgotPassword(@Body() body: { email: string }) {
    // In a real app, this would generate a token and send an email
    // For now, just return success so the frontend flow works
    console.log(`Password reset requested for: ${body.email}`);
    return { message: 'Password reset link sent successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('avatar')
  updateAvatar(@Request() req: any, @Body() body: { avatarUrl: string }) {
    return this.authService.updateAvatar(req.user.id, body.avatarUrl);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(@Request() req: any, @Body() body: { name?: string; email?: string; currentPassword?: string; newPassword?: string }) {
    return this.authService.updateProfile(req.user.id, body);
  }
}
