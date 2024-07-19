import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable,Request } from "@nestjs/common";
import { Observable } from "rxjs"
import { User } from "src/users/user.interface";

export class AdminGuard implements CanActivate{
   async canActivate(context: ExecutionContext): Promise<boolean>  {
        const req=context.switchToHttp().getRequest()
        const user=await req.user
        console.log(req.user)
        if(user.is_admin!==true){
            throw new HttpException('you are not allowed',HttpStatus.FORBIDDEN)
           }
           return true
    }
   
    
}