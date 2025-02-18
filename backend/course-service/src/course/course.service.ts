import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCourseInput } from './dto/create-course.input';
import { UpdateCourseInput } from './dto/update-course.input';
import { Course } from './entities/course.entity';

@Injectable()
export class CourseService {
  private readonly logger = new Logger(CourseService.name);

  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async create(createCourseInput: CreateCourseInput): Promise<Course> {
    const course = this.courseRepository.create(createCourseInput);
    return await this.courseRepository.save(course);
  }

  async findAll(): Promise<Course[]> {
    return await this.courseRepository.find();
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (!course) {
      this.logger.warn(`Course not found with ID: ${id}`);
      throw new NotFoundException(`Record not found with id ${id}`);
    }
    return course;
  }

  async update(
    id: string,
    updateCourseInput: UpdateCourseInput,
  ): Promise<Course> {
    const course = await this.courseRepository.preload({
      ...updateCourseInput,
    });
    if (!course) {
      this.logger.warn(`Course not found with ID: ${id}`);
      throw new NotFoundException(`Record not found with id ${id}`);
    }
    return await this.courseRepository.save(course);
  }

  async remove(id: string): Promise<Course> {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (!course) {
      this.logger.warn(`Course not found with ID: ${id}`);
      throw new NotFoundException(`Record not found with id ${id}`);
    }
    this.courseRepository.remove(course);
    return course;
  }
}
