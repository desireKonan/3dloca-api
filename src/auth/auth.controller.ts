import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccessTokenService } from './access-token.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private tokenBlacklistService: AccessTokenService,
  ) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new Error('Les identifiants sont incorrectes !');
    }

    return this.authService.login(user);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: any) {
    const token = req.headers.authorization.split(' ')[1];
    await this.tokenBlacklistService.markTokenAsExpired(token);
    return { message: 'Deconnexion avec succes !' };
  }
} 