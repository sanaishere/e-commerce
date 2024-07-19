import { IsEmail, IsNotEmpty, IsString, MinLength} from "class-validator";

export class CreateUsers {
    @IsNotEmpty({message:'firstname should not be empty'})
    @IsString({message:'enter in type text'})
    firstname:string
    
    @IsNotEmpty({message:'lastname should not be empty'})
    @IsString({message:'enter in type text'})
    lastname:string
    
    @IsNotEmpty({message:'email should not be empty'})
    @IsString({message:'enter in type text'})
    @IsEmail()
    email:string

    @IsNotEmpty({message:'password should not be empty'})
    @IsString({message:'type in correct format'})
    @MinLength(6,{message:'password should be at least 6 digits'})
    password:string

    @IsNotEmpty({message:'otp should not be empty'})
    otp:number



}