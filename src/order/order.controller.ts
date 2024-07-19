import { Body, Controller, Post, UseGuards ,Request,Get,Param} from '@nestjs/common';
import { OrderService } from './order.service';
import { authGuard } from 'src/common/auth.guard';
import { OrderDto } from './dtos/create.dto';
import { AdminGuard } from 'src/common/admin.guard';

@Controller('order')
export class OrderController {
    constructor(private orderService:OrderService){}
 @Post()
 @UseGuards(authGuard)
 async createOrder(@Body() orderItemIds:OrderDto,@Request() {user}) {
   console.log(user)
   return await this.orderService.createOrder(orderItemIds,user)

 }


 @Get()
 @UseGuards(authGuard)
 async getMyOrders(@Request() {user}) {
  return await this.orderService.getOrdersOfUser(user.id)
 }

}
@Controller('admin')
@UseGuards(authGuard,AdminGuard)
export class AdminOrderController{
  constructor(private orderService:OrderService){}
  @Get('get/:userId')
  async getOrdersOfUser(@Param('userId') userId:number) {
    return await this.orderService.getOrdersOfUser(userId)


  }

}
