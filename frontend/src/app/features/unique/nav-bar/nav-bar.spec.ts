import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NavBar } from './nav-bar';

describe('NavBar', () => {
    let component: NavBar;
    let fixture: ComponentFixture<NavBar>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
        imports: [NavBar, RouterTestingModule],
        providers: [
            {
            provide: ActivatedRoute,
            useValue: { snapshot: { routeConfig: { path: 'dashboard' } } },
            },
        ],
        }).compileComponents();

        fixture = TestBed.createComponent(NavBar);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('ngOnInit', () => {
        it('should properly set route and other signals', () => {
        component.ngOnInit();

        expect(component.route()).toBe('dashboard');
        });
    });
});
