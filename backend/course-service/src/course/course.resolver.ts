import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ResolveReference,
} from '@nestjs/graphql';
import { CourseService } from './course.service';
import { Course } from './entities/course.entity';
import { CreateCourseInput } from './dto/create-course.input';
import { UpdateCourseInput } from './dto/update-course.input';

@Resolver(() => Course)
export class CourseResolver {
  constructor(private readonly courseService: CourseService) {}

  @Mutation(() => Course)
  createCourse(
    @Args('createCourseInput') createCourseInput: CreateCourseInput,
  ) {
    return this.courseService.create(createCourseInput);
  }

  @Query(() => [Course], { name: 'getAllCourses' })
  findAll() {
    return this.courseService.findAll();
  }

  @Query(() => Course, { name: 'getCourseById' })
  findOne(@Args('id') id: string) {
    return this.courseService.findOne(id);
  }

  @Mutation(() => Course)
  updateCourse(
    @Args('updateCourseInput') updateCourseInput: UpdateCourseInput,
  ) {
    return this.courseService.update(updateCourseInput.id, updateCourseInput);
  }

  @Mutation(() => Course)
  removeCourse(@Args('id') id: string) {
    return this.courseService.remove(id);
  }

  @ResolveReference()
  resolveReference(reference: { __typename: string; id: string }) {
    return this.courseService.findOne(reference.id);
  }
}
