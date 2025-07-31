import { NodeParams } from '@luigi-project/client';

export interface ProviderConfigurationData extends NodeParams {
  providerName: string;
  providerDisplayName: string;
  installableIn: string;
}
