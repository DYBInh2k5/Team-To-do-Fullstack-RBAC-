import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{
    accessToken: string;
    user: Omit<User, 'password'>;
  }> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists.');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);
    const userCount = await this.usersService.countUsers();
    const user = await this.usersService.createUser({
      ...registerDto,
      password: passwordHash,
      role: userCount === 0 ? Role.ADMIN : Role.MEMBER,
    });

    return this.createAuthResponse(user);
  }

  async login(loginDto: LoginDto): Promise<{
    accessToken: string;
    user: Omit<User, 'password'>;
  }> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    return this.createAuthResponse(user);
  }

  async getProfile(userId: number): Promise<Omit<User, 'password'>> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    return this.stripPassword(user);
  }

  private async createAuthResponse(user: User): Promise<{
    accessToken: string;
    user: Omit<User, 'password'>;
  }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: this.stripPassword(user),
    };
  }

  private stripPassword(user: User): Omit<User, 'password'> {
    const safeUser = { ...user };
    delete (safeUser as Partial<User>).password;
    return safeUser as Omit<User, 'password'>;
  }
}
