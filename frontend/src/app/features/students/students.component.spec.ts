import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentsComponent } from './students.component';
import { StudentsService } from '../../core/services/students.service';
import { WebsocketService } from '../../core/services/websocket.service';
import {
  AddEvent,
  EditEvent,
  GridDataResult,
  PageChangeEvent,
  RemoveEvent,
  SaveEvent,
} from '@progress/kendo-angular-grid';
import { of, Subscription } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Student } from '../../shared/models/student';

describe('StudentsComponent', () => {
  let component: StudentsComponent;
  let fixture: ComponentFixture<StudentsComponent>;
  let mockStudentsService: jasmine.SpyObj<StudentsService>;
  let mockWebsocketService: jasmine.SpyObj<WebsocketService>;

  beforeEach(async () => {
    // Create spy objects for the services
    mockStudentsService = jasmine.createSpyObj('StudentsService', [
      'getStudents',
      'createStudent',
      'updateStudent',
      'removeStudent',
    ]);
    mockWebsocketService = jasmine.createSpyObj('WebsocketService', [
      'onJobCompleted',
    ]);

    await TestBed.configureTestingModule({
      imports: [StudentsComponent],
      providers: [
        { provide: StudentsService, useValue: mockStudentsService },
        { provide: WebsocketService, useValue: mockWebsocketService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch students on init', () => {
    const mockStudents: GridDataResult = {
      data: [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          dateOfBirth: '2000-01-01',
        },
      ],
      total: 1,
    }; // Mock data to be returned by the StudentsService

    mockStudentsService.getStudents.and.returnValue(of(mockStudents)); // Mock the getStudents method to  return the mock data
    mockWebsocketService.onJobCompleted.and.returnValue(of('jobCompleted')); // Mock the Websocket service to return an observable<string>

    fixture.detectChanges(); // Triggers ngOnInit

    // Assertions
    expect(mockStudentsService.getStudents).toHaveBeenCalledWith(1, 10);
    expect(component.students).toEqual(mockStudents);
  });

  it('should unsubscribe on destroy', () => {
    const mockSubscription = new Subscription(); // Create a mock Subscription instance
    spyOn(mockSubscription, 'unsubscribe'); // Spy on the 'unsubscribe' method of the Subscription

    // Assign the mock subscription to component's subscription properties
    component.getStudentsSubscription = mockSubscription;
    component.jobCompletedSubscription = mockSubscription;

    component.ngOnDestroy(); // Manually trigger the component's ngOnDestroy lifecycle hook

    // Verify that 'unsubscribe' was called twice (once per subscription)
    expect(mockSubscription.unsubscribe).toHaveBeenCalledTimes(2);
  });

  it('should handle page change', () => {
    const mockPageChangeEvent: PageChangeEvent = { skip: 10, take: 10 };
    spyOn(component, 'fetchStudents');

    component.pageChange(mockPageChangeEvent);

    expect(component.skip).toBe(10);
    expect(component.fetchStudents).toHaveBeenCalled();
  });

  it('should add a new student', () => {
    // Mocking the AddEvent Object
    const mockAddEvent = {
      sender: jasmine.createSpyObj('GridComponent', ['addRow', 'closeRow']), // ✅ Mocking a grid component with spies for 'addRow' and 'closeRow'
      isNew: true, // ✅ Indicates that this is a new record being added
      dataItem: {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        dateOfBirth: '2000-01-01',
      },
    } as AddEvent;

    component.addHandler(mockAddEvent); // Calling the addHandler Method (This simulates a user clicking "Add" in the UI grid.)

    // Assertions
    expect(component.formGroup).toBeDefined(); // Validating the Form is Created
    expect(mockAddEvent.sender.addRow).toHaveBeenCalledWith(
      component.formGroup
    ); // Checking if addRow was Called Correctly
  });

  it('should edit a student', () => {
    const mockEditEvent = {
      sender: jasmine.createSpyObj('GridComponent', ['editRow', 'closeRow']),
      isNew: false,
      rowIndex: 0,
      dataItem: {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        dateOfBirth: '2000-01-01',
      },
    } as EditEvent;

    component.editHandler(mockEditEvent);

    expect(component.formGroup).toBeDefined();
    expect(mockEditEvent.sender.editRow).toHaveBeenCalledWith(
      0,
      component.formGroup
    );
  });

  it('should save a new student', () => {
    const mockSaveEvent = {
      sender: jasmine.createSpyObj('GridComponent', ['closeRow']),
      rowIndex: 1,
      formGroup: new FormGroup({
        firstName: new FormControl('John', Validators.required),
        lastName: new FormControl('Doe', Validators.required),
        email: new FormControl('john@example.com', [
          Validators.required,
          Validators.email,
        ]),
        dateOfBirth: new FormControl('2000-01-01', Validators.required),
      }),
      isNew: true,
    } as SaveEvent;

    mockStudentsService.createStudent.and.returnValue(of({} as Student));
    spyOn(component, 'fetchStudents'); // Spy on fetchStudents to verify it gets called

    component.saveHandler(mockSaveEvent);

    expect(mockStudentsService.createStudent).toHaveBeenCalledWith({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      dateOfBirth: '2000-01-01',
      courseId: 'da44b53a-13f0-4fb9-be1c-caad4fdb142d',
    });
    expect(component.fetchStudents).toHaveBeenCalled();
    expect(mockSaveEvent.sender.closeRow).toHaveBeenCalledWith(1);
  });

  it('should open dialog when removing a student', () => {
    const mockRemoveEvent = {
      dataItem: { id: '1' },
    } as RemoveEvent;

    component.removeHandler(mockRemoveEvent);

    // Check if the dialog is opened
    expect(component.isDialogOpened).toBeTrue();
    expect(component.removeStudentId).toBe('1'); // Ensure student ID is set
  });

  it('should remove a student after confirmation', () => {
    const mockRemoveEvent = {
      dataItem: { id: '1' },
    } as RemoveEvent;

    mockStudentsService.removeStudent.and.returnValue(of({} as Student)); // Mock the removeStudent API call

    // Step 1: Call removeHandler to open the dialog and set removeStudentId
    component.removeHandler(mockRemoveEvent);
    expect(component.isDialogOpened).toBeTrue();
    expect(component.removeStudentId).toBe('1');

    // Step 2: Simulate user clicking "Yes" in confirmation dialog
    component.closeDialog('yes');

    // Step 3: Ensure removeStudent was called with the correct student ID
    expect(mockStudentsService.removeStudent).toHaveBeenCalledWith('1');
  });

  it('should subscribe to WebSocket job completed event', () => {
    const mockWebsocketMessage = 'Job completed';
    mockWebsocketService.onJobCompleted.and.returnValue(
      of(mockWebsocketMessage)
    );
    spyOn(component, 'fetchStudents');

    fixture.detectChanges(); // Triggers ngOnInit

    expect(mockWebsocketService.onJobCompleted).toHaveBeenCalled();
    expect(component.fetchStudents).toHaveBeenCalled();
  });
});
