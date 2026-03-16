import { ProviderDetailDialogComponent } from './pages/available-providers/provider-detail-dialog/provider-detail-dialog.component';
import { CatalogComponent } from './pages/installed-providers/catalog/catalog.component';
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'marketplace',
    component: CatalogComponent,
  },
  {
    path: 'provider/:providerName',
    component: ProviderDetailDialogComponent,
  },
];
