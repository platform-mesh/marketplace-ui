import { createAction, props } from '@ngrx/store';
import { Account } from 'models/index';

export const accountAddedSuccess = createAction(
  '[Accounts] Account added successfully',
);

export const accountRemovedSuccess = createAction(
  '[Accounts] Account removed successfully',
);

export const defaultAccountSetSuccess = createAction(
  '[Accounts] Default account was set successfully',
);
export const removeAndSetDefaultAccountSuccess = createAction(
  '[Accounts] Account was removed and new one was set as default successfully',
);

export const readAccountsForAccountConnectionTypes = createAction(
  '[Accounts] Read accounts',
  props<{
    accountConnectionTypes: string[];
  }>(),
);

export const retrievedAccounts = createAction(
  '[Accounts] Retrieved accounts',
  props<{
    accounts: Account[];
  }>(),
);

export const removeAccount = createAction(
  '[Accounts] Remove Account',
  props<{
    id: string;
  }>(),
);

export const setDefaultAccount = createAction(
  '[Accounts] Set Default Account',
  props<{
    id: string;
  }>(),
);

export const removeAndSetDefaultAccount = createAction(
  '[Accounts] Remove Account and Set Default Account',
  props<{
    removeAccountId: string;
    newDefaultAccountId: string;
  }>(),
);
