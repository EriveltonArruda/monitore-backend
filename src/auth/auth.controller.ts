// O "porteiro" para as rotas de login.
import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard) // Usa nossa estratégia de login local
  @Post('login')
  async login(@Request() req) {
    // Se chegar aqui, o usuário foi validado. O service gera o token.
    return this.authService.login(req.user);
  }
}