import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CategoryModule } from './category/category.module';
import { ProductsModule } from './products/products.module';
import { CommentModule } from './comment/comment.module';
import { ReviewModule } from './review/review.module';
import { OrderItemsModule } from './order-items/order-items.module';
import { OrderModule } from './order/order.module';
import { WalletModule } from './wallet/wallet.module';
import { AuthModule } from './auth/auth.module';



@Module({
  imports: [UsersModule, CategoryModule, ProductsModule, CommentModule,
     ReviewModule, OrderItemsModule, OrderModule,WalletModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
