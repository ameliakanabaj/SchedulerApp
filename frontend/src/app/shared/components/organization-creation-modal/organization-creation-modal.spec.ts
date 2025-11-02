import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationCreationModal } from './organization-creation-modal';

describe('OrganizationCreationModal', () => {
  let component: OrganizationCreationModal;
  let fixture: ComponentFixture<OrganizationCreationModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationCreationModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizationCreationModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
