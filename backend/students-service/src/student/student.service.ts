import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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
    const job = await this.studentImportQueue.add(
      'importStudents',
      { filePath },
      { attempts: 3 },
    );
    return job;
  }

  async create(createStudentInput: CreateStudentInput): Promise<Student> {
    const student = this.studentsRepository.create(createStudentInput);
    return await this.studentsRepository.save(student);
  }

  async findAll() {
    return await this.studentsRepository.find();
  }

  async fetchPaginatedStudents(
    paginationInput: PaginationInput,
  ): Promise<PaginatedStudents> {
    const { page, limit } = paginationInput;
    const skip = (page - 1) * limit;

    const [students, totalRecords] = await this.studentsRepository.findAndCount(
      {
        skip,
        take: limit,
        order: { createdAt: 'DESC' },
      },
    );

    return {
      students,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
    };
  }

  async findOne(id: string): Promise<Student> {
    const student = await this.studentsRepository.findOne({ where: { id } });

    if (!student) {
      this.logger.warn(`Student not found with ID: ${id}`);
      throw new NotFoundException(`Record cannot find by id ${id}`);
    }

    return student;
  }

  async update(
    id: string,
    updateStudentInput: UpdateStudentInput,
  ): Promise<Student> {
    const student = await this.studentsRepository.preload({
      ...updateStudentInput,
    });

    if (!student) {
      this.logger.warn(`Student not found with ID: ${id}`);
      throw new NotFoundException(`Record cannot find by id ${id}`);
    }

    return await this.studentsRepository.save(student);
  }

  async remove(id: string): Promise<Student> {
    const student = await this.studentsRepository.findOne({ where: { id } });

    if (!student) {
      this.logger.warn(`Student not found with ID: ${id}`);
      throw new NotFoundException(`Record cannot find by id ${id}`);
    }

    this.studentsRepository.remove(student);
    return student;
  }

  async forCourse(courseId: string): Promise<Student[]> {
    return await this.studentsRepository.find({ where: { courseId } });
  }

  async filterStudentsByAge(minAge: number, maxAge: number) {
    await this.kafkaProducerService.produce({
      topic: 'student-filter',
      messages: [{ value: JSON.stringify({ minAge, maxAge }) }],
    });

    return { message: 'Filter process started' };
  }
}
