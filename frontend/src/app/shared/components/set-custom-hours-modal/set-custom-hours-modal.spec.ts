import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetCustomHoursModal } from './set-custom-hours-modal';

describe('SetCustomHoursModal', () => {
  let component: SetCustomHoursModal;
  let fixture: ComponentFixture<SetCustomHoursModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetCustomHoursModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetCustomHoursModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
