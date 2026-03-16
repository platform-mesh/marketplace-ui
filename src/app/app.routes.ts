import { ProviderDetailDialogComponent } from './pages/available-providers/provider-detail-dialog/provider-detail-dialog.component';
import { CatalogComponent } from './pages/installed-providers/catalog/catalog.component';
import { BtpAccountCrEditComponent } from './pages/installed-providers/provider-details/btp-account-cr-edit/btp-account-cr-edit.component';
import { CrEditResourceComponent } from './pages/installed-providers/provider-details/provider-accounts/edit-resource-account/cr-edit-resource.component';
import { ImportAccountsComponent } from './pages/installed-providers/provider-details/provider-accounts/import-accounts/import-accounts.component';
import { ProviderDetailsComponent } from './pages/installed-providers/provider-details/provider-details.component';
import { ProviderConfigurationComponent } from './pages/provider/provider-configuration/provider-configuration.component';
import { ProviderMissingMandatoryDataComponent } from './pages/provider/provider-missing-mandatory-data/provider-missing-mandatory-data.component';
import { Routes } from '@angular/router';
import { CreditDialogType } from 'state/account-resources/credit-dialog-type';

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
    path: 'configurations/:providerName',
    component: ProviderDetailsComponent,
  },
  {
    path: 'create-res/:providerName/:accountType',
    component: CrEditResourceComponent,
    data: {
      dialogType: CreditDialogType.CREATE,
    },
  },
  {
    path: 'create-btp-acc/:providerName',
    component: BtpAccountCrEditComponent,
    data: {
      dialogType: CreditDialogType.CREATE,
    },
  },
  {
    path: 'edit-res/:providerName/:accountType/:name/:nspace',
    component: CrEditResourceComponent,
    data: {
      dialogType: CreditDialogType.EDIT,
    },
  },
  {
    path: `provider-missing-mandatory-data/:providerName`,
    component: ProviderMissingMandatoryDataComponent,
  },
  {
    path: `import/:providerName`,
    component: ImportAccountsComponent,
  },
  {
    path: 'provider-configuration',
    component: ProviderConfigurationComponent,
  },
];
