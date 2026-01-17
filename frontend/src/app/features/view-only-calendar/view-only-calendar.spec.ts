import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewOnlyCalendar } from './view-only-calendar';

describe('ViewOnlyCalendar', () => {
  let component: ViewOnlyCalendar;
  let fixture: ComponentFixture<ViewOnlyCalendar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewOnlyCalendar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewOnlyCalendar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
