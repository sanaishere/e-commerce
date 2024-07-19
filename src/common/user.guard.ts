import { CanActivate, ExecutionContext, HttpException, HttpStatus } from "@nestjs/common"

export class UserGuard implements CanActivate{
    async canActivate(context: ExecutionContext): Promise<boolean>  {
         const req=context.switchToHttp().getRequest()
         const user=await req.user
         console.log(req.user)
         if(user.is_admin===true){
             throw new HttpException('admin can not buy products',HttpStatus.FORBIDDEN)
            }
            return true
     }
    
     
 }