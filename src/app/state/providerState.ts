import { ProviderDetailState } from './provider-detail';
import { Account, MarketplaceEntry } from 'models/provider-metadata';
import { AccountResources } from 'state/account-resources/account-resources';

export interface ProviderState {
  accounts: readonly Account[];
  marketplaceEntries: readonly MarketplaceEntry[];
  marketplaceEntry: Readonly<MarketplaceEntry> | undefined;
  changingProviderNames: readonly string[];
  detailView: ProviderDetailState;
  accountResources: AccountResources;
}

export const providersFeatureStateKey = 'providers';
