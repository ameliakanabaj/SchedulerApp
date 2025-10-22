import { Login } from './login';
import { ActivatedRoute } from '@angular/router';
import { createComponentFactory, Spectator } from '@ngneat/spectator';

describe('Login', () => {
    let sp: Spectator<Login>;
    const createComponent = createComponentFactory({
        component: Login,
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
    
    describe('onLogin', () => {
        it('should properly send login data', () => {  // TO-DO
            sp.component.email = '';
            sp.component.password = '';
        });
    });
});
