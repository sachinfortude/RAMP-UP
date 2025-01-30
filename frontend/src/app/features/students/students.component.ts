import { DatePipe } from '@angular/common';
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

@Component({
  selector: 'app-students',
  imports: [KENDO_GRID, DatePipe, AgePipe],
  templateUrl: './students.component.html',
  styleUrl: './students.component.css',
})
export class StudentsComponent implements OnInit, OnDestroy {
  public students: GridDataResult = { data: [], total: 0 };
  public formGroup?: FormGroup;
  pageSize = 5;
  skip = 0;

  private getStudentsSubscription?: Subscription;
  private editedRowIndex?: number;

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
    console.log('isNew?', isNew);
    console.log('Saving....', formGroup.value);

    if (isNew) {
      // studentsService.create()
    } else {
      // studentsService.update()
    }

    sender.closeRow(rowIndex);
  }

  public removeHandler(args: RemoveEvent): void {
    console.log('Removing data item', args.dataItem);
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
  }
}
