import { createServiceFactory, Spectator, SpectatorService } from '@ngneat/spectator';
import { Shift } from './shift';
import { HttpClient } from '@angular/common/http';

describe('Shift', () => {
    let sp: SpectatorService<Shift>;
    const createService = createServiceFactory({
        service: Shift,
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

    it('should work', () => {
        expect(true).toBeTruthy();
    });
});
