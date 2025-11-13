import { ModalHeader } from './modal-header';
import { createComponentFactory, Spectator } from '@ngneat/spectator';

describe('ModalHeader', () => {
    let sp: Spectator<ModalHeader>;
    let createComponent = createComponentFactory({
        component: ModalHeader,
    });

    beforeEach(() => {
        sp = createComponent();
    });


    it('should set title', () => {
        sp.setInput('title', 'Test Title');
        expect(sp.component.title()).toBe('Test Title');
    });
});
