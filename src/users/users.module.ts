import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersController } from './users.controller';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [PrismaModule],
  providers: [UsersService, RolesGuard],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
