import { Module } from '@nestjs/common';
import { AdminController, ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { MulterModule } from '@nestjs/platform-express';
import { CategoryModule } from 'src/category/category.module';
import { DataService } from 'src/common/data.service';


@Module({
  imports:[MulterModule.register({dest:'./files'}),
    CategoryModule
  ],
  controllers: [ProductsController,AdminController],
  providers: [ProductsService,DataService],
  exports:[ProductsService]
  
})
export class ProductsModule {}
