import { ConflictException, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User, UserRole } from '../user/entities/user.entity';
import { UserSession } from '../user/entities/user-session.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(UserSession)
    private readonly userSessionRepository: Repository<UserSession>,
  ) {}

  // Standard user registration (forces 'user' role)
  async register(registerDto: RegisterDto): Promise<User> {
    const { username, password } = registerDto;

    const existingUser = await this.userService.findByUsername(username);
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userService.create({
      username,
      password: hashedPassword,
      role: UserRole.USER, // Forced standard user role
    });

    return user;
  }

  // Secure admin creation
  async registerAdmin(registerDto: RegisterDto): Promise<User> {
    const { username, password } = registerDto;

    const existingUser = await this.userService.findByUsername(username);
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userService.create({
      username,
      password: hashedPassword,
      role: UserRole.ADMIN, // Forced admin role
    });

    return user;
  }

  async login(
    loginDto: LoginDto,
    ipAddress?: string,
    deviceName?: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const { username, password } = loginDto;

    // Fetch user with password explicitly
    const user = await this.userService.findByUsernameWithPassword(username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 1. Create a skeleton session record first to generate UUID
    const session = this.userSessionRepository.create({
      user,
      ipAddress,
      deviceName,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      hashedRefreshToken: '', // placeholder
    });
    const savedSession = await this.userSessionRepository.save(session);

    // 2. Generate tokens using the session's ID as sid
    const tokens = await this.generateTokens(user.id, user.username, user.role, savedSession.id);

    // 3. Hash and save the refresh token to the session record
    const hashedRefreshToken = await bcrypt.hash(tokens.refresh_token, 10);
    savedSession.hashedRefreshToken = hashedRefreshToken;
    await this.userSessionRepository.save(savedSession);

    return tokens;
  }

  // Verifies the refresh token signature, checks DB session, and rotates both tokens
  async refresh(
    refreshToken: string,
    ipAddress?: string,
    deviceName?: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET') || 'defaultSecretKey',
      });

      const userId = payload.sub;
      const sessionId = payload.sid;

      if (!sessionId) {
        throw new ForbiddenException('Access Denied');
      }

      // Fetch the specific session associated with this token
      const session = await this.userSessionRepository.findOne({
        where: { id: sessionId },
        relations: { user: true },
      });

      if (!session || session.isRevoked || session.expiresAt < new Date()) {
        throw new ForbiddenException('Access Denied');
      }

      // Make sure the session belongs to the user in the payload
      if (session.user.id !== userId) {
        throw new ForbiddenException('Access Denied');
      }

      const refreshTokenMatches = await bcrypt.compare(
        refreshToken,
        session.hashedRefreshToken,
      );
      if (!refreshTokenMatches) {
        throw new ForbiddenException('Access Denied');
      }

      // Generate a new set of tokens keeping the same session ID
      const tokens = await this.generateTokens(session.user.id, session.user.username, session.user.role, session.id);

      // Rotate: save the new hashed refresh token and update metadata
      const hashedToken = await bcrypt.hash(tokens.refresh_token, 10);
      session.hashedRefreshToken = hashedToken;
      session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // extend session expiry
      if (ipAddress) session.ipAddress = ipAddress;
      if (deviceName) session.deviceName = deviceName;
      await this.userSessionRepository.save(session);

      return tokens;
    } catch (err) {
      throw new ForbiddenException('Access Denied');
    }
  }

  // Generates JWT token pair
  private async generateTokens(userId: number, username: string, role: string, sessionId?: string) {
    const payload = { sub: userId, username, role };
    // Include sid only in refresh token payload to keep access token light
    const refreshPayload = { ...payload, sid: sessionId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET') || 'defaultSecretKey',
        expiresIn: (this.configService.get<string>('JWT_EXPIRATION') || '3600s') as any,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.configService.get<string>('JWT_SECRET') || 'defaultSecretKey',
        expiresIn: '7d' as any, // Refresh token is long-lived
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
