import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AccessTokenService } from './access-token.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly accessTokenService: AccessTokenService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      return false;
    }

    const isAccessToken = await this.accessTokenService.tokenExists(token);
    if (!isAccessToken) {
      return false;
    }

    console.log("Request Access Token =======>>>>>", token);
    const user = await this.accessTokenService.getUserByToken(token);
    console.log("Request user =======>>>>>", user);
    request.user = {
      id: user?.id,
      email: user?.email,
      name: user?.name
    };
    return super.canActivate(context) as Promise<boolean>;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
} 