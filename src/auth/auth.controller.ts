
import { Controller,Post,Get,Delete,Put,Body,
    Param,Request,
    HttpCode,
    HttpStatus,
    Res
 } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';



import { AuthService } from './auth.service';
import { CreateUsers } from 'src/auth/dtos/create_user..dto';
import { LoginDto } from 'src/auth/dtos/loginUser.dto';
import { RetriveDto } from './dtos/retrivepassword.dto';
import { Response } from 'express';
import { EmailDto } from './dtos/email.dto';
import { ForgetPasswordDto } from './dtos/forgetPassword.dto';
require('dotenv').config()
@Controller('auth')
export class AuthController {
    constructor( private authService:AuthService){}
@Post('signup')
@ApiBearerAuth()
@HttpCode(HttpStatus.CREATED)
async signup(@Body() body:CreateUsers){
    return await this.authService.signUp(body)
}
@Post('sendotp')
@ApiBearerAuth()
@HttpCode(HttpStatus.CREATED)
async sendOtp(@Body() body:EmailDto){
   return await this.authService.sendOtp(body.email)
}
@Post('login')
@HttpCode(HttpStatus.CREATED)
async login(@Body() body:LoginDto){
return await this.authService.login(body.email,body.password)
}

// @Post('verify')
// @HttpCode(HttpStatus.CREATED)
// async verifyEmail(@Body() {otp},@Res() res:any){
// return await this.authService.verificationEmail(otp)
// }


@Post('forgetpassword')
@HttpCode(HttpStatus.CREATED)
async forgetPassword(@Body() body:EmailDto){
    return await this.authService.forgetPassword(body.email)
}
@Put('retrievePassword')
@HttpCode(HttpStatus.CREATED)
async retrievePassword(@Body() body:RetriveDto,@Request() req:any){
    return await this.authService.retrievePassword(body,req)
}

@Put('changePassword')
@HttpCode(HttpStatus.CREATED)
async changePassword(@Body() body:ForgetPasswordDto){
    return await this.authService.changePassword(body)
}

}
