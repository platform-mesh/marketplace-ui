import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { APIResourceService } from '@dxp/ngx-core/automaticd-api-resources';
import { LuigiClient } from '@dxp/ngx-core/luigi';
import { luigiContextSelector } from '@dxp/ngx-core/state';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { CustomResource } from 'models/custom.resource';
import { ActionConfigTypes } from 'models/dialog';
import {
  catchError,
  combineLatestWith,
  filter,
  map,
  mergeMap,
  of,
  withLatestFrom,
} from 'rxjs';
import { parseScopeType } from 'shared/helpers';
import { AccountNamingService } from 'state/account-naming/account-naming.service';
import {
  openAccountResourceCreationDialog,
  openAccountResourceCustomActionDialog,
  openAccountResourceEditDialog,
} from 'state/account-resources/account-resources-edit.action';
import {
  accountResourceLoaded,
  accountResourceSelected,
  accountResourcesLoaded,
  loadAccountResource,
  loadAccountResourcesOfAccount,
} from 'state/account-resources/account-resources-read.action';
import { resourceViewState } from 'state/account-resources/account-resources.selectors';
import { CreditDialogType } from 'state/account-resources/credit-dialog-type';
import { requestFailed } from 'state/common.action';
import { selectSelectedProvider } from 'state/detail-view.selectors';
import { selectScope } from 'state/luigi.selectors';
import { loadProviderMetadata } from 'state/provider-metadata.action';
import { selectProviderMetadata } from 'state/provider-metadata.selectors';
import { ProviderState } from 'state/providerState';

@Injectable({ providedIn: 'root' })
export class AccountResourcesReadEffects {
  constructor(
    private actions: Actions,
    private luigiClient: LuigiClient,
    private apiResourceService: APIResourceService,
    private store: Store<ProviderState>,
    private accountNamingService: AccountNamingService,
  ) {}

  loadAccountResources = createEffect(() =>
    this.actions.pipe(
      ofType(loadAccountResourcesOfAccount),
      mergeMap((action) => {
        const displayConfig =
          action.accountConnection?.type?.apiResourceConfig?.displayConfig;
        if (!displayConfig || !action.accountConnection) {
          return of(
            requestFailed({
              goBack: false,
              error: new HttpErrorResponse({
                error: 'Account connection or display config is missing.',
                status: 400,
                statusText: 'Bad Request',
              }),
              dialogTitle: 'Error when requesting account resources',
            }),
          );
        }

        return this.apiResourceService
          .subscribeToResources<CustomResource>(displayConfig)
          .pipe(
            map((resources) => {
              return accountResourcesLoaded({
                resources,
                accountConnection: action.accountConnection!,
              });
            }),
            catchError((error: HttpErrorResponse) =>
              of(
                requestFailed({
                  goBack: false,
                  error,
                  dialogTitle: 'Error when requesting account resources',
                }),
              ),
            ),
          );
      }),
    ),
  );

  triggerLoadExtensionClassWhenAccountResourceSelected = createEffect(() =>
    this.actions.pipe(
      ofType(accountResourceSelected),
      combineLatestWith(
        this.store.select(selectScope).pipe(filter((x) => !!x)),
      ),
      map(([action, scopeOfCurrentView]) => {
        const installableIn = parseScopeType(scopeOfCurrentView);
        return loadProviderMetadata({
          providerName: action.providerName,
          scope: parseScopeType(action.extClassScope),
          installableIn: installableIn ? [installableIn] : [],
          includeHidden: true,
        });
      }),
    ),
  );

  triggerLoadResourceForTheEditCase = createEffect(() =>
    this.actions.pipe(
      ofType(accountResourceSelected),
      combineLatestWith(this.store.select(selectProviderMetadata)),
      combineLatestWith(this.store.select(resourceViewState)),
      filter(([[action, provider], resourceViewState]) => {
        return (
          !!resourceViewState.accountConnection &&
          !!provider &&
          action.dialogType === CreditDialogType.EDIT &&
          !resourceViewState.accountResource.editResource
        );
      }),
      map(([, resourceViewState]) =>
        loadAccountResource({
          accountConnection: resourceViewState.accountConnection,
          resourceName: resourceViewState.accountResource.resourceName || '',
          resourceNamespace:
            resourceViewState.accountResource.resourceNamespace || '',
        }),
      ),
    ),
  );

