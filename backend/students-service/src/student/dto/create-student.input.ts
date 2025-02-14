import { InputType, Field } from '@nestjs/graphql';
import { GraphQLDate } from 'graphql-scalars';
import {
  IsString,
  IsEmail,
  IsDate,
  MaxDate,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class CreateStudentInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @Field()
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @Field(() => GraphQLDate)
  @IsDate()
  @MaxDate(new Date(), { message: 'Date of birth cannot be in the future' })
  @IsNotEmpty({ message: 'Date of birth is required' })
  @Type(() => Date)
  dateOfBirth: Date;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Course ID is required' })
  courseId: string;
}
