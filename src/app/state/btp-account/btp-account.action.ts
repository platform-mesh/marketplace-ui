import { createAction, props } from '@ngrx/store';
import { CreditDialogType } from 'state/account-resources/credit-dialog-type';

export const creditDialogOpened = createAction(
  '[BTP Account] credit dialog opened',
  props<{
    providerName: string;
    dialogType: CreditDialogType;
  }>(),
);
