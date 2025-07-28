import { ProviderDetailState } from './provider-detail';
import { createAction, props } from '@ngrx/store';

export const detailViewOpened = createAction(
  "[Extension Classes] Detail View Opened';",
  props<ProviderDetailState>(),
);
