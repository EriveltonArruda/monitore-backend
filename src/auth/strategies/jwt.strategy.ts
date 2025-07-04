import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Adicionamos um valor padrão para garantir que o tipo seja sempre 'string'.
      // Em produção, a variável de ambiente DEVE ser definida.
      secretOrKey: process.env.JWT_SECRET || 'fallback_secret_key_dev_only',
    });
  }

  async validate(payload: any) {
    // O payload é o que descriptografamos do token.
    // Retornamos um objeto que será anexado ao objeto de requisição (req.user).
    return { id: payload.sub, email: payload.email, name: payload.name };
  }
}