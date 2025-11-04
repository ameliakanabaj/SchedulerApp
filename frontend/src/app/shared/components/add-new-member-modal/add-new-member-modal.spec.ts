import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewMemberModal } from './add-new-member-modal';

describe('AddNewMemberModal', () => {
  let component: AddNewMemberModal;
  let fixture: ComponentFixture<AddNewMemberModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewMemberModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNewMemberModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
