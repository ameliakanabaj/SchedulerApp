import { Register } from './register';
import { ActivatedRoute } from '@angular/router';
import { createComponentFactory, Spectator } from '@ngneat/spectator';

describe('Register', () => {
    let sp: Spectator<Register>;
    const createComponent = createComponentFactory({
        component: Register,
        providers: [
            {
                provide: ActivatedRoute,
                useValue: { snapshot: { queryParams: {} } }
            }
        ]
    })

    beforeEach(() => {
        sp = createComponent();
    });
    
    describe('onRegister', () => {
        it('should properly send register data', () => {  // TO-DO
            sp.component.email = '';
            sp.component.password = '';
        });
    });
});
