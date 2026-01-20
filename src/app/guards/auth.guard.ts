import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { StudentService } from '../services/student.service';

export const authGuard = () => {
    const studentService = inject(StudentService);
    const router = inject(Router);

    if (studentService.isRegistered()) {
        return true;
    }

    return router.parseUrl('/register');
};

export const registrationGuard = () => {
    const studentService = inject(StudentService);
    const router = inject(Router);

    if (studentService.isRegistered()) {
        return router.parseUrl('/home');
    }

    return true;
};
