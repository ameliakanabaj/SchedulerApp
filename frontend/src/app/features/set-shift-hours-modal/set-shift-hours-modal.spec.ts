import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetShiftHoursModal } from './set-shift-hours-modal';

describe('SetShiftHoursModal', () => {
  let component: SetShiftHoursModal;
  let fixture: ComponentFixture<SetShiftHoursModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetShiftHoursModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetShiftHoursModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
