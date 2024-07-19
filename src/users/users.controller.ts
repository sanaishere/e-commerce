import { Controller,Post,Get,Delete,Put,Body,
    Param,Request,
    HttpCode,
    HttpStatus,
    UseInterceptors,
    ParseIntPipe,
    UseGuards
 } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUsers } from '../auth/dtos/create_user..dto';
import { pool } from 'src/common/config';
import { UpdateUser } from './dtos/update_user.dto';
import * as bcrypt from 'bcrypt'

import { authGuard } from 'src/common/auth.guard';
import { AdminGuard } from 'src/common/admin.guard';


require('dotenv').config()
@Controller('users')
export class UsersController {
 constructor(private userService:UsersService){
 }

@Put('editMyProfile')
@UseGuards(authGuard)
async editMyProfile(@Body() body:UpdateUser,@Request() {user}){
    return await this.userService.editProfile(user.id,body)
}

@Get('/myprofile')
@UseGuards(authGuard)
async getMyProfile(@Request() {user}) {
    return await this.userService.getMyProfile(user)
}
}

@Controller('admin')
export class AdminController{
    constructor(private userService:UsersService){
    }
@Get('getallusers')
@UseGuards(AdminGuard)
@UseGuards(authGuard)
async getAllUsers() {
  return await this.userService.getAllUsers()
}

@Get('/getuser/:userid')
@UseGuards(authGuard,AdminGuard)
async getUser(@Param('userid',ParseIntPipe) userId:number) {
return await this.userService.getUser(userId)
}

@Put('editProfile')
@UseGuards(authGuard,AdminGuard)
async editMyProfile(@Body() body:UpdateUser,@Request() {user}){
    return await this.userService.editProfile(user.id,body)
}

@Get('/myprofile')
@UseGuards(authGuard,AdminGuard)
async getMyProfile(@Request() {user}) {
    return await this.userService.getMyProfile(user)
}
}


