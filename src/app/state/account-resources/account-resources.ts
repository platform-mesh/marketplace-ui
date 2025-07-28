import { CustomResource } from 'models/custom.resource';
import { AccountConnection } from 'models/index';
import { CreditDialogType } from 'state/account-resources/credit-dialog-type';

export interface AccountResources {
  accountType?: string;
  resourceName?: string;
  resourceNamespace?: string;
  dialogType?: CreditDialogType;
  accountConnectionToResources: AccountConnectionToResources[];
  editResource?: CustomResource;
}

export interface AccountConnectionToResources {
  accountConnection: AccountConnection;
  resources: CustomResource[];
}
