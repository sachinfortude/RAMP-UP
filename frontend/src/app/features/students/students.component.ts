import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { KENDO_GRID } from '@progress/kendo-angular-grid';
import { AgePipe } from '../../shared/pipes/age.pipe';
import { Student } from '../../shared/models/student';
import { Subscription } from 'rxjs';
import { StudentsService } from '../../core/services/students.service';

@Component({
  selector: 'app-students',
  imports: [KENDO_GRID, DatePipe, AgePipe],
  templateUrl: './students.component.html',
  styleUrl: './students.component.css',
})
export class StudentsComponent implements OnInit, OnDestroy {
  students: Student[] = [];
  page = 1;
  limit = 5;

  private getStudentsSubscription?: Subscription;

  constructor(private studentsService: StudentsService) {}

  ngOnInit(): void {
    this.getStudentsSubscription = this.studentsService
      .getStudents(this.page, this.limit)
      .subscribe({
        next: (res) => {
          this.students = res;
        },
        error: (err) =>
          console.log('Error occured during fetching students', err),
      });
  }

  ngOnDestroy(): void {
    this.getStudentsSubscription?.unsubscribe();
  }
}
