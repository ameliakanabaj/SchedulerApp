import { SetCustomHoursModal } from './set-custom-hours-modal';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { DialogRef } from '@ngneat/dialog';

describe('SetCustomHoursModal', () => {
    let sp: Spectator<SetCustomHoursModal>;
    const createComponent = createComponentFactory({
        component: SetCustomHoursModal,
        providers: [
            {
                provide: DialogRef,
                useValue: {
                    data: { minTime: '1', maxTime: '5', day: '25' },
                    close: jest.fn(),
                }
            }
        ]
    });

    beforeEach(() => {
        sp = createComponent();
    });

    describe('saveHours & closeModal', () => {
        it('should properly call dialog ref to close at close', () => {
            sp.component.closeModal();

            expect(sp.component['modalRef'].close).toHaveBeenCalled();
        });
        it('should properly call dialog ref to close at save', () => {
            const start = sp.component.startTime;
            const end = sp.component.endTime;
            sp.component.saveHours();

            expect(sp.component['modalRef'].close).toHaveBeenCalledWith({startTime: start, endTime: end});
        });
    });
});
