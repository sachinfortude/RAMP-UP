import { Test, TestingModule } from '@nestjs/testing';
import { StudentService } from './student.service';
import { Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bullmq';
import { CreateStudentInput } from './dto/create-student.input';
import { PaginationInput } from './dto/pagination.input';
import { PaginatedStudents } from './dto/paginated.output';
import { NotFoundException } from '@nestjs/common';
import { UpdateStudentInput } from './dto/update-student.input';

describe('EmployeeService', () => {
  let service: StudentService;
  let studentsRepository: Repository<Student>;
  let studentImportQueue: Queue;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentService,
        {
          provide: getRepositoryToken(Student),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findAndCount: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getQueueToken('student-import'),
          useValue: {
            add: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StudentService>(StudentService);
    studentsRepository = module.get<Repository<Student>>(
      getRepositoryToken(Student),
    );
    studentImportQueue = module.get<Queue>(getQueueToken('student-import'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createStudentImportJob', () => {
    it('should add a job to the student import queue', async () => {
      // 1. Define the input and expected output
      const filePath = 'students.xlsx';

      const job = { id: 'job-1', name: 'importStudents' };

      // 2. Mock the queue.add() method
      jest.spyOn(studentImportQueue, 'add').mockResolvedValue(job as any);

      // 3. Call the method under test
      const result = await service.createStudentImportJob(filePath);

      // 4. Assertions
      expect(studentImportQueue.add).toHaveBeenCalledWith(
        'importStudents',
        { filePath },
        { attempts: 3 },
      );
      expect(result).toEqual(job);
    });
  });

  describe('create', () => {
    it('should create and save a new student', async () => {
      // 1. Define the input and expected output
      const createStudentInput: CreateStudentInput = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('2000-01-01'),
        email: 'john.doe@example.com',
        courseId: 'course-1',
      };

      const student = {
        id: '1',
        ...createStudentInput,
      } as Student;

      // 2. Mock the repository methods
      jest.spyOn(studentsRepository, 'create').mockReturnValue(student);
      jest.spyOn(studentsRepository, 'save').mockResolvedValue(student);

      // 3. Call the method under test
      const result = await service.create(createStudentInput);

      // 4. Assertions
      expect(studentsRepository.create).toHaveBeenCalledWith(
        createStudentInput,
      );
      expect(studentsRepository.save).toHaveBeenCalledWith(student);
      expect(result).toEqual(student);
    });
  });

  describe('findAll', () => {
    it('should return paginated students', async () => {
      // 1. Define the input and expected output
      const paginationInput: PaginationInput = {
        page: 1,
        limit: 10,
      };

      const students = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: new Date('2000-01-01'),
          email: 'john.doe@example.com',
          courseId: 'course-1',
        },
      ] as Student[];

      const totalRecords = 1;
      const expectedResult: PaginatedStudents = {
        students,
        totalRecords,
        totalPages: 1,
      };

      // 2. Mock the repository methods
      jest
        .spyOn(studentsRepository, 'findAndCount')
        .mockResolvedValue([students, totalRecords]);

      // 3. Call the method under test
      const result = await service.findAll(paginationInput);

      // 4. Assertions
      expect(studentsRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a student by id', async () => {
      // 1. Define the input and expected output
      const studentId = '1';
      const student = {
        id: studentId,
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('2000-01-01'),
        email: 'john.doe@example.com',
        courseId: 'course-1',
      } as Student;

      // 2. Mock the repository methods
      jest.spyOn(studentsRepository, 'findOne').mockResolvedValue(student);

      // 3. Call the method under test
      const result = await service.findOne(studentId);

      // 4. Assertions
      expect(studentsRepository.findOne).toHaveBeenCalledWith({
        where: { id: studentId },
      });
      expect(result).toEqual(student);
    });

    it('should throw NotFoundException if student is not found', async () => {
      const studentId = '1';
      jest.spyOn(studentsRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(studentId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a student', async () => {
      // 1. Define the input and expected output
      const studentId = '1';
      const updateStudentInput: UpdateStudentInput = {
        id: studentId,
        firstName: 'John Updated',
        lastName: 'Doe Updated',
        dateOfBirth: new Date('2000-01-01'),
        email: 'john.doe.updated@example.com',
        courseId: 'course-1',
      };

      const student = {
        id: studentId,
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('2000-01-01'),
        email: 'john.doe@example.com',
        courseId: 'course-1',
      } as Student;

      // 2. Mock the repository methods
      jest.spyOn(studentsRepository, 'findOne').mockResolvedValue(student);
      jest.spyOn(studentsRepository, 'save').mockResolvedValue({
        ...student,
        ...updateStudentInput,
      });

      // 3. Call the method under test
      const result = await service.update(studentId, updateStudentInput);

      // 4. Assertions
      expect(studentsRepository.findOne).toHaveBeenCalledWith({
        where: { id: studentId },
      });
      expect(studentsRepository.save).toHaveBeenCalledWith({
        ...student,
        ...updateStudentInput,
      });
      expect(result).toEqual({ ...student, ...updateStudentInput });
    });

    it('should throw NotFoundException if student is not found', async () => {
      const studentId = '1';
      const updateStudentInput: UpdateStudentInput = {
        id: studentId,
        firstName: 'John Updated',
        lastName: 'Doe Updated',
        dateOfBirth: new Date('2000-01-01'),
        email: 'john.doe.updated@example.com',
        courseId: 'course-1',
      };

      jest.spyOn(studentsRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.update(studentId, updateStudentInput),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a student', async () => {
      // 1. Define the input and expected output
      const studentId = '1';
      const student = {
        id: studentId,
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('2000-01-01'),
        email: 'john.doe@example.com',
        courseId: 'course-1',
      } as Student;

      // 2. Mock the repository methods
      jest.spyOn(studentsRepository, 'findOne').mockResolvedValue(student);
      jest.spyOn(studentsRepository, 'remove').mockResolvedValue(student);

      // 3. Call the method under test
      const result = await service.remove(studentId);

      // 4. Assertions
      expect(studentsRepository.findOne).toHaveBeenCalledWith({
        where: { id: studentId },
      });
      expect(studentsRepository.remove).toHaveBeenCalledWith(student);
      expect(result).toEqual(student);
    });

    it('should throw NotFoundException if student is not found', async () => {
      const studentId = '1';
      jest.spyOn(studentsRepository, 'findOne').mockResolvedValue(null);

      await expect(service.remove(studentId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('forCourse', () => {
    it('should return students for a course', async () => {
      // 1. Define the input and expected output
      const courseId = 'course-1';
      const students = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: new Date('2000-01-01'),
          email: 'john.doe@example.com',
          courseId,
        },
      ] as Student[];

      // 2. Mock the repository methods
      jest.spyOn(studentsRepository, 'find').mockResolvedValue(students);

      // 3. Call the method under test
      const result = await service.forCourse(courseId);

      // 4. Assertions
      expect(studentsRepository.find).toHaveBeenCalledWith({
        where: { courseId },
      });
      expect(result).toEqual(students);
    });
  });
});
