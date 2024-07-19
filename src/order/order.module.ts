import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { UsersModule } from 'src/users/users.module';
import { WalletModule } from 'src/wallet/wallet.module';
import { DataService } from 'src/common/data.service';

@Module({
  imports:[UsersModule,WalletModule],
  controllers: [OrderController],
  providers: [OrderService,DataService]
})
export class OrderModule {}
