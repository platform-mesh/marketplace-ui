import { NodeParams } from '@luigi-project/client';
import { ScopeType } from 'models/provider-metadata';

export interface ProviderConfigurationData extends NodeParams {
  providerName: string;
  providerDisplayName: string;
  scope: ScopeType;
  installableIn: string;
}
