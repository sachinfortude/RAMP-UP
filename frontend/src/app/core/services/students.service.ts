import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map, Observable } from 'rxjs';
import { GetStudentsResponse, Student } from '../../shared/models/student';

@Injectable({
  providedIn: 'root',
})
export class StudentsService {
  constructor(private readonly apollo: Apollo) {}

  getStudents(page: number, limit: number): Observable<Student[]> {
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
          return res.data.getAllStudents.students;
        })
      );
  }
}
