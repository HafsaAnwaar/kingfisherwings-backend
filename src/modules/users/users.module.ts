import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { EmailModule } from "../../shared/email/email.module";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { UsersRepository } from "./users.repository";

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
