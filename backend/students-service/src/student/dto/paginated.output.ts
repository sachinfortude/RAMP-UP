import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Student } from '../entities/student.entity';

@ObjectType()
export class PaginatedStudents {
  @Field(() => [Student])
  students: Student[];

  @Field(() => Int)
  totalRecords: number;

  @Field(() => Int)
  totalPages: number;
}
