import { detailViewOpened } from './detail-view.actions';
import { ProviderDetailState } from './provider-detail';
import { createReducer, on } from '@ngrx/store';

export const initialState: ProviderDetailState = {};

export const detailViewReducer = createReducer(
  initialState,
  on(detailViewOpened, (_, action) => {
    if (!action.providerName) {
      return initialState;
    }
    return { ...initialState, ...action };
  }),
);
