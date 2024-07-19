import { HttpException, HttpStatus } from "@nestjs/common"
import { pool } from "./config"
import { DataService } from "./data.service"

export const checkCondition=async (userId:number,productId:number,dataService:DataService):Promise<void>=> {
    const query=`SELECT * FROM orders o INNER JOIN order_items oi ON
    o.id=oi.order_id INNER JOIN products p ON oi.product_id=p.id WHERE o.user_id=$1 AND p.id=$2 AND o.order_status=$3`
    try{
      await dataService.connectToDb()
      const result= await dataService.runQuery(query,[userId,productId,'completed'])
      if(result.rowCount===0){
       throw new HttpException('you did not buy this product',HttpStatus.BAD_REQUEST)
      }
      }catch(err){
       throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
      }
    }


   