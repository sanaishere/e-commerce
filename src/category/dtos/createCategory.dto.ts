import { IsNotEmpty, IsString } from "class-validator";

export class CreateCategoryDto{
    @IsNotEmpty({message:'name should not be empty'})
    @IsString({message:'enter in type text'})
    name:string
}