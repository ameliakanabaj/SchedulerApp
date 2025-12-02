import { ActivatedRoute } from '@angular/router';
import { CalendarPage } from './calendar-page';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { HttpClient } from '@angular/common/http';
import { Schedule } from '../../shared/services/schedule/schedule';
import { of } from 'rxjs';
import { Toastr } from '../../shared/services/toastr/toastr';

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
                useValue: { snapshot: { paramMap: { get: () => '1' } } }, // use numeric id string
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
                provide: Toastr,
                useValue: {},
            }
        ]
    });

    beforeEach(() => {
        sp = createComponent();

        (sp.component as any).scheduleService.getById = jest.fn();
    });

    it('should create', () => {
        expect(sp.component).toBeTruthy();
    });
});
