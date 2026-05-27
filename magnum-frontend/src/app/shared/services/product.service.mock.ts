// src/app/services/product.service.mock.ts

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MOCK_PRODUCTS, Product } from '../models/mock-data';

@Injectable({ providedIn: 'root' })
export class ProductServiceMock {

  private STORAGE_KEY = 'magnum_products_mock';

  constructor() {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(MOCK_PRODUCTS));
    }
  }

  // Lê produtos do localStorage
  private getProductsFromStorage(): Product[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  // Salva produtos no localStorage
  private saveProductsToStorage(products: Product[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(products));
  }

  getProducts(): Observable<Product[]> {
    const products = this.getProductsFromStorage();
    return of(products).pipe(delay(800)); // Simula latência de rede
  }

  getProductById(id: number): Observable<Product | undefined> {
    const products = this.getProductsFromStorage();
    const product = products.find(p => p.id === id);
    return of(product).pipe(delay(500));
  }

  // ✅ BUSCAR POR NOME (COM PERSISTÊNCIA)
  buscarPorNome(nome: string): Observable<Product[]> {
    const products = this.getProductsFromStorage();
    const product = products.filter(p =>
      p.name.toLowerCase().includes(nome.toLowerCase())
    );
    return of(product).pipe(delay(500));
  }

  addProduct(product: Product): Observable<Product> {
    const products = this.getProductsFromStorage();
    
    // Gera um ID único se for nulo/undefined
    const newId = product.id || Date.now(); 
    
    const newProduct: Product = {
      ...product,
      id: newId // Garante que o ID seja numérico e único
    };
    
    products.push(newProduct);
    this.saveProductsToStorage(products);
    
    console.log('Produto salvo com ID:', newId); // Debug
    return of(newProduct).pipe(delay(600));
  }

  updateProduct(updatedProduct: Product): Observable<Product> {
    let products = this.getProductsFromStorage();
    const index = products.findIndex(p => p.id === updatedProduct.id);
    
    if (index !== -1) {
      products[index] = updatedProduct;
      this.saveProductsToStorage(products);
      return of(updatedProduct).pipe(delay(600));
    } else {
      throw new Error('Produto não encontrado');
    }
  }

  deleteProduct(id: number): Observable<void> {
    let products = this.getProductsFromStorage();
    products = products.filter(p => p.id !== id);
    this.saveProductsToStorage(products);
    return of(undefined).pipe(delay(600));
  }
}