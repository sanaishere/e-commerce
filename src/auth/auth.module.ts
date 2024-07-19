import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DataService } from 'src/common/data.service';



@Module({
  providers: [AuthService,DataService],
  controllers: [AuthController]
})
export class AuthModule {}
