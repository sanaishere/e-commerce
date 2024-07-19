import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator"

export class LoginDto{
    @IsNotEmpty({message:'email should not be empty'})
    @IsString({message:'enter in type text'})
    @IsEmail()
    email:string

    @IsNotEmpty({message:'lastname should not be empty'})
    @IsString({message:'type in correct format'})
    @MinLength(6,{message:'password should be at least 6 digits'})
    password:string
}