import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { APIResourceService } from '@dxp/ngx-core/automaticd-api-resources';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { CustomResource } from 'models/custom.resource';
import { LuigiGoBackAction } from 'models/luigi-go-back';
import { catchError, map, mergeMap, of, tap } from 'rxjs';
import { triggerMatomoEvent } from 'shared/helpers';
import { AccountNamingService } from 'state/account-naming/account-naming.service';
import {
  createAccountResource,
  deleteAccountResource,
  editAccountResource,
  patchAccountResource,
} from 'state/account-resources/account-resources-edit.action';
import {
  goBackAction,
  requestFailed,
  showConfirmation,
} from 'state/common.action';

@Injectable({ providedIn: 'root' })
export class AccountResourcesEditEffects {
  constructor(
    private actions: Actions,
    private apiResourceService: APIResourceService,
    private accountNamingService: AccountNamingService,
  ) {}

  createResource = createEffect(() =>
    this.actions.pipe(
      ofType(createAccountResource),
      mergeMap((action) => {
        const displayConfig =
          action.accountConnection?.type?.apiResourceConfig?.displayConfig;
        const name = action.accountConnection?.name;

        if (!displayConfig || !name) {
          throw new Error(
            'Missing required account connection properties for resource creation.',
          );
        }

        return this.apiResourceService
          .createResource<CustomResource>(
            displayConfig,
            action.metadata,
            action.spec,
            name,
          )
          .pipe(
            map(() => {
              return goBackAction({
                action: LuigiGoBackAction.RESOURCE_ACCOUNT_ADDED,
              });
            }),
            catchError((error: HttpErrorResponse) =>
              of(
                requestFailed({
                  goBack: false,
                  error,
                  dialogTitle: `Failed to create ${this.accountNamingService.accountNamingConfigLowerCase().singular}`,
                }),
              ),
            ),
          );
      }),
    ),
  );

  deleteResource = createEffect(() =>
    this.actions.pipe(
      ofType(deleteAccountResource),
      mergeMap((action) => {
        const displayConfig =
          action.accountConnection?.type?.apiResourceConfig?.displayConfig;
        const name = action.name;

        if (!displayConfig) {
          throw new Error(
            'Missing required displayConfig for resource deletion.',
          );
        }

        return this.apiResourceService
          .deleteResource<CustomResource>(displayConfig, name)
          .pipe(
            tap(() => {
              triggerMatomoEvent('deleteAccountResource', {
                extensionName: action.accountConnection?.displayName,
              });
            }),
            map(() =>
              showConfirmation({
                message:
                  action.successMessage ||
                  `${this.accountNamingService.accountNamingConfig().singular} deleted`,
              }),
            ),
            catchError((error: HttpErrorResponse) =>
              of(
                requestFailed({
                  goBack: false,
                  error,
                  dialogTitle: `Failed to delete ${this.accountNamingService.accountNamingConfigLowerCase().singular}`,
                }),
              ),
            ),
          );
      }),
    ),
  );

  editResource = createEffect(() =>
    this.actions.pipe(
      ofType(editAccountResource),
      mergeMap((action) => {
        const displayConfig =
          action.accountConnection?.type?.apiResourceConfig?.displayConfig;
        const resourceName = action.resourceName;

        if (!displayConfig || !resourceName) {
          throw new Error('Missing required properties for resource editing.');
        }
        return this.apiResourceService
          .updateResource<CustomResource>(
            displayConfig,
            resourceName,
            action.spec,
          )
          .pipe(
            map(() => {
              return goBackAction({
                action: LuigiGoBackAction.RESOURCE_ACCOUNT_EDITED,
              });
            }),
            catchError((error: HttpErrorResponse) =>
              of(
                requestFailed({
                  goBack: false,
                  error,
                  dialogTitle: `Failed to update ${this.accountNamingService.accountNamingConfigLowerCase().singular}`,
                }),
              ),
            ),
          );
      }),
    ),
  );

  patchResource = createEffect(() =>
    this.actions.pipe(
      ofType(patchAccountResource),
      mergeMap((action) => {
        const displayConfig =
          action.accountConnection?.type?.apiResourceConfig?.displayConfig;
        if (!displayConfig) {
          throw new Error('Missing required properties for resource patch.');
        }

        return this.apiResourceService
          .patchResource<CustomResource>(
            displayConfig,
            action.resourceName,
            action.payload,
          )
          .pipe(
            map(() =>
              showConfirmation({
                message: action.successMessage || 'Action executed',
              }),
            ),
            catchError((error: HttpErrorResponse) =>
              of(
                requestFailed({
                  goBack: false,
                  error,
                  dialogTitle: 'Failed to execute action',
                }),
              ),
            ),
          );
      }),
    ),
  );
}
