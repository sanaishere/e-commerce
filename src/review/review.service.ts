import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ReviewDto } from './dtos/review.dto';
import { User } from 'src/users/user.interface';
import { checkCondition } from 'src/common/check';
import { ProductsService } from 'src/products/products.service';
import { sendResponse } from 'src/common/sendResponse';
import { DataService } from 'src/common/data.service';
@Injectable()
export class ReviewService {
    constructor(private productService:ProductsService,
        private dataService:DataService
    ) {
    }
    async ratingProduct(review:ReviewDto,user:User,productId:number) {
        await this.productService.getProductById(productId)
        await checkCondition(user.id,productId,this.dataService)
        const queryToGet=`SELECT * FROM review WHERE user_id=$1 AND product_id=$2`
        const query=`INSERT INTO review (user_id,product_id,rating)
         VALUES ($1,$2,$3)`
         try{
          // await this.dataService.connectToDb()
           const result= await this.dataService.runQuery(queryToGet,[user.id,productId])
           if(result.rowCount>0){
               await this.updateRating(user.id,productId,review)
           }
           else{
            await this.dataService.runQuery(query,[user.id,productId,review.rating,])
           }
           const response=sendResponse('','your rating submitted')
           return response;
           }catch(err){
            throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
           }
    }

    async getReview(productId:number) {
        await this.productService.getProductById(productId)
        const query=`SELECT AVG(rating) AS average FROM review WHERE product_id=$1`
         try{
            await this.dataService.connectToDb()
           let data:number= (await this.dataService.runQuery(query,[productId])).rows[0].average
           data=Math.round(data*10)/10
           const response=sendResponse('',data)
           return response;
           }catch(err){
            throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
           }
    }

    async updateRating(userId:number,productId:number,review:ReviewDto) {
        const query=`UPDATE review SET rating=$1
        WHERE user_id=$2 AND product_id=$3`
        try{
           await this.dataService.runQuery(query,[review.rating,userId,productId])
            }catch(err){
             throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
            }
    }
    }

