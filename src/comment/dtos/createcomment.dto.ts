import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CommentDto{
@IsNotEmpty({message:'enter text'})
@IsString()
text:string

@IsNotEmpty({message:'determine product'})
@IsNumber()
productId:number
}