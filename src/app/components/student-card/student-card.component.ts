import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Student } from '../../interfaces/student.interface';

@Component({
  selector: 'app-student-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-card.component.html'
})
export class StudentCardComponent {
  student = input.required<Student | null>();
}
