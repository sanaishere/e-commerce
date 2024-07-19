import { Controller,Post,Get,Body,Param, UseGuards,Request,Put } from '@nestjs/common';
import { authGuard } from 'src/common/auth.guard';
import { WalletService } from './wallet.service';
import { AdminGuard } from 'src/common/admin.guard';

@Controller('wallet')
export class WalletController {
    constructor(private walletService:WalletService){}
    @Post()
    @UseGuards(authGuard)
    async createWallet(@Body() {budget},@Request() {user}){
    return await this.walletService.createWallet(budget,user)
          
   }

   @Put('charge')
    @UseGuards(authGuard)
   async chargeWallet(@Body() {budget},@Request() {user}) {
    return await this.walletService.chargeWallet(budget,user)
          
   }

   @Get()
   @UseGuards(authGuard)
   async getMyWallet(@Request() {user}) {
    return await this.walletService.getOneUserWallet(user.id)
   }
}

@Controller('admin')
export class AdminWalletController {
    constructor(private walletService:WalletService){}
    
    @Get() 
    @UseGuards(authGuard,AdminGuard)
    async getUsersWallet(){
        return await this.walletService.getUsersWallet()
    }
    
    @Get(':id')
    @UseGuards(authGuard,AdminGuard)
    async getOneUserWallet(@Param('id') id:number){
        return await this.walletService.getOneUserWallet(id)
    }

}
