import { inject, Injectable } from '@angular/core';
import { ToastrService as NgxToastr } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class Toastr {
    private readonly toastr: NgxToastr = inject(NgxToastr);

    success(message: string, title?: string) {
        this.toastr.success(message, title);
    }

    error(message: string, title?: string) {
        this.toastr.error(message, title);
    }

    info(message: string, title?: string) {
        this.toastr.info(message, title);
    }

    warning(message: string, title?: string) {
        this.toastr.warning(message, title);
    }
}
