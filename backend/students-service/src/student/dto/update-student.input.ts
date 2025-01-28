import { GraphQLDateTimeISO, GraphQLDate } from 'graphql-scalars';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateStudentInput {
  @Field()
  id: string;

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
