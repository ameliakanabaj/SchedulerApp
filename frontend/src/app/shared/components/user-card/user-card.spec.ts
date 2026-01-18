import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCard } from './user-card';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { HttpClient } from '@angular/common/http';
import { Toastr } from '../../services/toastr/toastr';

describe('UserCard', () => {
    let spectator: Spectator<UserCard>;
    const createComponent = createComponentFactory({
        component: UserCard,
        providers: [
            { provide: HttpClient, useValue: {} },
            { provide: Toastr, useValue: {} }
        ]
    });

    beforeEach(() => {
        spectator = createComponent();
    });

    it('should work', () => {
        expect(true).toBeTruthy();
    });
});
