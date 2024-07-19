import { PartialType } from "@nestjs/swagger";
import { CreateUsers } from "../../auth/dtos/create_user..dto";

export class UpdateUser extends PartialType(CreateUsers){}