import { InputType, Field } from '@nestjs/graphql';
import { GraphQLDateTimeISO } from 'graphql-scalars';

@InputType()
export class CreateStudentInput {
  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;

  @Field(() => GraphQLDateTimeISO)
  dateOfBirth: Date;
}
