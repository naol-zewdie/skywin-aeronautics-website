import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is required. Set it before starting the server.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
      // Validate token type
      algorithms: ['HS256'],
    });
  }

  async validate(payload: JwtPayload) {
    // Security: Ensure this is an access token, not a refresh token
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Security: Validate required fields
    if (!payload.sub || !payload.email || !payload.role) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Return normalized user object
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
