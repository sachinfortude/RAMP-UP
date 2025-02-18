export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string | Date;
  age?: number;
}

export interface GetStudentsResponse {
  getAllStudents: {
    students: Student[];
    totalRecords: number;
    totalPages: number;
  };
}
