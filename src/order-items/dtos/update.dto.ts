import { IsNumber } from "class-validator";

export class UpdateDto{
    @IsNumber()
    number1: number;
  }