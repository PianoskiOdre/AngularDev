// modal.service.ts

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  
  private modalAbertoSource = new Subject<any>();
  private modalFechadoSource = new Subject<void>();
  private exclusaoConfirmadaSource = new Subject<number>();
  
  // Observables para os componentes se inscreverem
  modalAberto$ = this.modalAbertoSource.asObservable();
  modalFechado$ = this.modalFechadoSource.asObservable();
  exclusaoConfirmada$ = this.exclusaoConfirmadaSource.asObservable();
  
  abrirModal(produto: any) {
    console.log('Serviço: Abrindo modal para produto:', produto);
    this.modalAbertoSource.next(produto);
  }
  
  fecharModal() {
    console.log('Serviço: Fechando modal');
    this.modalFechadoSource.next();
  }
  
  confirmarExclusao(id: number) {
    console.log('Serviço: Confirmando exclusão do ID:', id);
    this.exclusaoConfirmadaSource.next(id);
  }
}