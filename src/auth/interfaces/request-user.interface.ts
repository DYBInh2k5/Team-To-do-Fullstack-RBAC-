import { Role } from '@prisma/client';

export interface RequestUser {
  userId: number;
  email: string;
  role: Role;
}
