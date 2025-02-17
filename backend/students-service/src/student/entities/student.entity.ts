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

  // Virtual field for age calculation
  @Field(() => Int, { description: 'Calculated age of the student' })
  get age(): number {
    return this.calculateAge();
  }

  calculateAge(): number {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }
}
