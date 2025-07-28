import { createAction, props } from '@ngrx/store';
import { ProviderMetadata } from 'models/provider-metadata';

export const retrievedProviders = createAction(
  '[ProviderMetadata Classes/API] Retrieve Providers Success',
  props<{ providers: readonly ProviderMetadata[] }>(),
);

export const loadProviders = createAction(
  '[ProviderMetadata Classes/API] LoadProviders',
);
