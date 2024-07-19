import { IsEmail, IsNotEmpty, IsString } from "class-validator";
export class EmailDto {
@IsNotEmpty({message:'email should not be empty'})
@IsString({message:'enter in type text'})
@IsEmail()
email:string
}