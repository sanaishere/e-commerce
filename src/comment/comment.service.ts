import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { pool } from '../common/config';
import { CommentDto } from './dtos/createcomment.dto';
import { User } from 'src/users/user.interface';
import { sendResponse } from '../common/sendResponse';
import {checkCondition} from '../common/check'
import { ProductsService } from '../products/products.service';
import { DataService } from 'src/common/data.service';

@Injectable()
export class CommentService {
    constructor(
        private productService:ProductsService,
        private dataService:DataService
    ){}
    async createComment(body:CommentDto,user:User) {
        await this.productService.getProductById(body.productId)
       const userId=user.id
       await checkCondition(userId,body.productId,this.dataService)
       const query=`INSERT INTO comment (text,user_id,product_id,date,is_delete)
       VALUES ($1,$2,$3,$4,$5)`
       const date=new Date()
       try{
       //await this.dataService.connectToDb()
       await this.dataService.runQuery(query,[body.text,userId,body.productId,new Date(),false])
        const response=sendResponse('','your comment is submitted')
        return response;
       }catch(err){
        throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
       }
    }

    async getComments(productId:number){
        await this.productService.getProductById(productId)
       const query=`SELECT * FROM comment WHERE product_id=$1`
       const date=new Date()
       try{
        await this.dataService.connectToDb()
      const result=  await this.dataService.runQuery(query,[productId])
      const response=sendResponse('',result.rows)
      return response

       }catch(err){
        throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
       }
    }

    async deleteComment(id:number,user:User){
        const comment=await this.findOne(id)
        if(comment.user_id!==user.id || user.is_admin===false){
            throw new HttpException('you can not delete this comment',HttpStatus.FORBIDDEN)
        }
        const query=`UPDATE comment SET is_delete=true WHERE id=${id} `
        try{
        await this.dataService.runQuery(query,null)
        const response=sendResponse('','comment is deleted')
        return response
       }catch(err){
        throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
       }
    }
    
    async findOne(id:number){
        const query=`SELECT * FROM comment WHERE id=${id} AND is_delete=false `
        try{
        await this.dataService.connectToDb()
       const result= await this.dataService.runQuery(query,[id])
       if(result.rowCount===0){
        throw new HttpException('comment with this id is not found',HttpStatus.NOT_FOUND)
       }
       const comment=result.rows[0]
       return comment
       }catch(err){
        throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
       }

    }
    
}

