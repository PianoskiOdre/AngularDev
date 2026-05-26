import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingChartComponent } from './loading-chart.component';

describe('LoadingChartComponent', () => {
  let component: LoadingChartComponent;
  let fixture: ComponentFixture<LoadingChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadingChartComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
