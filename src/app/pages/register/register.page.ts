import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { StudentService } from '../../services/student.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Department, Section, Student } from '../../interfaces/student.interface';


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
export class RegisterPage implements OnInit {
    private studentService = inject(StudentService);
    private authService = inject(AuthService);
    private toastService = inject(ToastService);
    private router = inject(Router);

    isLoading = signal(false);
    departments = signal<Department[]>([]);
    availableSections = signal<Section[]>([]);
    selectedDeptId = signal<string>('');

    ngOnInit() {
        this.loadDropdownData();
    }

    loadDropdownData() {
        this.authService.getDropdownData().subscribe({
            next: (data) => {
                this.departments.set(data);
                console.log('[RegisterPage] Loaded Departments:', data);
            },
            error: (err) => {
                console.error('[RegisterPage] Error loading dropdown data:', err);
                this.toastService.error('Failed to load selection data.');
            }
        });
    }

    onDepartmentChange(deptId: string) {
        this.selectedDeptId.set(deptId);
        const selectedDept = this.departments().find(d => d.id === deptId);
        if (selectedDept) {
            this.availableSections.set(selectedDept.sections || []);
        } else {
            this.availableSections.set([]);
        }
    }

    onRegister(value: any) {
        console.log('[RegisterPage] Form Submission Data:', value);

        if (!value.name || !value.rollNo || !value.fatherName || !value.email || !value.phone || !value.deptId || !value.secId) {
            this.toastService.warning('Please fill in all required fields.');
            return;
        }

        this.isLoading.set(true);

        const credentials = {
            name: value.name,
            rollNo: value.rollNo,
            fatherName: value.fatherName,
            email: value.email,
            phone: value.phone,
            deptId: value.deptId,
            secId: value.secId
        };

        this.authService.verifyStudentLogin(credentials).subscribe({
            next: (response) => {
                console.log('[RegisterPage] Login Successful:', response);
                this.toastService.success('Login successful!');
                this.isLoading.set(false);
                this.router.navigate(['/home'], { replaceUrl: true });
            },
            error: (err) => {
                console.error('[RegisterPage] Login Failed:', err);
                this.toastService.error(err.message || 'Login failed. Please check your details.');
                this.isLoading.set(false);
            }
        });
    }

}

