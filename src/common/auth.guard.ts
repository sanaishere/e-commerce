import { CallHandler, CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable,NestInterceptor,NestMiddleware } from "@nestjs/common";
import {Request,Response} from 'express'
import * as jwt from 'jsonwebtoken'
import { pool } from "./config";
import { UsersService } from "src/users/users.service";
import { Observable } from "rxjs";
require('dotenv').config()
@Injectable()
export class authGuard implements CanActivate{
    constructor(){}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req=context.switchToHttp().getRequest()
        const res=context.switchToHttp().getResponse()
        const authorization=await req.headers.authorization
        const refreshToken=req.headers.refreshtoken
        if(!authorization || ! refreshToken){
            console.log('erroring')
            throw new HttpException('you should register first',HttpStatus.UNAUTHORIZED)
        }
        const accessToken=authorization?.split(' ')[1]
        console.log(accessToken)
       
      
        try{
        console.log(process.env.JWT_SECRET_ACCESS)
        const payload=jwt.verify(accessToken,process.env.JWT_SECRET_ACCESS)
        const user=await this.findUserById(payload['userId'])
        req.user=user
        console.log("user ",req.user)
         
        }
        catch(err){
            console.log(err)
            if(err.message==='jwt expired'){
               const payload=  this.check(refreshToken)
               const newAccessToken= await this.createAccessToken(payload)
               console.log("new token",newAccessToken)
               const user=await this.findUserById(payload['userId'])
               req.user=user
               console.log("user ",req.user)
               return res. send({newAccessToken})
                
                
            }else{
                console.log(err)
            throw new HttpException(err,err.status||HttpStatus.BAD_GATEWAY)
        }
        
    }
    return true
    }


   check(refreshToken:string){
    try{
        const payload=jwt.verify(refreshToken,process.env.JWT_REFRESH)
        console.log(payload)
        return {userId:payload['userId'],is_admin:payload['is_admin']}
        }
        catch(err){
            console.log(err)
            if(err.message==='jwt expired'){
                throw new HttpException('your access time has expired , please register again',HttpStatus.UNAUTHORIZED)
            }
            throw new HttpException(err,err.status||HttpStatus.BAD_GATEWAY)
        }
   }
    async findUserById(id:number){
     const query=`SELECT * FROM users WHERE id=($1) AND is_delete=false`
     let client =await pool.connect()
     try{
     let result=await client.query(query,[id])
      const user=result.rows[0]
     console.log(result.rows[0])
     if(result.rowCount===0){
        throw new HttpException('there is no user with this id ',HttpStatus.NOT_FOUND)
     }
     return user
    }catch(err){
    throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async createAccessToken(payload:any){
    const accessToken=await jwt.sign(payload,process.env.JWT_SECRET_ACCESS,{expiresIn:'2h'})
    return accessToken
   }
 }
   


