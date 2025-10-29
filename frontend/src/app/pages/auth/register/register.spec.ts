import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Register } from './register';
import { ToastrService } from 'ngx-toastr';

describe('Register', () => {
    let component: Register;
    let fixture: ComponentFixture<Register>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
        imports: [Register, RouterTestingModule],
        providers: [
            {
            provide: ActivatedRoute,
            useValue: { snapshot: { queryParams: {} } }
            },
            {
                provide: ToastrService,
                useValue: {}
            }
        ]
        }).compileComponents();

        fixture = TestBed.createComponent(Register);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('onRegister', () => {
        it('should properly send register data', () => {  // TO-DO
        component.email = '';
        component.password = '';
        });
    });
});
