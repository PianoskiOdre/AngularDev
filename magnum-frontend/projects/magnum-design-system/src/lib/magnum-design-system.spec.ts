import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MagnumDesignSystem } from './magnum-design-system';

describe('MagnumDesignSystem', () => {
  let component: MagnumDesignSystem;
  let fixture: ComponentFixture<MagnumDesignSystem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagnumDesignSystem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MagnumDesignSystem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
