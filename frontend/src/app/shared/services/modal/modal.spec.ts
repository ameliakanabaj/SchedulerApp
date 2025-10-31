import { Component } from '@angular/core';
import { Modal } from './modal';
import { createServiceFactory, SpectatorService } from '@ngneat/spectator';

@Component({
    template: '<div>Test Modal</div>'
})
class TestModalComponent {}

describe('Modal', () => {
    let sp: SpectatorService<Modal>;

    let createService = createServiceFactory({
        service: Modal,
    });

    beforeEach(() => {
        sp = createService();
    });

    describe('openModal', () => {
        it('should open modal', () => {
            const modalRef = sp.service.openModal(TestModalComponent);
            expect(modalRef).toBeDefined();
        });
    });
});
