// src/app/tokens/api-services.token.ts

import { InjectionToken } from '@angular/core';
import { ProductServiceMock } from '../shared/services/product.service.mock';
import { DashboardServiceMock } from '../shared/services/dashboard.service.mock';

export const PRODUCT_SERVICE_TOKEN = new InjectionToken('ProductService', {
  factory: () => new ProductServiceMock()
});

export const DASHBOARD_SERVICE_TOKEN = new InjectionToken('DashboardService', {
  factory: () => new DashboardServiceMock()
});