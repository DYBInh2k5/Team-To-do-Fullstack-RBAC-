import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { RolesGuard } from './roles.guard';

const makeContext = (user: unknown): ExecutionContext =>
  ({
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  }) as unknown as ExecutionContext;

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let getAllAndOverride: jest.Mock;

  beforeEach(() => {
    getAllAndOverride = jest.fn();
    const reflector = { getAllAndOverride } as unknown as Reflector;
    guard = new RolesGuard(reflector);
  });

  it('should allow access when no roles are required', () => {
    getAllAndOverride.mockReturnValue(undefined);
    const ctx = makeContext({ userId: 1, role: Role.MEMBER });

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should allow access when required roles list is empty', () => {
    getAllAndOverride.mockReturnValue([]);
    const ctx = makeContext({ userId: 1, role: Role.MEMBER });

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should throw UnauthorizedException when no user is on the request', () => {
    getAllAndOverride.mockReturnValue([Role.ADMIN]);
    const ctx = makeContext(undefined);

    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('should allow ADMIN to access an ADMIN-only route', () => {
    getAllAndOverride.mockReturnValue([Role.ADMIN]);
    const ctx = makeContext({ userId: 1, role: Role.ADMIN });

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should deny MEMBER access to an ADMIN-only route', () => {
    getAllAndOverride.mockReturnValue([Role.ADMIN]);
    const ctx = makeContext({ userId: 2, role: Role.MEMBER });

    expect(guard.canActivate(ctx)).toBe(false);
  });

  it('should allow MEMBER to access a MEMBER-allowed route', () => {
    getAllAndOverride.mockReturnValue([Role.ADMIN, Role.MEMBER]);
    const ctx = makeContext({ userId: 2, role: Role.MEMBER });

    expect(guard.canActivate(ctx)).toBe(true);
  });
});