  openEditResourceDialog = createEffect(
    () =>
      this.actions.pipe(
        ofType(openAccountResourceEditDialog),
        withLatestFrom(this.store.select(selectSelectedProvider)),
        withLatestFrom(this.store.select(luigiContextSelector)),
        map(([[action, extClass], dxpContext]) => {
          this.luigiClient
            .linkManager()
            .fromClosestContext()
            .withParams({
              type: action.accountConnection?.type?.name || '',
            })
            .navigate(
              `edit-res/${extClass?.scope?.type.toString().toLowerCase()}/${
                extClass?.name
              }/${action.accountConnection?.type?.name}/${
                action.resourceName
              }/${dxpContext.entityContext?.project?.automaticdNamespace}`,
              undefined,
              true,
              {
                title: `Edit ${this.accountNamingService.accountNamingConfig().singular}`,
                size: 's',
              },
            );
        }),
      ),
    { dispatch: false },
  );

  loadAccountResource = createEffect(() =>
    this.actions.pipe(
      ofType(loadAccountResource),
      mergeMap((action) => {
        const apiResourceConfig =
          action.accountConnection?.type?.apiResourceConfig;
        if (!apiResourceConfig) {
          return of(
            requestFailed({
              goBack: true,
              error: new HttpErrorResponse({
                error: 'Account connection is missing.',
                status: 400,
                statusText: 'Bad Request',
              }),
              dialogTitle: 'Error when requesting account resource',
            }),
          );
        } else {
          return this.apiResourceService
            .getResource<CustomResource>(
              apiResourceConfig,
              action.resourceName,
              action.resourceNamespace,
            )
            .pipe(
              map((resource) => {
                return accountResourceLoaded({
                  resource,
                  accountConnection: action.accountConnection!,
                });
              }),
              catchError((error: HttpErrorResponse) =>
                of(
                  requestFailed({
                    goBack: true,
                    error,
                    dialogTitle: 'Error when requesting account resource',
                  }),
                ),
              ),
            );
        }
      }),
    ),
  );

  openCreateResourceDialog = createEffect(
    () =>
      this.actions.pipe(
        ofType(openAccountResourceCreationDialog),
        withLatestFrom(this.store.select(selectSelectedProvider)),
        map(([action, extClass]) => {
          this.luigiClient
            .linkManager()
            .fromClosestContext()
            .withParams({
              type: action.accountConnection?.type?.name || '',
            })
            .navigate(
              `create-res/${extClass?.scope?.type
                .toString()
                .toLowerCase()}/${extClass?.name}/${
                action.accountConnection?.type?.name
              }`,
              undefined,
              true,
              {
                title: action.dialogTitle || 'Add',
                size: 's',
              },
            );
        }),
      ),
    { dispatch: false },
  );

  openCustomActionDialog = createEffect(
    () =>
      this.actions.pipe(
        ofType(openAccountResourceCustomActionDialog),
        withLatestFrom(this.store.select(selectSelectedProvider)),
        map(([action]) => {
          if (
            action.globalAccountActionConfig.actionConfig?.type ===
            ActionConfigTypes.externalLink
          ) {
            window.open(
              action.globalAccountActionConfig.actionConfig.path,
              '_blank',
            );
          } else {
            this.luigiClient
              .linkManager()
              .fromClosestContext()
              .withParams({
                type: action.accountConnection?.type?.name || '',
              })
              .navigate(
                `${action.globalAccountActionConfig.actionConfig?.path}`,
                undefined,
                true,
                {
                  title: action.globalAccountActionConfig.displayName,
                  size: 's',
                },
              );
          }
        }),
      ),
    { dispatch: false },
  );
}
