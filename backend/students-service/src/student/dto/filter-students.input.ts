import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class FilterStudentsInput {
  @Field(() => Int)
  minAge: number;

  @Field(() => Int)
  maxAge: number;
}
