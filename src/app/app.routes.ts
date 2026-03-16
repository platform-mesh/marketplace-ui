import { ProviderDetailDialogComponent } from './pages/available-providers/provider-detail-dialog/provider-detail-dialog.component';
import { CatalogComponent } from './pages/installed-providers/catalog/catalog.component';
import { ProviderConfigurationComponent } from './pages/provider/provider-configuration/provider-configuration.component';
import { ProviderMissingMandatoryDataComponent } from './pages/provider/provider-missing-mandatory-data/provider-missing-mandatory-data.component';
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
  {
    path: `provider-missing-mandatory-data/:providerName`,
    component: ProviderMissingMandatoryDataComponent,
  },
  {
    path: 'provider-configuration',
    component: ProviderConfigurationComponent,
  },
];
