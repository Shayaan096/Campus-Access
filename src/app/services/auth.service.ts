import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, catchError, map, of, throwError, forkJoin } from 'rxjs';
import { Student, Department, Section } from '../interfaces/student.interface';
import { StudentService } from './student.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private studentService = inject(StudentService);
    private baseUrl = environment.apiUrl;

    /**
     * Register a new student (Admin Side)
     * This saves the student data to Firebase Realtime Database
     */
    registerStudent(student: any): Observable<any> {
        const url = `${this.baseUrl}/students/${student.rollNo}.json`;
        return this.http.put(url, student).pipe(
            map(response => ({
                status: 'success',
                message: 'Student registered successfully',
                data: response
            })),
            catchError(error => {
                console.error('Registration Error:', error);
                return throwError(() => ({
                    status: 'error',
                    message: 'Failed to register student',
                    data: error
                }));
            })
        );
    }

    /**
     * Get Dropdown Data (Departments and Sections)
     * Fetches from separate /departments.json and /sections.json
     */
    getDropdownData(): Observable<Department[]> {
        const departmentsUrl = `${this.baseUrl}/departments.json`;
        const sectionsUrl = `${this.baseUrl}/sections.json`;

        return forkJoin({
            departments: this.http.get<any>(departmentsUrl),
            sections: this.http.get<any>(sectionsUrl)
        }).pipe(
            map(({ departments, sections }) => {
                if (!departments) return [];

                // Convert Firebase objects to arrays
                const deptsArray = Object.entries(departments).map(([id, dept]: [string, any]) => ({
                    id,
                    ...dept,
                    sections: []
                })) as any[];

                const secsArray = sections ? Object.entries(sections).map(([id, sec]: [string, any]) => ({
                    id,
                    ...sec
                })) : [];

                // Merge sections into departments
                return deptsArray.map(dept => ({
                    ...dept,
                    sections: secsArray.filter(sec => sec.departmentId === dept.id)
                })) as Department[];

            }),
            catchError(error => {
                console.error('Dropdown Data Error:', error);
                return throwError(() => new Error('Failed to load selection data from Firebase'));
            })
        );
    }


    /**
     * Student Login (Direct Firebase Fetch & Match)
     * GET [FirebaseURL]/students.json
     */
    verifyStudentLogin(credentials: any): Observable<any> {
        return forkJoin({
            students: this.http.get<any>(`${this.baseUrl}/students.json`),
            depts: this.http.get<any>(`${this.baseUrl}/departments.json`),
            secs: this.http.get<any>(`${this.baseUrl}/sections.json`)
        }).pipe(
            map(({ students, depts, secs }) => {
                if (!students) {
                    throw new Error('No students registered in the system');
                }

                // Convert Firebase object to array
                const studentsArray = Object.entries(students).map(([id, student]: [string, any]) => ({
                    firebaseKey: id,
                    ...student
                })) as (Student & { firebaseKey: string })[];

                // Client-side match based on all fields provided in the payload
                // Client-side match based on ALL fields provided in the payload
                const matchedStudent = studentsArray.find(s => {
                    const studentData = s as any;

                    // Possible field names in Firebase
                    const sDeptId = studentData.deptId || studentData.departmentId;
                    const sSecId = studentData.secId || studentData.sectionId;
                    const sRollNo = studentData.rollNo || studentData.id;

                    // Match all fields (Case-insensitive for text fields)
                    return (sRollNo === credentials.rollNo) &&
                        (studentData.name?.toLowerCase() === credentials.name?.toLowerCase()) &&
                        (studentData.fatherName?.toLowerCase() === credentials.fatherName?.toLowerCase()) &&
                        (studentData.email?.toLowerCase() === credentials.email?.toLowerCase()) &&
                        (studentData.phone === credentials.phone) &&
                        (sDeptId === credentials.deptId) &&
                        (sSecId === credentials.secId);
                });



                if (matchedStudent) {
                    // Resolve human readable names
                    const studentData = matchedStudent as any;
                    const studentDeptId = studentData.deptId || studentData.departmentId;
                    const studentSecId = studentData.secId || studentData.sectionId;
                    const rollNo = studentData.rollNo || studentData.id;

                    const departmentName = depts && depts[studentDeptId] ? depts[studentDeptId].name : undefined;
                    const sectionName = secs && secs[studentSecId] ? secs[studentSecId].name : undefined;

                    const enrichedStudent: Student = {
                        ...matchedStudent,
                        rollNo: rollNo, // Ensure rollNo is populated
                        deptId: studentDeptId,
                        secId: studentSecId,
                        department: departmentName,
                        section: sectionName
                    };


                    this.studentService.register(enrichedStudent);
                    return { status: 'success', data: enrichedStudent };
                } else {
                    throw new Error('Login failed. Please verify your details.');
                }
            }),
            catchError(error => {
                console.error('Login Error:', error);
                return throwError(() => ({
                    status: 'error',
                    message: error.message || 'Login failed',
                    data: null
                }));
            })
        );
    }






}
