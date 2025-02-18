import { InputType, Field, PartialType } from '@nestjs/graphql';
import { IsUUID, IsNotEmpty } from 'class-validator';
import { CreateStudentInput } from './create-student.input';

@InputType()
export class UpdateStudentInput extends PartialType(CreateStudentInput) {
  @Field()
  @IsUUID()
  @IsNotEmpty({ message: 'Id is required' })
  id: string;
}
