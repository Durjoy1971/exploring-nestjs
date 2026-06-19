import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Ip, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User, UserRole } from '../user/entities/user.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Throttle } from '@nestjs/throttler';
import { LoginThrottlerGuard } from './guards/login-throttler.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<User> {
    return await this.authService.register(registerDto);
  }

  @Post('register-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async registerAdmin(@Body() registerDto: RegisterDto): Promise<User> {
    return await this.authService.registerAdmin(registerDto);
  }

  @Post('login')
  @UseGuards(LoginThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    return await this.authService.login(loginDto, ipAddress, userAgent);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body('refresh_token') refreshToken: string,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    return await this.authService.refresh(refreshToken, ipAddress, userAgent);
  }
}
