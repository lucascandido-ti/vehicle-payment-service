import { IsEnum, IsNotEmpty, IsString, IsNumber } from "class-validator";
import { UserAction } from "../utils";

export class UserActionDTO {
  @IsString()
  @IsNotEmpty()
  paymentId: string;

  @IsNumber()
  @IsNotEmpty()
  saleId: number;

  @IsEnum(UserAction)
  @IsNotEmpty()
  action: UserAction;
}
