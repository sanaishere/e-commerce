import { Controller,Post,Get,Delete,Put,Body,
    Param,Request,
    HttpCode,
    HttpStatus,
    UseInterceptors,
    ParseIntPipe,
    
    UseGuards} from '@nestjs/common';
import { OrderItemsService } from './order-items.service';
import { authGuard } from 'src/common/auth.guard';
import { AdminGuard } from 'src/common/admin.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Order_itemDto } from './dtos/create-order-items.sto';
import { UpdateDto } from './dtos/update.dto';
import { UserGuard } from 'src/common/user.guard';

@Controller('order-items')
export class OrderItemsController {
    constructor(private orderItemService:OrderItemsService){}
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(authGuard,UserGuard)
    @ApiBearerAuth()
    async addToBasket(@Body() body:Order_itemDto,@Request() {user}) {
     return await this.orderItemService.addToBasket(body, user)
    }
    @Put(':id')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(authGuard,UserGuard)
    @ApiBearerAuth()
    async editProductQuantity(@Param('id') id:number,@Body() body:UpdateDto,@Request() {user}){
    //console.log(number)
     return await this.orderItemService.editquantity(id,body,user)
    }

    @Get()
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @UseGuards(authGuard)
    async getBasket(@Request() {user}){
        return await this.orderItemService.getBasket( user.id)

    }
    
    @Delete(':id')
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @UseGuards(authGuard)
    async deleteItemFromBasket(@Request() {user} ,@Param('id') id:number){
        return await this.orderItemService.deleteItemFromBasket(user,id)

    }
}

@Controller('admin')
@UseGuards(authGuard,AdminGuard)
export class AdminController{
  constructor(private orderItemsService:OrderItemsService){}
  @Get('get/:userId')
  async getOrdersOfUser(@Param('userId') userId:number){
    return await this.orderItemsService.getBasket(userId)


  }
}