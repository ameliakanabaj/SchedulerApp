import { ComponentFixture, TestBed } from '@angular/core/testing';
import { App } from './app';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('App', () => {
    let component: App;
    let fixture: ComponentFixture<App>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
        imports: [App, RouterTestingModule], 
        providers: [
            {
            provide: ActivatedRoute,
            useValue: { snapshot: { routeConfig: { path: 'dashboard' } } },
            },
        ],
        }).compileComponents();

        fixture = TestBed.createComponent(App);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
