import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { KENDO_GRID, PageChangeEvent } from '@progress/kendo-angular-grid';
import { AgePipe } from '../../shared/pipes/age.pipe';
import { Subscription } from 'rxjs';
import { StudentsService } from '../../core/services/students.service';
import { GridDataResult } from '@progress/kendo-angular-grid';

@Component({
  selector: 'app-students',
  imports: [KENDO_GRID, DatePipe, AgePipe],
  templateUrl: './students.component.html',
  styleUrl: './students.component.css',
})
export class StudentsComponent implements OnInit, OnDestroy {
  public students: GridDataResult = { data: [], total: 0 };
  pageSize = 5;
  skip = 0;

  private getStudentsSubscription?: Subscription;

  constructor(private studentsService: StudentsService) {}

  ngOnInit(): void {
    this.fetchStudents();
  }

  public fetchStudents() {
    const page = this.skip / this.pageSize + 1;
    this.getStudentsSubscription = this.studentsService
      .getStudents(page, this.pageSize)
      .subscribe({
        next: (res: GridDataResult) => {
          this.students = res;
        },
        error: (err) =>
          console.log('Error occured during fetching students', err),
      });
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.fetchStudents();
  }

  ngOnDestroy(): void {
    this.getStudentsSubscription?.unsubscribe();
  }
}
