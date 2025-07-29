import { ProviderState } from './providerState';
import { createSelector } from '@ngrx/store';

export const selectDetailViewState = createSelector(
  (state: ProviderState) => state.detailView,
  (state) => state,
);

export const selectSelectedProvider = createSelector(
  (state: ProviderState) => {
    return {
      detailView: state.detailView,
      marketplaceEntries: state.marketplaceEntries,
    };
  },
  (state) => {
    return state.marketplaceEntries.find(
      (e) => e.metadata.name === state.detailView.providerName,
    );
  },
);
