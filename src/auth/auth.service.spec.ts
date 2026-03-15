import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

// Mock the entire bcrypt module so its non-configurable exports can be stubbed
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn(),
}));

const mockUser = {
  id: 1,
  email: 'admin@test.com',
  password: 'hashed_password',
  name: 'Alice Admin',
  role: Role.ADMIN,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            createUser: jest.fn(),
            countUsers: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('mock-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
  });

  describe('register', () => {
    it('should register the first user as ADMIN', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.countUsers.mockResolvedValue(0);
      usersService.createUser.mockResolvedValue(mockUser);

      const result = await service.register({
        email: mockUser.email,
        password: 'password123',
        name: mockUser.name,
      });

      expect(result.accessToken).toBe('mock-token');
      expect(result.user.email).toBe(mockUser.email);
      expect(result.user).not.toHaveProperty('password');
    });

    it('should register subsequent users as MEMBER', async () => {
      const memberUser = { ...mockUser, role: Role.MEMBER };
      usersService.findByEmail.mockResolvedValue(null);
      usersService.countUsers.mockResolvedValue(5);
      usersService.createUser.mockResolvedValue(memberUser);

      const result = await service.register({
        email: memberUser.email,
        password: 'password123',
        name: memberUser.name,
      });

      expect(result.user.role).toBe(Role.MEMBER);
    });

    it('should throw ConflictException if email already exists', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.register({
          email: mockUser.email,
          password: 'password123',
          name: 'Alice',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return an access token on valid credentials', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: mockUser.email,
        password: 'password123',
      });

      expect(result.accessToken).toBe('mock-token');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedException for unknown email', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@test.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: mockUser.email, password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('should return user without password', async () => {
      usersService.findById.mockResolvedValue(mockUser);

      const result = await service.getProfile(1);

      expect(result.email).toBe(mockUser.email);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(service.getProfile(999)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
