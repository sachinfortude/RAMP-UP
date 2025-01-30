import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map, Observable } from 'rxjs';
import { GetStudentsResponse, Student } from '../../shared/models/student';
import { GridDataResult } from '@progress/kendo-angular-grid';

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
}
