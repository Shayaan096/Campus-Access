import { Injectable, signal, computed } from '@angular/core';
import { Student } from '../interfaces/student.interface';

@Injectable({
    providedIn: 'root'
})
export class StudentService {
    private readonly STORAGE_KEY = 'campus_access_student';

    private studentSignal = signal<Student | null>(this.loadStudent());

    readonly student = this.studentSignal.asReadonly();
    readonly isRegistered = computed(() => !!this.studentSignal());

    constructor() { }

    private loadStudent(): Student | null {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    }

    register(student: Student): void {
        console.log('[StudentService] Registering student:', student);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(student));
        this.studentSignal.set(student);
    }

    clear(): void {
        console.warn('[StudentService] Clearing student data');
        localStorage.removeItem(this.STORAGE_KEY);
        this.studentSignal.set(null);
    }
}
