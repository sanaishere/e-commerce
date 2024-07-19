import { Module } from '@nestjs/common';
import { AdminWalletController, WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { UsersModule } from 'src/users/users.module';
import { DataService } from 'src/common/data.service';

@Module({
  imports:[UsersModule],
  providers: [WalletService,DataService],
  controllers: [WalletController,AdminWalletController],
  exports:[WalletService]
})
export class WalletModule {}
