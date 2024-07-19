import { HttpException, Injectable,HttpStatus } from '@nestjs/common';
import { User } from 'src/users/user.interface';
import { pool } from 'src/common/config';
import { sendResponse } from 'src/common/sendResponse';
import { UsersService } from 'src/users/users.service';
import { DataService } from 'src/common/data.service';
@Injectable()
export class WalletService {
    constructor(private userService:UsersService,
      private dataService:DataService
    ){}

    async createWallet(budget:number,user:User) {
    await this.userService.findUserById(user.id)
     const data=(await this.getOneUserWallet(user.id)).data
     console.log(data)
     if(data!==''){
        throw new HttpException('wallet for this userId is created',HttpStatus.BAD_REQUEST)
     }
     await this.dataService.connectToDb()
     const query=`INSERT INTO wallet (user_id,created_date,updated_date,budget) VALUES ($1,$2,$3,$4)`
     try{
     const result=await this.dataService.runQuery(query,[user.id,new Date(),new Date(),budget])
     const response=sendResponse('','wallet is created')
    return response
     }catch(err){
        throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
     }
     
    }

    async chargeWallet(budget:number,user:User) {
        await this.userService.findUserById(user.id)
        await this.dataService.connectToDb()
       const queryToGet=`SELECT budget FROM wallet WHERE user_id=$1`
        const query=`UPDATE wallet SET budget=$1 , updated_date=($2)  WHERE user_id=$3`
        try{
        const queryResult=await this.dataService.runQuery(queryToGet,[user.id])
        if(queryResult.rowCount===0){
            throw new HttpException('wallet with this userId is not found',HttpStatus.NOT_FOUND)
        }
        const oldBudget=queryResult.rows[0].budget
        console.log(oldBudget)
        let newBudget=+oldBudget+budget
        console.log(newBudget)
        const result=await this.dataService.runQuery(query,[newBudget,new Date(),user.id])
        const response=sendResponse('','wallet is charged')
       return response
        }catch(err){
           throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

   //  async getMyWallet(user:User){
   //      await this.userService.findUserById(user.id)
   //      await this.dataService.connectToDb()
   //      const queryToGet=`SELECT * FROM wallet WHERE user_id=$1`
   //      try{
   //      const result=await this.dataService.runQuery(queryToGet,[user.id])
   //      let response:any;
   //      if(result.rowCount===0){
   //           response=sendResponse('','')
   //      }
   //       response=sendResponse('',result.rows[0])
   //     return response
   //      }catch(err){
   //         throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
   //      }
   //  }

    async getUsersWallet() {
      await this.dataService.connectToDb()
        const queryToGet=`SELECT * FROM wallet`
        try{
        const result=await this.dataService.runQuery(queryToGet,null)
        const response=sendResponse('',result.rows)
       return response
        }catch(err){
           throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

   async  getOneUserWallet(id:number){
    await this.userService.findUserById(id)
    await this.dataService.connectToDb()
    const queryToGet=`SELECT * FROM wallet WHERE user_id=$1`
    try{
    const result=await this.dataService.runQuery(queryToGet,[id])
    let response:any;
        if(result.rowCount===0){
             response=sendResponse('','')
        }
         response=sendResponse('',result.rows[0])
       return response
    }catch(err){
       throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
    }
   }

   async payFromWallet(price:number,user:User){
    await this.userService.findUserById(user.id)
   //  const data=(await this.getOneUserWallet(user.id)).data
   //  if(data===''){
   //      throw new HttpException('you should create wallet to pay ',HttpStatus.BAD_REQUEST)
   //  }
    await this.dataService.connectToDb()
    const queryToGet=`SELECT budget FROM wallet WHERE user_id=$1`
    const query=`UPDATE wallet SET budget=$1  WHERE user_id=$2`
    try{
    const queryResult=await this.dataService.runQuery(queryToGet,[user.id])
    const oldBudget=queryResult.rows[0].budget
    if(oldBudget<price){
        return false;
    }
    else{
    let newBudget=oldBudget-price
    const result=await this.dataService.runQuery(query,[newBudget,user.id])
    return true;
    }
    }catch(err){
       throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
    }

   }

}
