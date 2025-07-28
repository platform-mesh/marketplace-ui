import {
  clearProviderMetadata,
  retrievedProviderMetadata,
} from './provider-metadata.action';
import { createReducer, on } from '@ngrx/store';
import { ProviderMetadata } from 'models/provider-metadata';

export const initialState: ProviderMetadata | undefined = undefined;

export const providerMetadataReducer = createReducer(
  initialState as ProviderMetadata | undefined,
  on(retrievedProviderMetadata, (state, { providerMetadata }) => {
    return providerMetadata;
  }),
  on(clearProviderMetadata, () => {
    return initialState;
  }),
);
