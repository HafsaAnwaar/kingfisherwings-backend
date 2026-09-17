import { Module } from "@nestjs/common";
import { ConverterController } from "./converter.controller";
import { ConverterService } from "./converter.service";

@Module({
  controllers: [ConverterController],
  providers: [ConverterService],
  exports: [ConverterService],
})
export class ToolsModule {}
