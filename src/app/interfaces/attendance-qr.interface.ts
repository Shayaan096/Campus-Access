export interface AttendanceQrData {
    type: 'ATTENDANCE_MARKER';
    studentId: string;
    rollNo: string;
    timestamp: number;
    apiEndpoint: string;
}
