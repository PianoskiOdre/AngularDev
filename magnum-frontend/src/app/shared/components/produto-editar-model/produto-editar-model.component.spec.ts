import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProdutoEditarModelComponent } from './produto-editar-model.component';

describe('ProdutoEditarModelComponent', () => {
  let component: ProdutoEditarModelComponent;
  let fixture: ComponentFixture<ProdutoEditarModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProdutoEditarModelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProdutoEditarModelComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
