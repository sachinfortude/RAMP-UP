import { ObjectType, Field, Int, ID, Directive } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GraphQLDateTimeISO, GraphQLDate } from 'graphql-scalars';
import { Course } from './course.entity';

@ObjectType()
@Directive('@key(fields: "id")')
@Entity({ name: 'students' })
export class Student {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  firstName: string;

  @Field()
  @Column()
  lastName: string;

  @Field()
  @Column()
  email: string;

  @Field(() => GraphQLDate)
  @Column()
  dateOfBirth: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Field()
  @Column()
  courseId: string;

  @Field(() => Course)
  course: Course;
}
