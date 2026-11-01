import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then((m) => m.Login),
  },
  {
    path: 'admin',
    loadComponent: () => import('./components/default-layout/default-layout').then((m) => m.DefaultLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      { path: 'overview', loadComponent: () => import('./components/overview/overview').then((m) => m.Overview) },
      { path: 'work-orders', loadComponent: () => import('./components/work-orders/work-orders').then((m) => m.WorkOrders)},
      { path: 'assets-list', loadComponent: () => import('./components/assets/assets').then((m) => m.Assets)}, 
      { path: 'asset-form', loadComponent: () => import('./components/assets/asset-form/asset-form').then((m) => m.AssetForm)}, 
      { path: 'building-list', loadComponent: () => import('./components/building-information/building-information').then((m) => m.BuildingInformation)}, 
      { path: 'building-form', loadComponent: () => import('./components/building-information/building-form/building-form').then((m) => m.BuildingForm)}, 
      { path: 'brand-list', loadComponent: () => import('./components/brand-information/brand-information').then((m) => m.BrandInformation)}, 
      { path: 'brand-form', loadComponent: () => import('./components/brand-information/brand-form/brand-form').then((m) => m.BrandForm)}, 
      { path: 'category-list', loadComponent: () => import('./components/equipment-categories/equipment-categories').then((m) => m.EquipmentCategories)}, 
      { path: 'category-form', loadComponent: () => import('./components/equipment-categories/category-form/category-form').then((m) => m.CategoryForm)}, 
      { path: 'preventive-maintenance', loadComponent: () => import('./components/preventive-maintenance/preventive-maintenance').then((m) => m.PreventiveMaintenance)}, 
      { path: 'operative-maintenance', loadComponent: () => import('./components/operative-maintenance/operative-maintenance').then((m) => m.OperativeMaintenance)}, 
      { path: 'reports', loadComponent: () => import('./components/reports/reports').then((m) => m.Reports)}, 
      { path: 'user-view', loadComponent: () => import('./components/user-view/user-view').then((m) => m.UserView)},
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'admin' },
];
