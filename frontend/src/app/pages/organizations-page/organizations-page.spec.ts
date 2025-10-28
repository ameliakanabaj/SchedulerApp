import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrganizationsPage } from './organizations-page';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('OrganizationsPage', () => {
    let component: OrganizationsPage;
    let fixture: ComponentFixture<OrganizationsPage>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
        imports: [OrganizationsPage, RouterTestingModule], 
        providers: [
            {
            provide: ActivatedRoute,
            useValue: { snapshot: { params: { id: 1 } } }
            }
        ]
        }).compileComponents();

        fixture = TestBed.createComponent(OrganizationsPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

  // Jeśli chcesz przetestować metody komponentu:
  // describe('leaveOrganization', () => {
  //   it('should call leaveOrganization method', () => {
  //     const orgId = 1;
  //     spyOn(component, 'leaveOrganization');
  //     component.leaveOrganization(orgId);
  //     expect(component.leaveOrganization).toHaveBeenCalledWith(orgId);
  //   });
  // });
});
