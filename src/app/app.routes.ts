import { CatalogComponent } from './components/provider/catalog/catalog.component';
import { ProviderDetailDialogComponent } from './components/provider/provider-detail-dialog/provider-detail-dialog.component';
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
