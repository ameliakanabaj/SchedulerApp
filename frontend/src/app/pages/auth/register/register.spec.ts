import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Register } from './register';
import { ActivatedRoute } from '@angular/router';

describe('Register', () => {
    let component: Register;
    let fixture: ComponentFixture<Register>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Register],
            providers: [
                { provide: ActivatedRoute, useValue: { snapshot: { paramMap: new Map() } } }
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(Register);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
