import { TestBed } from '@angular/core/testing';

import { Toastr } from './toastr';

describe('Toastr', () => {
  let service: Toastr;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Toastr);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
