import {
  unInstallExtension,
  uninstalledExtensionSuccessfully,
} from './changing-extensions.actions';
import { createReducer, on } from '@ngrx/store';

export const initialState: readonly string[] = [];

export const changingExtensionsReducer = createReducer(
  initialState,
  on(unInstallExtension, (state, { extension }) => {
    return [...state, extension.name];
  }),
  on(uninstalledExtensionSuccessfully, (state, { extension }) => {
    return state.filter(
      (extensionClassName) => extensionClassName !== extension.name,
    );
  }),
);
