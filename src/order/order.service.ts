import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { Product } from 'src/products/product.interface';
import { User } from 'src/users/user.interface';
import { sendResponse } from 'src/common/sendResponse';
import { Order_items } from 'src/order-items/order_items.interface';
import { URL } from 'src/common/app.url';
import { OrderDto } from './dtos/create.dto';
import { UsersService } from 'src/users/users.service';
import { WalletService } from 'src/wallet/wallet.service';
import { DataService } from 'src/common/data.service';

@Injectable()
export class OrderService {
    constructor(private userService:UsersService,
      private walletService:WalletService,
      private dataService:DataService
    ){}

    async createOrder(orderItemIds:OrderDto,user:User) {
     await this.userService.findUserById(user.id)
     const data=(await this.walletService.getOneUserWallet(user.id)).data
    if(data===''){
        throw new HttpException('you should create wallet to pay ',HttpStatus.BAD_REQUEST)
    }
     await this.checkStatus(user.id)
     const order_items:Order_items[]=await this.getItems(orderItemIds.ids,user.id)
     console.log(order_items)
     const finalItems:Order_items[]= await this.checkStock(order_items)
     const total_price:number=await this.evaluateTotalPrice(finalItems)
     
     const query=`INSERT INTO orders (total_amount,user_id,order_date,order_status)
     VALUES ($1,$2,$3,$4)`
     let order_date=new Date()
     let order_status='in progress'
     try{
   // await this.dataService.connectToDb()
    await this.dataService.runQuery(query,[total_price,user.id,order_date,order_status])
    await this.dataService.client.query('BEGIN')
    const result= await this.walletService.payFromWallet(total_price,user)
    if(result===true){
     await this.assignOrderId(finalItems,user.id)
     await this.updateOrderStatus('completed',user.id)
     await this.reduceProduct(finalItems)
     await this.deleteFromOrderItems(finalItems)
     await this.dataService.client.query('COMMIT')
     const response=sendResponse('','payment is successful')
     return response
    }
    if(result===false){
      await this.updateOrderStatus('unsuccessfull',user.id)
      throw new HttpException('budget is not enough',HttpStatus.EXPECTATION_FAILED)
    }
     }catch(err){
      await this.dataService.client.query('ROLLBACK')
      throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
     }
     finally{
      await this.dataService.client.end()
     }
    }
    
    async updateOrderStatus(status:string,userId:number) {
     // await this.dataService.connectToDb()
      const query=`UPDATE orders SET order_status=$1 WHERE user_id=${userId} AND order_status=$2`
      try{
      await this.dataService.runQuery(query,[status,'in progress'])
      }catch(err){
       throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
      }
     }
    async getItems(Ids:number[],userId:number) {
        const order_items=[]
        for (let id of Ids){
        const query=`SELECT * FROM order_items WHERE id=$1 AND user_id=$2 AND is_delete=false`
        //await this.dataService.connectToDb()
        try{
          const rows=await this.dataService.runQuery(query,[id,userId])
          if(!rows||rows.rowCount===0){
            throw new HttpException(`you dont have order item with this id ${id}`,HttpStatus.NOT_FOUND)
          }
          else{
            const order_item=await rows.rows[0]
            order_items.push(order_item)
          }
        }
        catch(err){
            throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
        }
        }
        return order_items
    }

