import { createServiceFactory, SpectatorService } from '@ngneat/spectator';
import { Toastr } from './toastr';
import { ToastrService as NgxToastr } from 'ngx-toastr';

describe('Toastr', () => {
    let sp: SpectatorService<Toastr>;
    let ngxToastr: NgxToastr;
    const createService = createServiceFactory({
        service: Toastr,
        providers: [
            {
                provide: NgxToastr,
                useValue: {
                    success: jest.fn(),
                    error: jest.fn(),
                    info: jest.fn(),
                    warning: jest.fn(),
                },
            }
        ]
    })

    beforeEach(() => {
        sp = createService();
        sp.inject(NgxToastr);
    });

    describe('functions', () => {
        it('should call success', () => {
            sp.service.success('Test message', 'Test title');

            expect(sp.inject(NgxToastr).success).toHaveBeenCalledWith('Test message', 'Test title');
        });
        it('should call error', () => {
            sp.service.error('Test message', 'Test title');
            expect(sp.inject(NgxToastr).error).toHaveBeenCalledWith('Test message', 'Test title');
        });
        it('should call info', () => {
            sp.service.info('Test message', 'Test title');
            expect(sp.inject(NgxToastr).info).toHaveBeenCalledWith('Test message', 'Test title');
        });
        it('should call warning', () => {
            sp.service.warning('Test message', 'Test title');
            expect(sp.inject(NgxToastr).warning).toHaveBeenCalledWith('Test message', 'Test title');
        });
    });
});
