import { Calendar } from './calendar';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { Authentication } from '../../../core/services/auth/authentication';
import { Toastr } from '../../services/toastr/toastr';
import { Modal } from '../../services/modal/modal';
import { Availability } from '../../services/availability/availability';
import { Shift } from '../../services/shift/shift';
import { of } from 'rxjs';

describe('Calendar', () => {
    let sp: Spectator<Calendar>;
    const createComponent = createComponentFactory({
        component: Calendar,
        providers: [
            {
                provide: Authentication,
                useValue: {
                    hasRole: jest.fn().mockReturnValue(false),
                    getUserId: jest.fn().mockReturnValue(123),
                    getOrgId: jest.fn().mockReturnValue(1),
                }
            },
            {
                provide: Toastr,
                useValue: {
                    success: jest.fn(),
                    error: jest.fn(),
                }
            },
            {
                provide: Modal,
                useValue: {
                    openModal: jest.fn().mockReturnValue({
                        afterClosed$: of(null)
                    })
                }
            },
            {
                provide: Availability,
                useValue: {
                    getAvailabilityByUser: jest.fn().mockReturnValue(of([])),
                    bulkCreateAvailability: jest.fn().mockReturnValue(of({}))
                }
            },
            {
                provide: Shift,
                useValue: {
                    getAllShifts: jest.fn().mockReturnValue(of([]))
                }
            }
        ]
    });

    beforeEach(() => {
        jest.clearAllMocks();
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
