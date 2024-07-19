import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"

export class CreateProductDto{
    @IsNotEmpty({message:'name should not be empty'})
    @IsString({message:'enter in type text'})
    name:string
    
    @IsNotEmpty({message:'price should not be empty'})
  //  @IsNumber()
    price:number
    
    @IsNotEmpty({message:'quantity should not be empty'})
   // @IsNumber()
    quantity:number

    
    @IsString({message:'type in correct format'})
    @IsOptional()
    imageSrc:string
    
    @IsNotEmpty({message:'determine category'})
  //  @IsNumber()
    category_id:number

}