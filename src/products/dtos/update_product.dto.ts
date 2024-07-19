import { PartialType } from "@nestjs/swagger";
import { CreateProductDto } from "./create_product.dto";

export class UpdateProductDto extends PartialType(CreateProductDto){

}