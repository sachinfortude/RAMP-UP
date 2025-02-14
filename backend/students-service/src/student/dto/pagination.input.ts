import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNumber, Max } from 'class-validator';

@InputType()
export class PaginationInput {
  @Field(() => Int, { defaultValue: 1 })
  @IsNumber()
  page: number;

  @Field(() => Int, { defaultValue: 10 })
  @IsNumber()
  @Max(50, { message: 'Limit cannot be greater than 50' })
  limit: number;
}
