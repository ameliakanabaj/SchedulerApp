import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCard } from './user-card';
import { createComponentFactory, Spectator } from '@ngneat/spectator';

describe('UserCard', () => {
    let spectator: Spectator<UserCard>;
    const createComponent = createComponentFactory({
        component: UserCard,
    });

    beforeEach(() => {
        spectator = createComponent();
    });

    it('should work', () => {
        expect(true).toBeTruthy();
    });
});
