import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from '../users/user.entity';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  // Validar credenciales
  async validateUser(username: string, pass: string): Promise<User | null> {
    const user = await this.usersRepo.findOne({ where: { username } });
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      return user;
    }
    return null;
  }

  // Login: retorna JWT
  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.username, dto.password);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const payload = { sub: user.id, username: user.username, roles: user.roles };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}