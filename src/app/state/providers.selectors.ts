import { ProviderState } from './providerState';
import { createSelector } from '@ngrx/store';

export const selectProviders = (state: ProviderState) => {
  return state.providers;
};

export const selectInstalledProviders = createSelector(
  selectProviders,
  (providers) => providers.filter((x) => !!x.instance),
);

export const selectAllProviders = createSelector(
  selectProviders,
  (providers) => providers,
);
