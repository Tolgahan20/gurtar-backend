import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../users/entities/user.entity';
import { EmailVerification } from '../entities/email-verification.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { TokenBlacklist } from '../entities/token-blacklist.entity';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { TokenResponse } from '../interfaces/token-response.interface';
import { GoogleRequest } from '../interfaces/google-request.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(EmailVerification)
    private readonly emailVerificationRepository: Repository<EmailVerification>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(TokenBlacklist)
    private readonly tokenBlacklistRepository: Repository<TokenBlacklist>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private async generateTokens(user: User): Promise<TokenResponse> {
    const accessTokenExpiration = this.configService.get<number>(
      'jwt.accessTokenExpiration',
      3600,
    );
    const refreshTokenExpiration = this.configService.get<number>(
      'jwt.refreshTokenExpiration',
      604800,
    ); // 7 days

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: user.id, email: user.email, role: user.role },
        {
          expiresIn: accessTokenExpiration,
        },
      ),
      this.jwtService.signAsync(
        { sub: user.id },
        {
          expiresIn: refreshTokenExpiration,
        },
      ),
    ]);

    // Store refresh token
    const refreshTokenEntity = this.refreshTokenRepository.create({
      token: refreshToken,
      user,
      expires_at: new Date(Date.now() + refreshTokenExpiration * 1000),
    });
    await this.refreshTokenRepository.save(refreshTokenEntity);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: accessTokenExpiration,
    };
  }

  async register(registerDto: RegisterDto): Promise<TokenResponse> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = await this.userRepository.save(
      this.userRepository.create({
        email: registerDto.email,
        password_hash: hashedPassword,
        full_name: registerDto.full_name,
        phone_number: registerDto.phone_number,
        profile_image_url: registerDto.profile_image_url,
      }),
    );

    // Create email verification token
    const verification = this.emailVerificationRepository.create({
      user,
      token: uuidv4(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });
    await this.emailVerificationRepository.save(verification);

    // TODO: Send verification email

    return this.generateTokens(user);
  }

  async verifyEmail(token: string, req: Request): Promise<void> {
    const verification = await this.emailVerificationRepository.findOne({
      where: { token },
      relations: ['user'],
    });

    if (!verification) {
      throw new NotFoundException('Verification token not found');
    }

    if (verification.is_verified) {
      throw new BadRequestException('Email already verified');
    }

    if (verification.expires_at < new Date()) {
      throw new BadRequestException('Verification token expired');
    }

    // Update verification status
    verification.is_verified = true;
    verification.verified_at = new Date();
    verification.verification_ip = req.ip;
    verification.verification_user_agent = req.headers['user-agent'];
    await this.emailVerificationRepository.save(verification);
  }

  async login(loginDto: LoginDto): Promise<TokenResponse> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user || !user.password_hash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if email is verified
    const verification = await this.emailVerificationRepository.findOne({
      where: { user: { id: user.id } },
      order: { createdAt: 'DESC' },
    });

    if (!verification?.is_verified) {
      throw new UnauthorizedException('Email not verified');
    }

    return this.generateTokens(user);
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<TokenResponse> {
    const refreshTokenEntity = await this.refreshTokenRepository.findOne({
      where: { token: refreshTokenDto.refresh_token },
      relations: ['user'],
    });

    if (!refreshTokenEntity) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (refreshTokenEntity.expires_at < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    // Delete used refresh token
    await this.refreshTokenRepository.remove(refreshTokenEntity);

    return this.generateTokens(refreshTokenEntity.user);
  }

  async googleLogin(req: GoogleRequest): Promise<TokenResponse> {
    if (!req.user) {
      throw new UnauthorizedException('No user from Google');
    }

    let user = await this.userRepository.findOne({
      where: { email: req.user.email },
    });

    if (!user) {
      // Create new user
      user = await this.userRepository.save(
        this.userRepository.create({
          email: req.user.email,
          full_name: req.user.displayName,
          google_id: req.user.id,
          profile_image_url: req.user.picture,
        }),
      );

      // Create verified email verification record
      const verification = this.emailVerificationRepository.create({
        user,
        token: uuidv4(),
        is_verified: true,
        verified_at: new Date(),
        verification_ip: req.ip,
        verification_user_agent: req.headers['user-agent'],
        expires_at: new Date(),
      });
      await this.emailVerificationRepository.save(verification);
    }

    return this.generateTokens(user);
  }

  async logout(token: string): Promise<void> {
    const blacklistedToken = this.tokenBlacklistRepository.create({
      token,
      expires_at: new Date(
        Date.now() + this.configService.get('jwt.accessTokenExpiration') * 1000,
      ),
    });
    await this.tokenBlacklistRepository.save(blacklistedToken);
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const blacklistedToken = await this.tokenBlacklistRepository.findOne({
      where: { token },
    });
    return !!blacklistedToken;
  }
}
