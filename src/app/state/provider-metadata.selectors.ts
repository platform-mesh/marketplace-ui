import { ProviderState } from './providerState';
import { createSelector } from '@ngrx/store';

export const selectProviderMetadata = createSelector(
  (state: ProviderState) => state.provider,
  (provider) => provider,
);

export const selectProviderMetadataProductOwners = createSelector(
  (state: ProviderState) => {
    const contacts = state.provider?.contacts;
    if (!contacts) {
      return [];
    }
    return contacts.filter(
      (x) =>
        x.roles && x.roles.find((r) => r.toLowerCase() === 'product owner'),
    );
  },
  (productOwners) => productOwners,
);

export const selectProviderMetadataCommunityLinks = createSelector(
  filterByDisplayName('stack search'),
  (link) => link,
);

export const selectProviderMetadataSupportLinks = createSelector(
  filterByDisplayName('support ticket'),
  (link) => link,
);

function filterByDisplayName(displayName: string) {
  return (state: ProviderState) => {
    const supportChannels = state.provider?.preferredSupportChannels;
    if (!supportChannels) {
      return [];
    }

    return supportChannels.filter(
      (x) => x.displayName?.toLowerCase() === displayName.toLowerCase(),
    );
  };
}
