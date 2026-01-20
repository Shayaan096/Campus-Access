export interface Student {
    name: string;
    fatherName: string;
    email: string;
    department: string;
    rollNo: string;
}

export interface QrData {
    student: Student;
    timestamp: number;
}
