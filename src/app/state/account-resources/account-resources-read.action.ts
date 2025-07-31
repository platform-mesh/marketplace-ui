import { createAction, props } from '@ngrx/store';
import { CustomResource } from 'models/custom.resource';
import { AccountConnection } from 'models/index';
import { CreditDialogType } from 'state/account-resources/credit-dialog-type';

export const loadAccountResourcesOfAccount = createAction(
  '[Account Resources] Read account-resources',
  props<{
    accountConnection: AccountConnection | undefined;
  }>(),
);

export const loadAccountResource = createAction(
  '[Account Resources] Read account-resource',
  props<{
    accountConnection: AccountConnection | undefined;
    resourceName: string;
    resourceNamespace: string;
  }>(),
);

export const accountResourcesLoaded = createAction(
  '[Account Resources] Resources loaded',
  props<{
    accountConnection: AccountConnection;
    resources: CustomResource[];
  }>(),
);
export const accountResourceLoaded = createAction(
  '[Account Resource] Resource loaded',
  props<{
    accountConnection: AccountConnection;
    resource: CustomResource;
  }>(),
);

export const accountResourceSelected = createAction(
  '[Account Resources] Account resource selected',
  props<{
    providerName: string;
    accountType: string;
    resourceName: string;
    resourceNamespace: string;
    dialogType: CreditDialogType;
  }>(),
);
