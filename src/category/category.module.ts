import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { AdminController, CategoryController } from './category.controller';
import { DataService } from 'src/common/data.service';

@Module({
  providers: [CategoryService,DataService],
  controllers: [CategoryController,AdminController],
  exports:[CategoryService]
})
export class CategoryModule {}
