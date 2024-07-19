import { Module } from '@nestjs/common';
import { OrderItemsService } from './order-items.service';
import { AdminController, OrderItemsController } from './order-items.controller';
import { ProductsModule } from 'src/products/products.module';
import { UsersModule } from 'src/users/users.module';
import { DataService } from 'src/common/data.service';


@Module({
  imports:[ProductsModule,UsersModule],
  providers: [OrderItemsService,DataService],
  controllers: [OrderItemsController,AdminController]
})
export class OrderItemsModule {}
