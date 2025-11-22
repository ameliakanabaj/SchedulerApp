import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordReset } from './password-reset';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { HttpClient } from '@angular/common/http';
import { Toastr } from '../../shared/services/toastr/toastr';
import { DialogRef } from '@ngneat/dialog';
import { of } from 'rxjs';

describe('PasswordReset', () => {
    let sp: Spectator<PasswordReset>;
    const createComponent = createComponentFactory({
        component: PasswordReset,
        providers: [
            { provide: HttpClient, useValue: {post: jest.fn().mockReturnValue(of({})),}},
            { provide: Toastr, useValue: {}},
            { provide: DialogRef, useValue: { close: jest.fn() }}

        ]
    });

    beforeEach(() => {
        sp = createComponent();
    });

    describe('submit', () => {
        it('should close modal', () => {
            sp.component.submit();

            expect(sp.component['modalRef'].close).toHaveBeenCalled();
        });
    });
});
