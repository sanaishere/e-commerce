import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class RetriveDto{
    @IsNotEmpty()
    @IsString()
    newPassword:string
    
    

}