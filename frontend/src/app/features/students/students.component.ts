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
import { KENDO_DIALOGS } from '@progress/kendo-angular-dialog';
import { KENDO_BUTTON } from '@progress/kendo-angular-buttons';
import { Subscription } from 'rxjs';
import { StudentsService } from '../../core/services/students.service';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { KENDO_NOTIFICATION } from '@progress/kendo-angular-notification';
import { NotificationService } from '@progress/kendo-angular-notification';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { CreateStudentInput } from '../../shared/models/create-student-model';
import { UpdateStudentInput } from '../../shared/models/update-student-model';
import { WebsocketService } from '../../core/services/websocket.service';
import { NgIf } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-students',
  imports: [KENDO_GRID, KENDO_DIALOGS, NgIf, KENDO_BUTTON, KENDO_NOTIFICATION],
  templateUrl: './students.component.html',
  styleUrl: './students.component.css',
})
export class StudentsComponent implements OnInit, OnDestroy {
  public students: GridDataResult = { data: [], total: 0 };
  public formGroup?: FormGroup;
  public isDialogOpened = false;
  public removeStudentId?: string;
  pageSize = 10;
  skip = 0;
  getStudentsSubscription?: Subscription;
  jobCompletedSubscription?: Subscription;
  private editedRowIndex?: number;

  constructor(
    private studentsService: StudentsService,
    private websocketService: WebsocketService,
    private notificationService: NotificationService
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
      dateOfBirth: new FormControl('', [
        Validators.required,
        this.futureDateValidator,
      ]),
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
      dateOfBirth: new FormControl(dataItem.dateOfBirth, [
        Validators.required,
        this.futureDateValidator,
      ]),
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
        courseId: environment.courseId,
      };
      this.studentsService.createStudent(reqBody).subscribe({
        next: (res) => {
          console.log('Student created successfully', res);
          this.notificationService.show({
            content: 'Student created successfully',
            hideAfter: 600,
            position: { horizontal: 'right', vertical: 'top' },
            animation: { type: 'fade', duration: 400 },
            type: { style: 'success', icon: true },
          });
          this.fetchStudents();
        },
        error: (err) => {
          console.log('Error occurred during creating the student', err);
          this.notificationService.show({
            content: 'Error occurred during creating the student',
            hideAfter: 600,
            position: { horizontal: 'right', vertical: 'top' },
            animation: { type: 'fade', duration: 400 },
            type: { style: 'error', icon: true },
          });
        },
      });
    } else {
      const reqBody: UpdateStudentInput = {
        id: formGroup.value.id,
        firstName: formGroup.value.firstName,
        lastName: formGroup.value.lastName,
        email: formGroup.value.email,
        dateOfBirth: formGroup.value.dateOfBirth,
        courseId: environment.courseId,
      };
      this.studentsService.updateStudent(reqBody).subscribe({
        next: (res) => {
          console.log('Student updated successfully', res);
          this.notificationService.show({
            content: 'Student updated successfully',
            hideAfter: 600,
            position: { horizontal: 'right', vertical: 'top' },
            animation: { type: 'fade', duration: 400 },
            type: { style: 'success', icon: true },
          });
          this.fetchStudents();
        },
        error: (err) => {
          console.log('Error occurred during updating the student', err);
          this.notificationService.show({
            content: 'Error occurred during updating the student',
            hideAfter: 600,
            position: { horizontal: 'right', vertical: 'top' },
            animation: { type: 'fade', duration: 400 },
            type: { style: 'error', icon: true },
          });
        },
      });
    }

    sender.closeRow(rowIndex);
  }

  public removeHandler(args: RemoveEvent): void {
    this.isDialogOpened = true;
    this.removeStudentId = args.dataItem.id;
  }

  private closeEditor(grid: GridComponent, rowIndex = this.editedRowIndex) {
    // close the editor
    grid.closeRow(rowIndex);
    // reset the helpers
    this.editedRowIndex = undefined;
    this.formGroup = undefined;
  }

  public closeDialog(status: string): void {
    console.log(`Dialog result: ${status}`);
    this.isDialogOpened = false;
    if (status === 'yes' && this.removeStudentId) {
      this.removeStudent(this.removeStudentId);
    }
  }

  private removeStudent(removeStudentId: string) {
    this.studentsService.removeStudent(removeStudentId).subscribe({
      next: (res) => {
        console.log('Student deleted successfully', res);
        // this.fetchStudents();
        this.notificationService.show({
          content: 'Student deleted successfully',
          hideAfter: 600,
          position: { horizontal: 'right', vertical: 'top' },
          animation: { type: 'fade', duration: 400 },
          type: { style: 'success', icon: true },
        });
        this.students = {
          data: this.students.data.filter(
            (student) => student.id !== removeStudentId
          ),
          total: this.students.total - 1,
        };
        this.removeStudentId = undefined;
      },
      error: (err) => {
        console.log('Error occurred during deleting the student', err);
        this.notificationService.show({
          content: 'Error occurred during deleting the student',
          hideAfter: 600,
          position: { horizontal: 'right', vertical: 'top' },
          animation: { type: 'fade', duration: 400 },
          type: { style: 'error', icon: true },
        });
      },
    });
  }

  private futureDateValidator: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {
    const selectedDate = new Date(control.value);
    const today = new Date();

    if (selectedDate > today) {
      return { futureDate: true }; // Validation error
    }
    return null; // Valid date
  };

  ngOnDestroy(): void {
    this.getStudentsSubscription?.unsubscribe();
    this.jobCompletedSubscription?.unsubscribe(); // Unsubscribe to prevent memory leaks
  }
}
