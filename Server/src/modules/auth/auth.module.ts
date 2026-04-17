import { Module } from '@nestjs/common';
import { AppController } from './auth.controller';
import { AppService } from './auth.service';

@Module({
  controllers: [AppController],
  providers: [AppService],
})
export class AuthModule {}
