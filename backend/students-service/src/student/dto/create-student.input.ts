import { InputType, Field } from '@nestjs/graphql';
import { GraphQLDateTimeISO, GraphQLDate } from 'graphql-scalars';

@InputType()
export class CreateStudentInput {
  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;

  @Field(() => GraphQLDate)
  dateOfBirth: Date;

  @Field()
  courseId: string;
}
