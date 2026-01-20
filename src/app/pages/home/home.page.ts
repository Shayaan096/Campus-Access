import { Component, inject, signal } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { StudentService } from '../../services/student.service';
import { ToastService } from '../../services/toast.service';
import { StudentCardComponent } from '../../components/student-card/student-card.component';
import { QrGeneratorComponent } from '../../components/qr-generator/qr-generator.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonicModule, StudentCardComponent, QrGeneratorComponent],
  templateUrl: './home.page.html',
  styles: [`
    :host {
      --ion-background-color: #f8fafc;
    }
  `]
})
export class HomePage {
  public studentService = inject(StudentService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  simulate(status: 'granted' | 'denied' | 'alert') {
    console.log(`[HomePage] Simulating Gateway Event: ${status.toUpperCase()}`);

    switch (status) {
      case 'granted':
        this.toastService.success('Access Granted! Proceed to Entrance.');
        break;
      case 'denied':
        this.toastService.error('Access Denied. See Security Personnel.');
        break;
      case 'alert':
        this.toastService.warning('Security Alert: Unauthorized Item Sequence.');
        break;
    }
  }

  logout() {
    console.log('[HomePage] User clicked logout');
    this.toastService.info('Logging out...');
    this.studentService.clear();
    this.router.navigate(['/register'], { replaceUrl: true });
  }
}
