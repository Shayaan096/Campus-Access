export interface Section {
    id: string;
    name: string;
}

export interface Department {
    id: string;
    name: string;
    sections: Section[];
}

export interface Student {
    id?: string;
    firebaseKey?: string;
    name: string;
    rollNo: string;
    fatherName: string;
    email: string;
    phone: string;
    deptId: string;
    secId: string;
    registeredAt?: string;
    // UI Helpers
    department?: string;
    section?: string;
}

export interface QrData {
    student: Student;
    timestamp: number;
}
