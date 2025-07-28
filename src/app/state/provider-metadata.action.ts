import { createAction, props } from '@ngrx/store';
import { ProviderMetadata, ScopeType } from 'models/provider-metadata';

export const retrievedProviderMetadata = createAction(
  '[Provider Metadata/API] Retrieve ProviderMetadata Success',
  props<{ providerMetadata: ProviderMetadata }>(),
);

export const loadProviderMetadata = createAction(
  '[Provider Metadata/API] Load ProviderMetadata',
  props<{
    providerName?: string;
    scope: ScopeType | undefined;
    installableIn: string[];
    includeHidden?: boolean;
  }>(),
);

export const clearProviderMetadata = createAction(
  '[Provider Metadata/API] Clear ProviderMetadata selection',
);
