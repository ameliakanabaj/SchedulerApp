import { Organization } from './organization';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { Toastr } from '../toastr/toastr';
import { HttpClient } from '@angular/common/http';

describe('Organization', () => {
    let sp: SpectatorService<Organization>;

    const createService = createServiceFactory({
        service: Organization,
        providers: [
            {
                provide: Toastr,
                useValue: { 
                    error: jest.fn(),
                }
            },
            {
                provide: HttpClient,
                useValue: {}
            }
        ]
    });

    beforeEach(() => {
        sp = createService();
    });

    describe('ok', () => {
        it('should be ok', () => {
            expect(true).toBeTruthy();
        });
    });
});
