import { ProviderState } from './providerState';
import { createSelector } from '@ngrx/store';

export const selectAccountsPerConnectionTypes = createSelector(
  (state: ProviderState) => state.accounts,
  (state) => state,
);
