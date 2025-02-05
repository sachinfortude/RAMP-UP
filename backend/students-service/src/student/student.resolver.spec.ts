import { Test, TestingModule } from '@nestjs/testing';
import { StudentResolver } from './student.resolver';
import { StudentService } from './student.service';
import { CreateStudentInput } from './dto/create-student.input';
import { Student } from './entities/student.entity';
import { PaginationInput } from './dto/pagination.input';
import { PaginatedStudents } from './dto/paginated.output';
import { UpdateStudentInput } from './dto/update-student.input';
import { Course } from './entities/course.entity';

describe('EmployeeResolver', () => {
  let resolver: StudentResolver;
  let studentService: StudentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentResolver,
        {
          provide: StudentService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<StudentResolver>(StudentResolver);
    studentService = module.get<StudentService>(StudentService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('createStudent', () => {
    it('should call studentService.create with the correct input', async () => {
      // 1. Define the input and expected output
      const createStudentInput: CreateStudentInput = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('2000-01-01'),
        email: 'john.doe@example.com',
        courseId: 'course-1',
      };

      const expectedResult = {
        id: '1',
        ...createStudentInput,
      } as Student;

      // 2. Mock the service methods
      jest.spyOn(studentService, 'create').mockResolvedValue(expectedResult);

      // 3. Call the method under test
      const result = await resolver.createStudent(createStudentInput);

      // 4. Assertions
      expect(studentService.create).toHaveBeenCalledWith(createStudentInput);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should call studentService.findAll with the correct pagination input', async () => {
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

      const expectedResult = {
        students,
        totalPages: 1,
        totalRecords: 1,
      } as PaginatedStudents;

      // 2. Mock the service methods
      jest.spyOn(studentService, 'findAll').mockResolvedValue(expectedResult);

      // 3. Call the method under test
      const result = await resolver.findAll(paginationInput);

      // 4. Assertions
      expect(studentService.findAll).toHaveBeenCalledWith(paginationInput);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should call studentService.findOne with the correct id', async () => {
      // 1. Define the input and expected output
      const studentId = '1';
      const expectedResult = {
        id: studentId,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        dateOfBirth: new Date('2000-01-01'),
        courseId: 'course-1',
      } as Student;

      // 2. Mock the service methods
      jest.spyOn(studentService, 'findOne').mockResolvedValue(expectedResult);

      // 3. Call the method under test
      const result = await resolver.findOne(studentId);

      // 4. Assertions
      expect(studentService.findOne).toHaveBeenCalledWith(studentId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateStudent', () => {
    it('should call studentService.update with the correct id and input', async () => {
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

      const expectedResult = {
        id: studentId,
        firstName: 'John Updated',
        lastName: 'Doe Updated',
        dateOfBirth: new Date('2000-01-01'),
        email: 'john.doe.updated@example.com',
        courseId: 'course-1',
      } as Student;

      // 2. Mock the service methods
      jest.spyOn(studentService, 'update').mockResolvedValue(expectedResult);

      // 3. Call the method under test
      const result = await resolver.updateStudent(updateStudentInput);

      // 4. Assertions
      expect(studentService.update).toHaveBeenCalledWith(
        updateStudentInput.id,
        updateStudentInput,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('removeStudent', () => {
    it('should call studentService.remove with the correct id', async () => {
      // 1. Define the input and expected output
      const studentId = '1';
      const expectedResult = {
        id: studentId,
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('2000-01-01'),
        email: 'john.doe@example.com',
        courseId: 'course-1',
      } as Student;

      // 2. Mock the service methods
      jest.spyOn(studentService, 'remove').mockResolvedValue(expectedResult);

      // 3. Call the method under test
      const result = await resolver.removeStudent(studentId);

      // 4. Assertions
      expect(studentService.remove).toHaveBeenCalledWith(studentId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('course', () => {
    it('should return a Course object with the correct courseId', () => {
      const student = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('2000-01-01'),
        email: 'john.doe@example.com',
        courseId: 'course-1',
      } as Student;

      const expectedResult: any = {
        __typename: 'Course',
        id: 'course-1',
      };

      const result = resolver.course(student);

      expect(result).toEqual(expectedResult);
    });
  });
});
