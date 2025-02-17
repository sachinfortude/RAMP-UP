import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStudentInput } from './dto/create-student.input';
import { UpdateStudentInput } from './dto/update-student.input';
import { Student } from './entities/student.entity';
import { PaginationInput } from './dto/pagination.input';
import { PaginatedStudents } from './dto/paginated.output';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ProducerService } from '../kafka/producer/producer.service';

@Injectable()
export class StudentService {
  private readonly logger = new Logger(StudentService.name);

  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    @InjectQueue('student-import')
    private readonly studentImportQueue: Queue,
    private readonly kafkaProducerService: ProducerService,
  ) {}

  async createStudentImportJob(filePath: string) {
    try {
      const job = await this.studentImportQueue.add(
        'importStudents',
        { filePath },
        { attempts: 3 },
      );
      return job;
    } catch (error) {
      this.logger.error(
        `Failed to create student import job: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to create student import job',
      );
    }
  }

  async create(createStudentInput: CreateStudentInput): Promise<Student> {
    try {
      const student = this.studentsRepository.create(createStudentInput);
      return await this.studentsRepository.save(student);
    } catch (error) {
      this.logger.error(
        `Failed to create student: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to create student');
    }
  }

  async findAll() {
    try {
      return await this.studentsRepository.find();
    } catch (error) {
      this.logger.error(
        `Error fetching students: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch students');
    }
  }

  async fetchPaginatedStudents(
    paginationInput: PaginationInput,
  ): Promise<PaginatedStudents> {
    try {
      const { page, limit } = paginationInput;
      const skip = (page - 1) * limit;

      const [students, totalRecords] =
        await this.studentsRepository.findAndCount({
          skip,
          take: limit,
          order: {
            createdAt: 'DESC',
          },
        });

      return {
        students,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
      };
    } catch (error) {
      this.logger.error(
        `Error fetching students: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch students');
    }
  }

  async findOne(id: string): Promise<Student> {
    try {
      const student = await this.studentsRepository.findOne({ where: { id } });

      if (!student) {
        this.logger.warn(`Student not found with ID: ${id}`);
        throw new NotFoundException(`Record cannot find by id ${id}`);
      }

      return student;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Re-throw NotFoundException
      }
      this.logger.error(
        `Failed to fetch student with ID ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch student');
    }
  }

  async update(
    id: string,
    updateStudentInput: UpdateStudentInput,
  ): Promise<Student> {
    try {
      let student = await this.studentsRepository.findOne({ where: { id } });

      if (!student) {
        this.logger.warn(`Student not found with ID: ${id}`);
        throw new NotFoundException(`Record cannot find by id ${id}`);
      }

      student.firstName = updateStudentInput.firstName;
      student.lastName = updateStudentInput.lastName;
      student.dateOfBirth = updateStudentInput.dateOfBirth;
      student.email = updateStudentInput.email;
      student.courseId = updateStudentInput.courseId;

      return this.studentsRepository.save(student);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Re-throw NotFoundException
      }
      this.logger.error(
        `Failed to update student with ID ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to update student');
    }
  }

  async remove(id: string): Promise<Student> {
    try {
      let student = await this.studentsRepository.findOne({ where: { id } });

      if (!student) {
        this.logger.warn(`Student not found with ID: ${id}`);
        throw new NotFoundException(`Record cannot find by id ${id}`);
      }

      this.studentsRepository.remove(student);
      return student;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Re-throw NotFoundException
      }
      this.logger.error(
        `Failed to delete student with ID ${id}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to delete student');
    }
  }

  async forCourse(courseId: string): Promise<Student[]> {
    try {
      return await this.studentsRepository.find({
        where: {
          courseId,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to fetch students for course ID ${courseId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to fetch students for course',
      );
    }
  }

  async filterStudentsByAge(minAge: number, maxAge: number) {
    try {
      await this.kafkaProducerService.produce({
        topic: 'student-filter',
        messages: [{ value: JSON.stringify({ minAge, maxAge }) }],
      });

      return { message: 'Filter process started' };
    } catch (error) {
      this.logger.error(
        `Failed to filter students by age: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to filter students by age',
      );
    }
  }
}
