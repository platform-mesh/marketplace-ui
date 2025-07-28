import { WizardConfigError } from '@dxp/ngx-core/fundamental-wizard-generator';
import { ProviderMetadata } from 'models/index';

export const EXTENSION_INSTALLED = 'EXTENSION_INSTALLED';
export const EXTENSION_UPDATED = 'EXTENSION_UPDATED';

export enum LuigiGoBackAction {
  EXTENSION_UNINSTALLED = 'EXTENSION_UNINSTALLED',
  WIZARD_CONFIG_ERROR = 'WIZARD_CONFIG_ERROR',
  ACCOUNT_ADDED = 'ACCOUNT_ADDED',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  RESOURCE_ACCOUNT_ADDED = 'ACCOUNT_ADDED',
  RESOURCE_ACCOUNT_EDITED = 'ACCOUNT_EDITED',
  RESOURCE_ACCOUNT_CANCEL = 'RESOURCE_ACCOUNT_CANCEL',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  RESOURCE_ACCOUNT_ERROR = 'RESOURCE_ACCOUNT_CANCEL',
}

export interface GoBackContext {
  action: LuigiGoBackAction;
  provider?: ProviderMetadata;
  installationData?: Record<string, unknown>;
  wizardConfigError?: WizardConfigError;
}
