// Este é o "porteiro". Ele define as URLs e direciona as requisições para o service.

import { Controller, Get, Post, Body, UseGuards, Delete, Param, ParseIntPipe, Patch, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // Rota para criar um novo usuário. Aberta, pois um admin pode criar outros.
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // Rota para listar todos os usuários.
  // @UseGuards(JwtAuthGuard) garante que apenas usuários logados (com token válido) podem acessar.
  // @Query() captura os parâmetros da URL para a paginação.
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string
  ) {
    return this.usersService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      search,
    });
  }

  // Rota para alterar a senha de um usuário específico.
  @UseGuards(JwtAuthGuard)
  @Patch(':id/password')
  changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(id, changePasswordDto);
  }

  // Rota para deletar um usuário específico.
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}