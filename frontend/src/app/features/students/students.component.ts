import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AddEvent,
  CancelEvent,
  EditEvent,
  GridComponent,
  KENDO_GRID,
  PageChangeEvent,
  RemoveEvent,
  SaveEvent,
} from '@progress/kendo-angular-grid';
import { AgePipe } from '../../shared/pipes/age.pipe';
import { Subscription } from 'rxjs';
import { StudentsService } from '../../core/services/students.service';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CreateStudentInput } from '../../shared/models/create-student-model';
import { UpdateStudentInput } from '../../shared/models/update-student-model';
import { WebsocketService } from '../../core/services/websocket.service';

@Component({
  selector: 'app-students',
  imports: [KENDO_GRID, AgePipe],
  templateUrl: './students.component.html',
  styleUrl: './students.component.css',
})
export class StudentsComponent implements OnInit, OnDestroy {
  public students: GridDataResult = { data: [], total: 0 };
  public formGroup?: FormGroup;
  pageSize = 10;
  skip = 0;

  private getStudentsSubscription?: Subscription;
  private jobCompletedSubscription?: Subscription;
  private editedRowIndex?: number;

  constructor(
    private studentsService: StudentsService,
    private websocketService: WebsocketService
  ) {}

  ngOnInit(): void {
    this.fetchStudents();

    // Subscribe to WebSocket event when a job is completed
    this.jobCompletedSubscription = this.websocketService
      .onJobCompleted()
      .subscribe((message) => {
        console.log('Job Completed:', message);
        this.fetchStudents(); // Automatically refresh the grid when new students are added
      });
  }

  public fetchStudents() {
    const page = this.skip / this.pageSize + 1;
    this.getStudentsSubscription = this.studentsService
      .getStudents(page, this.pageSize)
      .subscribe({
        next: (res: GridDataResult) => {
          this.students = res;
          console.log(this.students);
        },
        error: (err) =>
          console.log('Error occured during fetching students', err),
      });
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.fetchStudents();
  }

  public addHandler(args: AddEvent): void {
    this.closeEditor(args.sender);
    // define all editable fields validators and default values
    this.formGroup = new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      dateOfBirth: new FormControl('', Validators.required),
    });
    // show the new row editor, with the `FormGroup` build above
    args.sender.addRow(this.formGroup);
  }

  public editHandler(args: EditEvent): void {
    console.log('edit handler clicked');
    const { dataItem } = args;
    this.closeEditor(args.sender);

    this.formGroup = new FormGroup({
      id: new FormControl(dataItem.id),
      firstName: new FormControl(dataItem.firstName, Validators.required),
      lastName: new FormControl(dataItem.lastName, Validators.required),
      email: new FormControl(dataItem.email, [
        Validators.required,
        Validators.email,
      ]),
      dateOfBirth: new FormControl(dataItem.dateOfBirth, Validators.required),
    });

    this.editedRowIndex = args.rowIndex;
    // put the row in edit mode, with the `FormGroup` build above
    args.sender.editRow(args.rowIndex, this.formGroup);
  }

  public cancelHandler(args: CancelEvent): void {
    this.closeEditor(args.sender, args.rowIndex);
  }

  public saveHandler({ sender, rowIndex, formGroup, isNew }: SaveEvent): void {
    if (isNew) {
      const reqBody: CreateStudentInput = {
        firstName: formGroup.value.firstName,
        lastName: formGroup.value.lastName,
        email: formGroup.value.email,
        dateOfBirth: formGroup.value.dateOfBirth,
        courseId: '35558825-6635-4860-94e1-b977dc30c475',
      };
      this.studentsService.createStudent(reqBody).subscribe({
        next: (res) => {
          console.log('Student created successfully', res);
          this.fetchStudents();
        },
        error: (err) => {
          console.log('Error occurred during creating the student', err);
        },
      });
    } else {
      const reqBody: UpdateStudentInput = {
        id: formGroup.value.id,
        firstName: formGroup.value.firstName,
        lastName: formGroup.value.lastName,
        email: formGroup.value.email,
        dateOfBirth: formGroup.value.dateOfBirth,
        courseId: '35558825-6635-4860-94e1-b977dc30c475',
      };
      this.studentsService.updateStudent(reqBody).subscribe({
        next: (res) => {
          console.log('Student updated successfully', res);
          this.fetchStudents();
        },
        error: (err) => {
          console.log('Error occurred during updating the student', err);
        },
      });
    }

    sender.closeRow(rowIndex);
  }

  public removeHandler(args: RemoveEvent): void {
    this.studentsService.removeStudent(args.dataItem.id).subscribe({
      next: (res) => {
        console.log('Student deleted successfully', res);
        // this.fetchStudents();
        this.students = {
          data: this.students.data.filter(
            (student) => student.id !== args.dataItem.id
          ),
          total: this.students.total - 1,
        };
      },
      error: (err) => {
        console.log('Error occurred during deleting the student', err);
      },
    });
  }

  private closeEditor(grid: GridComponent, rowIndex = this.editedRowIndex) {
    // close the editor
    grid.closeRow(rowIndex);
    // reset the helpers
    this.editedRowIndex = undefined;
    this.formGroup = undefined;
  }

  ngOnDestroy(): void {
    this.getStudentsSubscription?.unsubscribe();
    this.jobCompletedSubscription?.unsubscribe(); // Unsubscribe to prevent memory leaks
  }
}
