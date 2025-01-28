import { ObjectType, Directive, Field, ID } from '@nestjs/graphql';
import { Student } from './student.entity';

@ObjectType()
@Directive('@extends')
@Directive('@key(fields: "id")')
export class Course {
  @Field(() => ID)
  @Directive('@external')
  id: string;

  @Field(() => [Student], { nullable: true })
  students?: Student[];
}
