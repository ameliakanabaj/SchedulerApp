import { Availability } from './availability';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { HttpClient } from '@angular/common/http';

describe('Availability', () => {
    let sp: SpectatorService<Availability>;
    const createService = createServiceFactory({
        service: Availability,
        providers: [
            { provide: HttpClient, useValue: {}}
        ],
    });

    beforeEach(() => {
        sp = createService();
    });

    it('should work', () => {
        expect(true).toBeTruthy();
    });
});
