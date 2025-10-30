import { TestBed } from '@angular/core/testing';

import { Authentication } from './authentication';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';

describe('Authentication', () => {
    let sp: SpectatorService<Authentication>;
    const createService = createServiceFactory({
        service: Authentication,
        providers: [
            {
                provide: HttpClient,
                useValue: {
                    post: jest.fn().mockReturnValue(of({ token: 'mock-jwt-token' })),
                }
            }
        ]
    })

    beforeEach(() => {
        sp = createService();
    });

    describe('login', () => {
        it('should store token on successful login', () => {
            const http = sp.inject(HttpClient);

            sp.service.login({ email: 'abc', password: '123' });
            expect(http.post).toHaveBeenCalled();
        });
    });

    describe('register', () => {
        it('should call http post on register', () => {
            const http = sp.inject(HttpClient);

            sp.service.register({ first_name: 'John', last_name: 'Doe', email: 'abc', password: '123' });
            expect(http.post).toHaveBeenCalled();
        });
    });
});
