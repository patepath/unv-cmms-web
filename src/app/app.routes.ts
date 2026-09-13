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
      {
        path: 'overview',
        loadComponent: () => import('./components/overview/overview').then((m) => m.Overview),
      },
      {
        path: 'work-orders',
        loadComponent: () =>
          import('./components/work-orders/work-orders').then((m) => m.WorkOrders),
      },
      {
        path: 'assets',
        loadComponent: () => import('./components/assets/assets').then((m) => m.Assets),
      },
      {
        path: 'preventive-maintenance',
        loadComponent: () =>
          import('./components/preventive-maintenance/preventive-maintenance').then(
            (m) => m.PreventiveMaintenance,
          ),
      },
      {
        path: 'operative-maintenance',
        loadComponent: () =>
          import('./components/operative-maintenance/operative-maintenance').then(
            (m) => m.OperativeMaintenance,
          ),
      },
      {
        path: 'reports',
        loadComponent: () => import('./components/reports/reports').then((m) => m.Reports),
      },
      {
        path: 'user-view',
        loadComponent: () => import('./components/user-view/user-view').then((m) => m.UserView),
      },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'admin' },
];
