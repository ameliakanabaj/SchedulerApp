import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Calendar } from './calendar';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { Authentication } from '../../../core/services/auth/authentication';
import { HttpClient } from '@angular/common/http';

describe('Calendar', () => {
    let sp: Spectator<Calendar>;
    const createComponent = createComponentFactory({
        component: Calendar,
        providers: [
            { provide: Authentication, useValue: {}},
            { provide: HttpClient, useValue: {}},
        ]
    });

    beforeEach(() => {
        sp = createComponent();
    })

    describe('generateDays', () => {
        it('should properly generate an array of dates', () => {
            sp.component.generateDays(2025, 11);

            expect(sp.component.daysInMonth).not.toBeNull();
        });
    })

    describe('previousMonth, nextMonth', () => {
        beforeEach(() => {
            sp.component.generateDays = jest.fn();
            sp.component.year = 2025;
            sp.component.month = 0;
        });
        it('should properly change to last month', () => {
            sp.component.previousMonth();

            expect(sp.component.year).toBe(2024);
            expect(sp.component.month).toBe(11);
            expect(sp.component.generateDays).toHaveBeenCalled();
        });

        it('should properly change to next month', () => {
            sp.component.nextMonth();

            expect(sp.component.year).toBe(2025);
            expect(sp.component.month).toBe(1);
            expect(sp.component.generateDays).toHaveBeenCalled();
        });
    });
});
