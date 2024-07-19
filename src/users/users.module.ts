import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { AdminController, UsersController } from './users.controller';
import { DataService } from 'src/common/data.service';

@Module({
  providers: [UsersService,DataService],
  controllers: [UsersController,AdminController],
  exports:[UsersService]
})
export class UsersModule {}
