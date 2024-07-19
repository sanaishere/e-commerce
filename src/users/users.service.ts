import { HttpCode, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUsers } from '../auth/dtos/create_user..dto';
import * as bcrypt from 'bcrypt'
import { UpdateUser } from './dtos/update_user.dto';
import { User } from './user.interface';
import { sendResponse } from 'src/common/sendResponse';
import * as jwt from 'jsonwebtoken'
import { addMinutes } from 'date-fns';
import { sendEmail } from './sendEmail';
import { URL } from 'src/common/app.url';
import { DataService } from 'src/common/data.service';
@Injectable()
export class UsersService {
    constructor(private dataService:DataService) {}
    async editProfile(id:number,body:UpdateUser) {
    await this.dataService.connectToDb()
     const query=`SELECT * FROM users WHERE id=($1) AND is_delete=false `
     try{
     let result=await this.dataService.runQuery(query,[id])
     if(result.rowCount===0){
        throw new HttpException('user with this id not found',HttpStatus.NOT_FOUND)
     }
        const fields = [];
        const values = [];
        let index = 1;

        for (const [key, value] of Object.entries(body)) {
            fields.push(`${key} = $${index}`);
            values.push(value);
            index++;
        }

        const queryForUpdate = `UPDATE users SET ${fields.join(', ')} WHERE id = $${index}`;
        values.push(id);
        const res=await this.dataService.runQuery(queryForUpdate,values)
        console.log(res)
        const response= sendResponse('','user is updated')
        return response

     }catch(err){
        throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
    }
    }

    

    async findUserById(id:number) {
        const query=`SELECT * FROM users WHERE id=$1 AND is_delete=false`
        await this.dataService.connectToDb()
        try{
        let result=await this.dataService.runQuery(query,[id])
        const user:User=result.rows[0]
        console.log(result.rows[0])
        if(result.rowCount===0){
            throw new HttpException('there is no user with this id ',HttpStatus.NOT_FOUND)
        }
        return user
    }catch(err){
        throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
    }
    }


    async getAllUsers(){
        await this.dataService.connectToDb()
        const query=`SELECT * FROM users WHERE is_delete=false`
        try{
        const result=await this.dataService.runQuery(query,null)
        const users:User[]=result.rows
        const response=sendResponse('',users)
        return response
        }
        catch(err){
            throw new HttpException(err,HttpStatus.INTERNAL_SERVER_ERROR)
          }

    }

    async getMyProfile(user:User){
        const userId=user.id
        await this.dataService.connectToDb()
        const query=`SELECT * FROM users WHERE id=($1)`
        try{
        const result=await this.dataService.runQuery(query,[userId])
        const currentUser:User=result.rows[0]
        const response=sendResponse('',currentUser)
        return response
        }
        catch(err){
            throw new HttpException(err,HttpStatus.INTERNAL_SERVER_ERROR)
          }

    }

    async getUser(userId:number) {
        await this.dataService.connectToDb()
        const query=`SELECT * FROM users WHERE id=($1)`
        try{
        const result=await this.dataService.runQuery(query,[userId])
        const currentUser:User=result.rows[0]
        const response=sendResponse('',currentUser)
        return response
        }
        catch(err){
            throw new HttpException(err,HttpStatus.INTERNAL_SERVER_ERROR)
          }

    }
    }

