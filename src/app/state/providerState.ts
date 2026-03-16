import { ProviderDetailState } from './provider-detail';
import { MarketplaceEntry } from 'models/provider-metadata';

export interface ProviderState {
  marketplaceEntries: readonly MarketplaceEntry[];
  marketplaceEntry: Readonly<MarketplaceEntry> | undefined;
  changingProviderNames: readonly string[];
  detailView: ProviderDetailState;
}

export const providersFeatureStateKey = 'providers';
