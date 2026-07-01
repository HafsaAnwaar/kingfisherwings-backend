import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { UsersModule } from './modules/users';
import {AuthModule} from './modules/auth/auth.module';

@Module({

imports:[

ConfigModule.forRoot({

isGlobal:true

}),

PrismaModule,

HealthModule,

TenantsModule,

UsersModule,
AuthModule

]

})

export class AppModule{}