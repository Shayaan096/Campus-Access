import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { StudentService } from '../../services/student.service';
import { ToastService } from '../../services/toast.service';
import { Student } from '../../interfaces/student.interface';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule, IonicModule],
    templateUrl: './register.page.html',
    styles: [`
    :host {
      --ion-background-color: #f8fafc;
    }
  `]
})
export class RegisterPage {
    private studentService = inject(StudentService);
    private toastService = inject(ToastService);
    private router = inject(Router);

    isLoading = signal(false);

    onRegister(value: any) {
        console.log('[RegisterPage] Form Submission Started:', {
            ...value,
            time: new Date().toLocaleString()
        });

        if (!value.name || !value.rollNo || !value.fatherName || !value.email || !value.department) {
            console.warn('[RegisterPage] Validation Failed: Missing required fields');
            this.toastService.warning('Please fill in all required fields.');
            return;
        }

        this.isLoading.set(true);

        setTimeout(() => {
            const student: Student = {
                name: value.name,
                rollNo: value.rollNo,
                fatherName: value.fatherName,
                email: value.email,
                department: value.department
            };

            console.log('[RegisterPage] Registering Student Object:', student);
            this.studentService.register(student);

            console.log('[RegisterPage] Registration Successful. Navigating to Home.');
            this.toastService.success('Registration successful! Welcome.');
            this.isLoading.set(false);
            this.router.navigate(['/home'], { replaceUrl: true });
        }, 1000);
    }
}
