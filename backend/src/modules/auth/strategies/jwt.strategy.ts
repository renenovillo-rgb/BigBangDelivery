import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'tu_clave_secreta_jwt_muy_segura_2026',
    });
  }

  async validate(payload: any) {
    if (!payload) {
      throw new UnauthorizedException('Token no válido o expirado');
    }
    
    return {
      id: payload.sub,
      email: payload.email,
      rol: payload.rol,
    };
  }
}
