import { TestBed } from '@angular/core/testing';

import { Schedule } from './schedule';
import { createServiceFactory, Spectator, SpectatorService } from '@ngneat/spectator';
import { HttpClient } from '@angular/common/http';

describe('Schedule', () => {
    let sp: SpectatorService<Schedule>;
    const createService = createServiceFactory({
        service: Schedule,
        providers: [
            {
                provide: HttpClient,
                useValue: {},
            }
        ]
    });

    beforeEach(() => {
        sp = createService();
    });

    it('should be created', () => {
        expect(sp.service).toBeTruthy();
    });
});
