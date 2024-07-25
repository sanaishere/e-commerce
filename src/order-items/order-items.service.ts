import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Order_itemDto } from './dtos/create-order-items.sto';
import { ProductsService } from 'src/products/products.service';
import { Product } from 'src/products/product.interface';
import { User } from 'src/users/user.interface';
import { sendResponse } from 'src/common/sendResponse';
import { OrderItems } from './order_items.interface';
import { UpdateDto } from './dtos/update.dto';
import { UsersService } from 'src/users/users.service';
import { DataService } from 'src/common/data.service';
@Injectable()
export class OrderItemsService {
    constructor(private productService:ProductsService,
      private userService:UsersService,
      private dataService:DataService
    ){}
    async addToBasket(body:Order_itemDto,user:User){
      let userId= user.id
      await this.userService.findUserById(userId)
      let product:Product= (await this.productService.getProductById(body.product_id)).data
      await this.findByProduct(body.product_id,userId)
      if(body.number>product.quantity){
        throw new HttpException('this number to buy this product is more than product quantity',HttpStatus.BAD_REQUEST)
      }
      let values=[]
      let price=product.price
      let totalPrice=price*body.number
      let order_id=null
      values=[body.number,price,totalPrice,body.product_id,userId,order_id]

      // await this.dataService.connectToDb()
      let query=`INSERT INTO order_items (number,price,total_price,product_id,user_id,order_id)
      VALUES ($1,$2,$3,$4,$5,$6)`
     try{
      let result=await this.dataService.runQuery(query,values)
      const response=sendResponse('','product is added to basket')
      return response
     }
     catch(err){
        throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
    }
    }

    async getBasket(userId:number){
      await this.userService.findUserById(userId)
      await this.dataService.connectToDb()
        let query=`SELECT o.id,o.number,o.price , o.total_price,p.name,p.image_src FROM order_items o
        LEFT JOIN products p ON o.product_id=p.id WHERE o.user_id=$1 AND o.is_delete=false`
        try{
         let order_items:OrderItems[]=(await this.dataService.runQuery(query,[userId])).rows
         const response=sendResponse('',order_items)
        return response
        }catch(err){
            throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async deleteItemFromBasket(user:User,id:number){
      await this.userService.findUserById(user.id)
       await this.dataService.connectToDb()
      const order_item=await this.findById(id)
      if(order_item.user_id!==user.id){
        throw new HttpException('you cant delete this item',HttpStatus.FORBIDDEN)
      }
      try{
      let queryToDelete=`DELETE FROM order_items  WHERE id=$1 `
      await this.dataService.runQuery(queryToDelete,[id])
      const response=sendResponse('','order_item is deleted')
     return response
    }catch(err){
        throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
    }
    }

    async findByProduct(product_id:number,userId:number){
      await this.userService.findUserById(userId)
      await this.productService.getProductById(product_id)
      let query=`SELECT * FROM order_items o LEFT JOIN products p
        ON o.product_id=p.id WHERE o.product_id=$1 AND o.user_id=$2 AND o.is_delete=false`
        await this.dataService.connectToDb()
        try{
          const order_item=await this.dataService.runQuery(query,[product_id,userId])
          if(order_item.rowCount>0){
            throw new HttpException('you have already bought this product',HttpStatus.BAD_REQUEST)
          }
        }
        catch(err){
            throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
        }

    }

    async editquantity(id:number,body:UpdateDto,user:User){
        const order_item=await this.findById(id)
        if(order_item.user_id!==user.id){
          throw new HttpException('you cant edit this basket',HttpStatus.FORBIDDEN)
        }
        //await this.dataService.connectToDb()
        const product=(await this.productService.getProductById(order_item.product_id)).data
        if(body.number1>product.quantity){
            throw new HttpException('this number to buy this product is more than product quantity',HttpStatus.BAD_REQUEST)
        }

        let queryOfUpdate=`UPDATE order_items SET number=$1,total_price=$2`
        try{
        let result=await this.dataService.runQuery(queryOfUpdate,[body.number1,body.number1*order_item.price])
        const response=sendResponse('','order_item is updated')
        return response
    }catch(err){
        throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
    }
}

    async findById(id:number){
        await this.dataService.connectToDb()
        let queryOfFind=`SELECT * FROM order_items WHERE id=$1`
        try{
        let result=await this.dataService.runQuery(queryOfFind,[id])
        if(result.rowCount===0){
          throw new HttpException('there is no order_item with this id',HttpStatus.NOT_FOUND)
        }
        const order_item:OrderItems=result.rows[0]
        return order_item
    }catch(err){
        throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
    }
}
}
