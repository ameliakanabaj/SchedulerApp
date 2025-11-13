import { inject, Injectable } from '@angular/core';
import { DialogService } from '@ngneat/dialog';

@Injectable({
  providedIn: 'root'
})
export class Modal {
    private readonly dialogService = inject(DialogService);

    openModal(component: any, config?: any): any {
        const configWithDefaults = config;

        return this.dialogService.open(component, configWithDefaults);
    }

    closeAll(): void {
        this.dialogService.closeAll();
    }
}
