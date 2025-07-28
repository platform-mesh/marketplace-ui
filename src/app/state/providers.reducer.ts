import { retrievedProviders } from './providers.actions';
import { createReducer, on } from '@ngrx/store';
import { ProviderMetadata } from 'models/provider-metadata';

export const initialState: readonly ProviderMetadata[] = [];

export const providersReducer = createReducer(
  initialState,
  on(retrievedProviders, (state, { providers }) => {
    const writeableExtClasses = [...providers];
    writeableExtClasses.sort((a, b) =>
      a.displayName.localeCompare(b.displayName),
    );
    return writeableExtClasses;
  }),
);
