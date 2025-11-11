import { User } from './user';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { Toastr } from '../toastr/toastr';
import { HttpClient } from '@angular/common/http';

describe('User', () => {
    let sp: SpectatorService<User>;

    const createService = createServiceFactory({
        service: User,
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
