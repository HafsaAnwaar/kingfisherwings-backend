import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';

import { UsersController } from './users.controller';


import { UsersRepository } from './users.repository';

@Module({
  imports: [
    PrismaModule,
  ],

  controllers: [
    UsersController,
  ],

})
export class UsersModule {}