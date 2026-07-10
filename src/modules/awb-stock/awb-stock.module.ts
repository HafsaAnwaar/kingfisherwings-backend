import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { EmailModule } from '../../shared/email/email.module';
import { AwbStockController } from './awb-stock.controller';
import { AwbStockService } from './awb-stock.service';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [AwbStockController],
  providers: [AwbStockService],
  exports: [AwbStockService],
})
export class AwbStockModule {}
