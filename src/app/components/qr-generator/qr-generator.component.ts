import { Component, input, signal, OnDestroy, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as QRCode from 'qrcode';
import { Student } from '../../interfaces/student.interface';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-qr-generator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center space-y-6">
      @if (qrCodeUrl()) {
        <div class="relative p-3 bg-white border-2 border-slate-100 rounded-2xl shadow-md w-full max-w-[280px]">
          <img [src]="qrCodeUrl()" alt="Access QR Code" class="w-full h-auto aspect-square object-contain" />
          
          @if (isExpired()) {
            <div class="absolute inset-0 bg-white/90 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center p-4 text-center">
              <p class="font-bold text-slate-900 border-b-2 border-red-500 pb-1 mb-4">TOKEN EXPIRED</p>
              <button (click)="generateQr()" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-xs font-bold uppercase transition-all shadow-sm">
                Regenerate
              </button>
            </div>
          }
        </div>

        <div class="w-full max-w-[200px] flex items-center justify-center space-x-3 bg-slate-50 border border-slate-200 py-3 rounded-xl">
          @if (!isExpired()) {
            <div class="flex flex-col items-center">
              <span class="text-[9px] text-slate-400 uppercase font-black tracking-[0.2em] mb-1">Time Remaining</span>
              <span class="text-2xl font-mono font-bold text-slate-800">{{ formattedTime() }}</span>
            </div>
          } @else {
             <span class="text-red-500 font-bold uppercase text-[10px] tracking-widest italic">Wait for refresh</span>
          }
        </div>
      } @else {
        <button (click)="generateQr()" 
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center space-x-3">
          <span class="text-lg">Generate Gateway Pass</span>
        </button>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class QrGeneratorComponent implements OnDestroy {
  student = input.required<Student | null>();
  private toastService = inject(ToastService);

  qrCodeUrl = signal<string | null>(null);
  timeLeft = signal<number>(120);
  timer: any;

  isExpired = computed(() => this.timeLeft() <= 0);

  formattedTime = computed(() => {
    const minutes = Math.floor(this.timeLeft() / 60);
    const seconds = this.timeLeft() % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });

  async generateQr() {
    console.log('[QrGenerator] Initiating QR Generation for student:', this.student());

    if (!this.student()) {
      console.warn('[QrGenerator] Cannot generate QR: No student data found');
      this.toastService.error('Student data not found.');
      return;
    }

    const studentData = this.student()!;

    // Construct the lightweight payload for attendance
    const qrPayload = {
      type: 'ATTENDANCE_MARKER',
      studentId: studentData.firebaseKey, // Ensure this exists in Student interface or is handled
      rollNo: studentData.rollNo,
      timestamp: Date.now(),
      apiEndpoint: 'https://campusaccessbackend-default-rtdb.asia-southeast1.firebasedatabase.app/attendance.json'
    };

    console.log('[QrGenerator] QR Payload Data:', {
      ...qrPayload,
      readable_timestamp: new Date(qrPayload.timestamp).toLocaleString()
    });

    try {
      const url = await QRCode.toDataURL(JSON.stringify(qrPayload), {
        margin: 1,
        width: 400,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });
      console.log('[QrGenerator] QR Code URL generated successfully');
      this.toastService.info('Secure entry pass generated.');
      this.qrCodeUrl.set(url);
      this.startTimer();
    } catch (err) {
      console.error('[QrGenerator] QR generation exploded:', err);
      this.toastService.error('Failed to generate pass.');
    }
  }

  startTimer() {
    console.log('[QrGenerator] Starting 120s expiry timer');
    this.stopTimer();
    this.timeLeft.set(120);
    this.timer = setInterval(() => {
      this.timeLeft.update(time => {
        if (time <= 1) {
          console.warn('[QrGenerator] Access Token Expired');
          this.toastService.warning('Your entry pass has expired.');
          this.stopTimer();
          return 0;
        }
        return time - 1;
      });
    }, 1000);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  ngOnDestroy() {
    this.stopTimer();
  }
}
