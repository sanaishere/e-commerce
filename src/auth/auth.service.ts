import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUsers } from 'src/auth/dtos/create_user..dto';
import { sendEmail } from 'src/users/sendEmail';
import { User } from 'src/users/user.interface';
import { sendResponse } from 'src/common/sendResponse';
import * as jwt from 'jsonwebtoken'
import { addMinutes } from 'date-fns';
import { URL } from 'src/common/app.url';
import * as bcrypt from 'bcrypt'
import { RetriveDto } from './dtos/retrivepassword.dto';
import { DataService } from 'src/common/data.service';
@Injectable()
export class AuthService {
    constructor(private dataService:DataService){}
    async sendOtp(email:string){
        //let client =await pool.connect() 
        await this.dataService.connectToDb()
        try{

            let exist=await this.dataService.runQuery(`SELECT * FROM users WHERE is_delete=false AND email=$1`,[email])
         if(exist.rowCount>0){
            throw new HttpException('user with this email existed',HttpStatus.BAD_REQUEST)
         }else{
            const otp=await this.createOTP()
            await sendEmail(email,otp)
            const url=`${URL}/auth/signup`
            return {message:' email is successfully sent,continue',url}
         
         }
        }catch(err){
            throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async createOTP(){
        await this.dataService.connectToDb()
        const otp = Math.floor(100000 + Math.random() * 900000);
        const existingOtp=await this.dataService.runQuery(`SELECT * FROM otp WHERE value=$1`,[otp])
        if(existingOtp.rowCount>0){
           this.createOTP()
        }
        else{
        const expireTime=addMinutes(new Date(),3)
        const query=`INSERT INTO otp (value,expiresin) VALUES ($1,$2)`
        try{
        let result=await this.dataService.runQuery(query,[otp,expireTime])
        return otp
        }catch(err){
          throw new HttpException(err,HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    }

    async verificationEmail(otp:number){
      await this.dataService.connectToDb()
      
        try{
       const foundedotp=await this.dataService.runQuery(`SELECT * FROM otp WHERE value=$1`,[otp])
       if(foundedotp.rowCount===0){
        throw new HttpException('otp is not correct',HttpStatus.BAD_REQUEST)
       }
       if(foundedotp.rowCount>0 && foundedotp.rows[0].expiresin<new Date()){
        throw new HttpException('otp is expired',HttpStatus.BAD_REQUEST)
       }
      
        }catch(err){
            throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
        }

    }
    async signUp(body:CreateUsers) {
        await this.verificationEmail(body.otp)
        await this.dataService.connectToDb()
        try{
         let exist=await this.dataService.runQuery(`SELECT * FROM users WHERE is_delete=false AND email=$1`,[body.email])
         if(exist.rowCount>0){
            throw new HttpException('user with this email existed',HttpStatus.BAD_REQUEST)
         }

        const hashedPassword=await this.hashingPassword(body.password)
        const query=`INSERT INTO users (firstname,lastname,password,email,is_admin,is_delete,refreshToken)
        VALUES($1 , $2 , $3 , $4 , $5 , $6)`
    
        let result=await this.dataService.runQuery(query,
            [body.firstname,body.lastname
                ,hashedPassword,body.email,false,false,null])
        const response=sendResponse('','new user is created')
        return response
            }catch(err){
            console.log(err)
           throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
    
    async login(email:string,password:string) {
       await this.dataService.connectToDb()
       const query=`SELECT * FROM users WHERE email=$1 AND is_delete=false`
        try{
        let result=await this.dataService.runQuery(query,[email])
        console.log(result.rows[0])
        if(result.rowCount===0){
            throw new HttpException('you should register first',HttpStatus.BAD_REQUEST)
        }
        const user:User=result.rows[0]
        console.log(user.password,password)
        const isPassword=await bcrypt.compare(password,user.password)
        console.log(isPassword)
        if(!isPassword){
            throw new HttpException('password is not correct',HttpStatus.BAD_REQUEST)
        }
        
        const payload={userId:user.id,is_admin:user.is_admin}
        const accessToken= this.createAccessToken(payload)
        const refreshToken= this.createRefreshToken(payload)
        await this.saveRefreshTOdb(refreshToken,user.id)
        const response=sendResponse('',result.rows[0])
        return {response, accessToken,refreshToken}
      
        }catch(err){
            console.log(err)
            throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async changePassword({email,oldPassword,newPassword}) :Promise<Object> {
        await this.dataService.connectToDb()
         const query=`SELECT * FROM users WHERE email=($1) AND  password=$2 AND is_delete=false`
        try{
        let result=await this.dataService.runQuery(query,[email,oldPassword])
        if(result.rowCount===0){
            throw new HttpException('there is no user with this email and password exists',HttpStatus.BAD_REQUEST)
        }
        const hashedPassword=await this.hashingPassword(newPassword)
       let queryForUpdate=`UPDATE users SET password=($2) WHERE email=($1) `
       let resultForUpdate=await this.dataService.runQuery(queryForUpdate,[email,hashedPassword])
       console.log(resultForUpdate.rows[0])
       const response=sendResponse('','password successfully updated')
       return response
    }catch(err){
        throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
    }
}
   async forgetPassword(email:string) {
    await this.dataService.connectToDb()
    const query=`SELECT * FROM users WHERE email=($1) AND is_delete=false`
    try{
    let result=await this.dataService.runQuery(query,[email])
    if(result.rowCount===0){
        throw new HttpException('there is no user with this email exists',HttpStatus.NOT_FOUND)
    }
    const verifyToken=this.createVerifyToken({userId:result.rows[0].id,email:result.rows[0].email})
    let insertQuery=`INSERT INTO verifytoken (value) VALUES ($1)`
    let retriveUrl=`${URL}/auth/retrievePassword`
    await this.dataService.runQuery(insertQuery,[verifyToken])
    await sendEmail(email,retriveUrl)
    return {message:'check your email',verifyToken}
}catch(err){
    throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
}
}
   
    async retrievePassword(body:RetriveDto,req:any) {
        await this.dataService.connectToDb()
        const verifyToken=req?.headers?.verifytoken
        console.log("verifyToken",verifyToken)
        if(!verifyToken){
            throw new HttpException('try again and check email',HttpStatus.BAD_REQUEST)
        }
        const query=`SELECT * FROM verifytoken WHERE value=$1 `
        try{
        let result= await this.dataService.runQuery(query,[verifyToken])
        if(result.rowCount===0){
            throw new HttpException('you cannot change password',HttpStatus.BAD_REQUEST)
        }
        const payload= this.verifyToken(verifyToken)
        console.log(payload)
        const email=payload['email']
        console.log(email)
        const hashedPassword=await this.hashingPassword(body.newPassword)
        let queryForUpdate=`UPDATE users SET password=($2) WHERE email=($1) AND is_delete=false `
        
        let resultForUpdate=await this.dataService.runQuery(queryForUpdate,[email,hashedPassword])
      //  console.log(resultForUpdate.rows[0])
        const response=sendResponse('','password is retrieved successfully')
        return response
     }catch(err){
         throw new HttpException(err,err.status||HttpStatus.INTERNAL_SERVER_ERROR)
     }
    }
    
    async hashingPassword(password:string) {
        const hashedPassword=await bcrypt.hash(password,10)
        return hashedPassword
    }

     createAccessToken(payload:any){
     const accessToken=jwt.sign(payload,process.env.JWT_SECRET_ACCESS,{expiresIn:'2h'})
     return accessToken
    }

    createVerifyToken(payload:any){
     const accessToken=jwt.sign(payload,process.env.JWT_SECRET_VERIFY,{expiresIn:'3m'})
    return accessToken
    }
    
    verifyToken(token:string){
        try{
     const payload= jwt.verify(token,process.env.JWT_SECRET_VERIFY)
     return payload
        }
     catch(err){
        if(err.message==='jwt expired'){
        throw new HttpException('try again later',HttpStatus.INTERNAL_SERVER_ERROR)
    }
    throw new HttpException(err,HttpStatus.INTERNAL_SERVER_ERROR)
    }
    }
    createRefreshToken(payload:any){
    const refreshToken=jwt.sign(payload,process.env.JWT_REFRESH,{expiresIn:'9h'})
    console.log(refreshToken)
     return refreshToken

    }
    async saveRefreshTOdb(newRefreshToken:string,userId:number) {
        const query=`UPDATE users SET refreshtoken=$1 WHERE id=$2`
        await this.dataService.runQuery(query,[newRefreshToken,userId])

    }
    async generateTokens(req:any){
    const oldRefreshToken=req.headers.refreshtoken
    const payload=await this.validateRefresh(oldRefreshToken)
    const newAccessToken=this.createAccessToken(payload)
    const newRefreshToken=this.createRefreshToken(payload)
    await this.saveRefreshTOdb(newRefreshToken,payload['userId'])
    return {newAccessToken,newRefreshToken}
    }

    async validateRefresh(refreshToken:string){
        try{
            console.log(refreshToken)
            const payload=jwt.verify(refreshToken,process.env.JWT_REFRESH)
            console.log(payload)
            const userId=payload['userId']
            await this.dataService.connectToDb()
            const query=`SELECT * FROM users WHERE refreshtoken=$1 AND id=$2`
            const result= await this.dataService.runQuery(query,[refreshToken,userId])
            if(result.rowCount===0){
                throw new HttpException('your refreshtoken is not correct for this user',HttpStatus.UNAUTHORIZED)
            }else{
            return {userId:userId,is_admin:payload['is_admin']}
            }
            }
            catch(err){
                console.log(err)
                if(err.message==='jwt expired'){
                    throw new HttpException('your access time has expired , please register again',HttpStatus.UNAUTHORIZED)
                }
                throw new HttpException(err,err.status||HttpStatus.BAD_GATEWAY)
            }
       }
}
