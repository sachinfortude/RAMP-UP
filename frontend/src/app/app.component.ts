import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { KENDO_BUTTONS } from '@progress/kendo-angular-buttons';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, KENDO_BUTTONS],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  public onButtonClick(): void {
    console.log('click');
    alert('Kendo Angular UI Button was clicked.');
  }
}
