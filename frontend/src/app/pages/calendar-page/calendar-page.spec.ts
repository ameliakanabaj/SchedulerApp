import { ActivatedRoute } from '@angular/router';
import { CalendarPage } from './calendar-page';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { HttpClient } from '@angular/common/http';
import { Schedule } from '../../shared/services/schedule/schedule';
import { Authentication } from '../../core/services/auth/authentication';
import { Availability } from '../../shared/services/availability/availability';
import { Toastr } from '../../shared/services/toastr/toastr';
import { of } from 'rxjs';

describe('CalendarPage', () => {
    let sp: Spectator<CalendarPage>;

    const tempSchedule = {
        schedule_id: 1,
        organization_id: 4,
        date_from: "2025-12-04",
        date_to: "2025-12-25",
        generatedAt: 'poniedzialek',
        status: 'closed',
        deadline_generate_date: 'wtorek 21 grudnia',
    };

    const createComponent = createComponentFactory({
        component: CalendarPage,
        providers: [
            {
                provide: ActivatedRoute,
                useValue: { snapshot: { paramMap: { get: () => '1' } } },
            },
            {
                provide: HttpClient,
                useValue: { get: jest.fn() },
            },
            {
                provide: Schedule,
                useValue: {
                    getById: jest.fn().mockReturnValue(of(tempSchedule)),
                }
            },
            {
                provide: Authentication,
                useValue: {
                    getUserId: jest.fn().mockReturnValue(123),
                    hasRole: jest.fn().mockReturnValue(false),
                }
            },
            {
                provide: Availability,
                useValue: {
                    getAvailabilityByUser: jest.fn().mockReturnValue(of([])),
                }
            },
            {
                provide: Toastr,
                useValue: {
                    success: jest.fn(),
                    error: jest.fn(),
                },
            }
        ]
    });

    beforeEach(() => {
        jest.clearAllMocks();
        sp = createComponent();
    });

    it('should create', () => {
        expect(sp.component).toBeTruthy();
    });

    it('should load schedule on init', () => {
        const schedule = sp.inject(Schedule);
        expect(schedule.getById).toHaveBeenCalledWith(1);
        expect(sp.component.schedule).toEqual(tempSchedule);
    });

    it('should load user availabilities on init', () => {
        const availability = sp.inject(Availability);
        expect(availability.getAvailabilityByUser).toHaveBeenCalledWith(123);
    });
});
