import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map, Observable } from 'rxjs';
import { GetStudentsResponse, Student } from '../../shared/models/student';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { CreateStudentInput } from '../../shared/models/create-student-model';
import { UpdateStudentInput } from '../../shared/models/update-student-model';

@Injectable({
  providedIn: 'root',
})
export class StudentsService {
  constructor(private readonly apollo: Apollo) {}

  getStudents(page: number, limit: number): Observable<GridDataResult> {
    return this.apollo
      .watchQuery<GetStudentsResponse>({
        query: gql`
          query {
            getAllStudents(paginationInput: { page: ${page}, limit: ${limit} }) {
              students {
                id
                firstName
                lastName
                email
                dateOfBirth
              }
              totalRecords
              totalPages
            }
          }
      `,
      })
      .valueChanges.pipe(
        map((res) => {
          return {
            data: res.data.getAllStudents.students,
            total: res.data.getAllStudents.totalRecords,
          };
        })
      );
  }

  createStudent(data: CreateStudentInput): Observable<Student> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ($createStudentInput: CreateStudentInput!) {
            createStudent(createStudentInput: $createStudentInput) {
              id
              firstName
              lastName
              dateOfBirth
              email
            }
          }
        `,
        variables: {
          createStudentInput: data,
        },
      })
      .pipe(map((result: any) => result.data.createStudent));
  }

  updateStudent(data: UpdateStudentInput): Observable<Student> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ($updateStudentInput: UpdateStudentInput!) {
            updateStudent(updateStudentInput: $updateStudentInput) {
              id
              firstName
              lastName
              dateOfBirth
              email
            }
          }
        `,
        variables: {
          updateStudentInput: data,
        },
      })
      .pipe(map((result: any) => result.data.updateStudent));
  }

  removeStudent(id: string): Observable<Student> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ($id: String!) {
            removeStudent(id: $id) {
              id
              firstName
              lastName
              dateOfBirth
              email
            }
          }
        `,
        variables: {
          id: id,
        },
      })
      .pipe(map((result: any) => result.data.removeStudent));
  }
}
