import { retrievedAccounts } from './accounts.action';
import { createReducer, on } from '@ngrx/store';
import { Account } from 'models/index';

const initialState: readonly Account[] = [];

export const accountTypesReducer = createReducer(
  initialState,
  on(retrievedAccounts, (state, { accounts }) => {
    return accounts;
  }),
);
