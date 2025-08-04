// users.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Req
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // Cria novo usuário (admin pode usar essa rota)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // Lista todos os usuários (precisa estar logado)
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

  // Edita nome/email/role de um usuário (precisa estar logado)
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  // Altera senha de um usuário (precisa estar logado)
  @UseGuards(JwtAuthGuard)
  @Patch(':id/password')
  changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(id, changePasswordDto);
  }

  // Deleta um usuário (precisa estar logado)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: any) {
    const userId = req.user['id']; // req.user é preenchido pelo JwtStrategy
    return this.usersService.findOne(userId);
  }
}
