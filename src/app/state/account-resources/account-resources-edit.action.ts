import { createAction, props } from '@ngrx/store';
import { ObjectMeta } from 'kubernetes-types/meta/v1';
import {
  AccountConnection,
  GlobalAccountActionConfig,
  ProviderMetadata,
} from 'models/provider-metadata';

export const createAccountResource = createAction(
  '[Account Resources] Create resource',
  props<{
    metadata: ObjectMeta;
    spec: Record<string, object>;
    extClass: ProviderMetadata | undefined;
    accountConnection: AccountConnection | undefined;
  }>(),
);

export const editAccountResource = createAction(
  '[Account Resources] Edit resource',
  props<{
    spec: Record<string, object>;
    extClass: ProviderMetadata | undefined;
    accountConnection: AccountConnection | undefined;
    resourceName: string | undefined;
  }>(),
);

export const deleteAccountResource = createAction(
  '[Account Resources] Delete resource',
  props<{
    name: string;
    accountConnection: AccountConnection | undefined;
    successMessage?: string;
  }>(),
);

export const patchAccountResource = createAction(
  '[Account Resources] Patch resource',
  props<{
    accountConnection: AccountConnection;
    resourceName: string;
    payload: string;
    successMessage?: string;
  }>(),
);

export const openAccountResourceCreationDialog = createAction(
  '[Account Resources] Create resource Dialog',
  props<{
    accountConnection: AccountConnection | undefined;
    dialogTitle?: string;
  }>(),
);

export const openAccountResourceCustomActionDialog = createAction(
  '[Account Resources] Custom Action resource Dialog',
  props<{
    globalAccountActionConfig: GlobalAccountActionConfig;
    accountConnection: AccountConnection | undefined;
  }>(),
);

export const openAccountResourceEditDialog = createAction(
  '[Account Resources] Edit resource Dialog',
  props<{
    accountConnection: AccountConnection | undefined;
    resourceName: string;
  }>(),
);
