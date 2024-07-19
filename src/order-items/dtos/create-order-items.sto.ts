import { IsNotEmpty, IsNumber } from "class-validator";

export class Order_itemDto{
        @IsNotEmpty({message:'number of products  should not be empty'})
        @IsNumber()
        number:number

        @IsNotEmpty({message:'number of products  should not be empty'})
        @IsNumber()
        product_id:number
        
}