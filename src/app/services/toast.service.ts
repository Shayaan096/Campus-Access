import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private toastCtrl = inject(ToastController);

    async show(message: string, type: ToastType = 'info', title?: string, duration: number = 4000) {
        console.log(`[ToastService] Showing ${type.toUpperCase()} toast:`, { title, message });

        const toast = await this.toastCtrl.create({
            header: title,
            message,
            duration,
            position: 'top',
            cssClass: `custom-toast toast-${type}`,
            buttons: [
                {
                    text: '✕',
                    role: 'cancel'
                }
            ]
        });

        await toast.present();
    }

    success(message: string, title: string = 'Verification Passed') {
        this.show(message, 'success', title);
    }

    error(message: string, title: string = 'Access Denied') {
        this.show(message, 'error', title);
    }

    warning(message: string, title: string = 'Security Warning') {
        this.show(message, 'warning', title);
    }

    info(message: string, title: string = 'System Notification') {
        this.show(message, 'info', title);
    }
}
