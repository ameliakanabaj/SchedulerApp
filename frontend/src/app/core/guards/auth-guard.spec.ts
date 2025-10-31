import { Router } from '@angular/router';
import { AuthGuard } from './auth-guard';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { HttpClient } from '@angular/common/http';

describe('AuthGuard', () => {
    let sp: SpectatorService<AuthGuard>;
    const createService = createServiceFactory({
        service: AuthGuard,
        providers: [
            {
                provide: Router,
                useValue: {
                    navigate: jest.fn(),
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

    describe('canActivate', () => {
        it('should return true if authenticated', () => {
            const authService = sp.inject(AuthGuard)['authService'];
            jest.spyOn(authService, 'isAuthenticated').mockReturnValue(true);

            const result = sp.service.canActivate();
            expect(result).toBeTruthy();
        });
        it('should navigate to /landing and return false if not authenticated', () => {
            const authService = sp.inject(AuthGuard)['authService'];
            const router = sp.inject(AuthGuard)['router'];
            jest.spyOn(authService, 'isAuthenticated').mockReturnValue(false);
            const navigateSpy = jest.spyOn(router, 'navigate');
            const result = sp.service.canActivate();
            expect(navigateSpy).toHaveBeenCalledWith(['/landing']);
            expect(result).toBeFalsy();
        });
    });
});
