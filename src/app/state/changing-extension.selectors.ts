import { ProviderState } from './providerState';
import { createSelector } from '@ngrx/store';

const selectChangingClassNamesSelector = (state: ProviderState) => {
  return state.changingProviderNames;
};

export const isExtensionChanging = (extensionName: string | undefined) => {
  return createSelector(selectChangingClassNamesSelector, (x) => {
    if (!extensionName) {
      return false;
    }
    return x.includes(extensionName);
  });
};
