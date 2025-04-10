import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AccessToken, User } from '@prisma/client';

@Injectable()
export class AccessTokenService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async markTokenAsExpired(token: string): Promise<AccessToken> {
    const decoded = this.jwtService.decode(token) as { exp: number };
    const expiresAt = new Date(decoded.exp * 1000);

    return await this.prisma.accessToken.update({
      where: { token },
      data: {
        expiresAt,
      },
    });
  }

  async create(token: string, userId: string): Promise<AccessToken> {
    return await this.prisma.accessToken.create({
      data: {
        token,
        userId,
        createdAt: new Date()
      },
    });
  }

  async tokenExists(token: string): Promise<boolean> {
    const accessToken = await this.prisma.accessToken.findUnique({
      where: { 
        token, 
        expiresAt: {
          equals: null
        } 
      },
    });

    return !!accessToken;
  }

  async cleanupExpiredTokens(): Promise<void> {
    await this.prisma.accessToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  async getUserByToken(token: string): Promise<User | undefined> {
    const accessToken = await this.prisma.accessToken.findUnique({
      where: { 
        token, 
        expiresAt: {
          equals: null
        } 
      },
      include: {
        user: true,
      },
    });

    console.log("accessToken Users ========>>>", accessToken?.user);
    return accessToken?.user;
  }
} 