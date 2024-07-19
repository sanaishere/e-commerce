import { HttpException } from "@nestjs/common";
import { IsEnum, IsNumber, IsOptional } from "class-validator";
enum sortBY{
    HIGHEST='DESC',
    LOWEST='ASC'
}

export class PaginateDto{
    @IsOptional()
    @IsNumber()
    page:number
    
    @IsOptional()
    @IsNumber()
    limit:number

    @IsOptional()
    @IsEnum(sortBY)
    sortByPrice:sortBY
}

