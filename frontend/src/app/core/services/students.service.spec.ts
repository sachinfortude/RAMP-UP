import { TestBed } from '@angular/core/testing';
import { StudentsService } from './students.service';
import { Apollo } from 'apollo-angular';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { UpdateStudentInput } from '../../shared/models/update-student-model';
import { CreateStudentInput } from '../../shared/models/create-student-model';

describe('StudentsService', () => {
  let service: StudentsService;
  let apolloMock: jasmine.SpyObj<Apollo>;
  let httpClientMock: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    // Create spy objects for Apollo and HttpClient
    apolloMock = jasmine.createSpyObj('Apollo', ['watchQuery', 'mutate']);
    httpClientMock = jasmine.createSpyObj('HttpClient', ['post']);

    TestBed.configureTestingModule({
      providers: [
        StudentsService,
        { provide: Apollo, useValue: apolloMock },
        { provide: HttpClient, useValue: httpClientMock },
      ],
    });

    service = TestBed.inject(StudentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('importStudents', () => {
    it('should upload a file using HttpClient', () => {
      const mockFile = new File([''], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }); // ✅ XLSX file
      const mockResponse = { message: 'File uploaded successfully' };

      httpClientMock.post.and.returnValue(of(mockResponse));

      service.importStudents(mockFile).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      expect(httpClientMock.post).toHaveBeenCalledWith(
        'http://localhost:3000/student/import',
        jasmine.any(FormData)
      );
    });
  });

  describe('getStudents', () => {
    it('should fetch students using Apollo', () => {
      const mockResponse = {
        data: {
          getAllStudents: {
            students: [
              {
                id: '1',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                dateOfBirth: '2000-01-01',
              },
            ],
            totalRecords: 1,
            totalPages: 1,
          },
        },
      };
      const mockGridDataResult: GridDataResult = {
        data: [
          {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            dateOfBirth: new Date('2000-01-01'),
          },
        ],
        total: 1,
      };

      apolloMock.watchQuery.and.returnValue({
        valueChanges: of(mockResponse),
      } as any);

      service.getStudents(1, 10).subscribe((result) => {
        expect(result).toEqual(mockGridDataResult);
      });

      expect(apolloMock.watchQuery).toHaveBeenCalledWith({
        query: jasmine.any(Object),
        fetchPolicy: 'no-cache',
      });
    });
  });

  describe('createStudent', () => {
    it('should create a student using Apollo', () => {
      // Mock input data
      const mockInput: CreateStudentInput = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        dateOfBirth: '2000-01-01',
        courseId: 'da44b53a-13f0-4fb9-be1c-caad4fdb142d',
      };

      // Mock response data
      const mockResponse = {
        data: {
          createStudent: {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            dateOfBirth: '2000-01-01',
          },
        },
      };

      // Mock Apollo's mutate method to return the mock response
      apolloMock.mutate.and.returnValue(of(mockResponse));

      // Call the method and verify the result
      service.createStudent(mockInput).subscribe((result) => {
        expect(result).toEqual(mockResponse.data.createStudent);
      });

      // Verify that Appollo's mutate method was called correctly
      expect(apolloMock.mutate).toHaveBeenCalledWith({
        mutation: jasmine.any(Object), // Verify that a GraphQL mutation was passed.
        variables: { createStudentInput: mockInput }, // Verify the input data
      });
    });
  });

  describe('updateStudent', () => {
    it('should update a student using Apollo', () => {
      // Mock input data
      const mockInput: UpdateStudentInput = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        dateOfBirth: '2000-01-01',
        courseId: 'da44b53a-13f0-4fb9-be1c-caad4fdb142d',
      };

      // Mock response data
      const mockResponse = {
        data: {
          updateStudent: {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            dateOfBirth: '2000-01-01',
          },
        },
      };

      // Mock Apollo's mutate method to return the mock response
      apolloMock.mutate.and.returnValue(of(mockResponse));

      // Call the method and verify the result
      service.updateStudent(mockInput).subscribe((result) => {
        expect(result).toEqual(mockResponse.data.updateStudent);
      });

      // Verify that Appollo's mutate method was called correctly
      expect(apolloMock.mutate).toHaveBeenCalledWith({
        mutation: jasmine.any(Object), // Verify that a GraphQL mutation was passed.
        variables: { updateStudentInput: mockInput }, // Verify the input data
      });
    });
  });

  describe('removeStudent', () => {
    it('should remove a student using Apollo', () => {
      // Mock input data
      const mockId = '1';

      // Mock response data
      const mockResponse = {
        data: {
          removeStudent: {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            dateOfBirth: '2000-01-01',
          },
        },
      };

      // Mock Apollo's mutate method to return the mock response
      apolloMock.mutate.and.returnValue(of(mockResponse));

      // Call the method and verify the result
      service.removeStudent(mockId).subscribe((result) => {
        expect(result).toEqual(mockResponse.data.removeStudent);
      });

      // Verify that Appollo's mutate method was called correctly
      expect(apolloMock.mutate).toHaveBeenCalledWith({
        mutation: jasmine.any(Object), // Verify that a GraphQL mutation was passed.
        variables: { id: mockId }, // Verify the input data
      });
    });
  });
});
