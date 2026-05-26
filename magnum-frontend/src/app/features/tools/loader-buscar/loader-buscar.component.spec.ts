import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoaderBuscarComponent } from './loader-buscar.component';

describe('LoaderBuscarComponent', () => {
  let component: LoaderBuscarComponent;
  let fixture: ComponentFixture<LoaderBuscarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoaderBuscarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoaderBuscarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