    async checkStock(Items:Order_items[]) {
        let finalItems=[]
      //  await this.dataService.connectToDb()
        for (let item of Items){
          console.log(item.id)
        const query=`SELECT p.quantity FROM order_items o JOIN products p ON 
          o.product_id=p.id WHERE o.is_delete=false AND o.id=$1  `
        try{
          const result=await this.dataService.runQuery(query,[item.id])
          const quantity=result.rows[0].quantity
          if(item.number>quantity){
            throw new HttpException(`this product has ${quantity} number in warehouse`,HttpStatus.NOT_FOUND)
          }
           if(quantity===0){
            let queryToDelete=`DELETE FROM order_items  WHERE id=$1 `
            await this.dataService.runQuery(queryToDelete,[item.id])
            throw new HttpException(`sorry but this product no more has enough quantity`,HttpStatus.NOT_FOUND)
           }
           else{
            finalItems.push(item)
           }
        }
        catch(err){
            throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    return finalItems
    }

    async evaluateTotalPrice(Items:Order_items[]) {
      let totalPrice=0
      for (let item of Items){
          totalPrice+=item.total_price
      }
      return totalPrice
  }

  async deleteFromOrderItems(items:Order_items[]) {
   //  await this.dataService.connectToDb()
      for( let item of items){
      try{
      let queryToDelete=`UPDATE  order_items SET is_delete=true WHERE id=$1 `
      await this.dataService.runQuery(queryToDelete,[item.id])
    }catch(err){
        throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}

async reduceProduct(items:Order_items[]) {
 // await this.dataService.connectToDb()
  for( let item of items){
    const query=`SELECT p.quantity,p.id FROM order_items o JOIN products p ON 
          o.product_id=p.id WHERE o.is_delete=false AND o.id=$1 `
        try{
          const result=await this.dataService.runQuery(query,[item.id])
          const oldQuantity=result.rows[0].quantity
          const newQuantity=+oldQuantity-item.number;
          const productId=result.rows[0].id
  let queryToReduce=`UPDATE products  SET quantity=$1 WHERE id=$2  `
  await this.dataService.runQuery(queryToReduce,[newQuantity,productId])
        
}catch(err){
    throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
}
}
}

async checkStatus(userId:number){
  await this.dataService.connectToDb()
  const query=`SELECT * FROM orders WHERE user_id=$1 AND order_status=$2`
  try{
 const result= await this.dataService.runQuery(query,[userId,'in progress'])
 if(result.rowCount>0){
  throw new HttpException('you should wait until process is terminated',HttpStatus.BAD_REQUEST)
 }
  }catch(err){
   throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
  }
}
async assignOrderId(items:Order_items[],userId:number){
  console.log('Connecting to database');
  // console.log('Connected to database');
  const query=`SELECT id FROM orders WHERE user_id=$1 AND order_status=$2`
  const result= await this.dataService.runQuery(query,[userId,'in progress'])
  console.log('executed')
 if(result.rowCount===0){
  throw new HttpException('no orders found with this information',HttpStatus.BAD_REQUEST)
 }
 const orderId=result.rows[0].id
 console.log(orderId)
 for (let item of items){
  try{
  let queryOfFind=`SELECT * FROM order_items WHERE id=$1 `
      let result=await this.dataService.runQuery(queryOfFind,[item.id])
      console.log('iterate')
        if(result.rowCount===0){
          throw new HttpException('there is no order_item with this id',HttpStatus.NOT_FOUND)
        }
  let queryOfUpdate=`UPDATE order_items SET order_id=$1 WHERE id=$2`
  await this.dataService.runQuery(queryOfUpdate,[orderId,item.id])
  console.log('true assigned')
      }
   catch(err){
   throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
  }
}
}

async getOrdersOfUser(userId:number){
  await this.dataService.connectToDb()
  const query=`SELECT o.id,o.user_id,o.order_date,o.order_status,o.total_amount,
   JSON_AGG(
      JSON_BUILD_OBJECT(
        'number', oi.number,
        'total_price', oi.total_price,
        'name', p.name,
        'image_src', p.image_src
      )
) AS order_products
  FROM orders o  INNER JOIN order_items
  oi ON o.id=oi.order_id INNER JOIN products p ON oi.product_id=p.id WHERE o.user_id=$1 
   GROUP BY o.id, o.user_id, o.order_date,
   o.order_status, o.total_amount
 `
  try{
 const result= await this.dataService.runQuery(query,[userId])
 if(result.rowCount===0){
  throw new HttpException('no orders find with this user id',HttpStatus.BAD_REQUEST)
 }
 const response=sendResponse('',result.rows)
 return response
}catch(err){
  throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
 }
}
}

