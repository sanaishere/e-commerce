import { IsNotEmpty, IsNumber, Max, Min} from "class-validator";

export class ReviewDto{
    @IsNotEmpty({message:'enter rating'})
    @IsNumber()
    @Min(1)
    @Max(5)
    rating:number
}