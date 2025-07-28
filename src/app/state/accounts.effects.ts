import { AccountNamingService } from './account-naming/account-naming.service';
import {
  accountAddedSuccess,
  accountRemovedSuccess,
  defaultAccountSetSuccess,
  readAccountsForAccountConnectionTypes,
  removeAccount,
  removeAndSetDefaultAccount,
  removeAndSetDefaultAccountSuccess,
  retrievedAccounts,
  setDefaultAccount,
} from './accounts.action';
import { loadProviders } from './providers.actions';
import { Injectable } from '@angular/core';
import { NotificationService } from '@dxp/ngx-core/notification';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { EMPTY, combineLatest } from 'rxjs';
import { catchError, first, map, mergeMap, tap } from 'rxjs/operators';
import { GraphqlService } from 'services/graphql.service';

@Injectable({ providedIn: 'root' })
export class AccountsEffects {
  loadAccountConnectionTypesForProject = createEffect(() =>
    this.actions.pipe(
      ofType(readAccountsForAccountConnectionTypes),
      mergeMap((readAccountsAction) =>
        this.graphqlService
          .getAccounts(readAccountsAction.accountConnectionTypes)
          .pipe(
            map((accounts) => retrievedAccounts({ accounts })),
            catchError(() => EMPTY),
          ),
      ),
    ),
  );

  accountsModifiedEffect = createEffect(() =>
    this.actions.pipe(
      ofType(
        accountAddedSuccess,
        accountRemovedSuccess,
        defaultAccountSetSuccess,
        removeAndSetDefaultAccountSuccess,
      ),
      tap(({ type }) => {
        const accountNamingSingular =
          this.accountNamingService.accountNamingConfig().singular;
        const accountNamingSingularLowercase =
          this.accountNamingService.accountNamingConfigLowerCase().singular;
        switch (type) {
          case accountAddedSuccess.type:
            this.notificationService.openSuccessToast(
              `The ${accountNamingSingularLowercase} was added.`,
            );
            break;
          case accountRemovedSuccess.type:
            this.notificationService.openSuccessToast(
              `${accountNamingSingular} was removed.`,
            );
            break;
          case defaultAccountSetSuccess.type:
            this.notificationService.openSuccessToast(
              `${accountNamingSingular} was set as default.`,
            );
            break;
          case removeAndSetDefaultAccountSuccess.type:
            this.notificationService.openSuccessToast(
              `${accountNamingSingular} was removed. New default ${accountNamingSingularLowercase} is set.`,
            );
            break;
        }
      }),
      map(() => loadProviders()),
    ),
  );

  removeAccountEffect = createEffect(() =>
    this.actions.pipe(
      ofType(removeAccount),
      mergeMap((action) =>
        this.graphqlService.deleteAccountConnection(action.id).pipe(
          map(() => accountRemovedSuccess()),
          catchError(() => EMPTY),
        ),
      ),
    ),
  );

  setDefaultAccountEffect = createEffect(() =>
    this.actions.pipe(
      ofType(setDefaultAccount),
      mergeMap((action) =>
        this.graphqlService.setDefaultAccount(action.id).pipe(
          map(() => defaultAccountSetSuccess()),
          catchError(() => EMPTY),
        ),
      ),
    ),
  );

  removeAndSetDefaultAccountEffect = createEffect(() =>
    this.actions.pipe(
      ofType(removeAndSetDefaultAccount),
      mergeMap((action) =>
        combineLatest([
          this.graphqlService.deleteAccountConnection(action.removeAccountId),
          this.graphqlService.setDefaultAccount(action.newDefaultAccountId),
        ]).pipe(
          first(),
          map(() => removeAndSetDefaultAccountSuccess()),
          catchError(() => EMPTY),
        ),
      ),
    ),
  );

  constructor(
    private actions: Actions,
    private store: Store,
    private graphqlService: GraphqlService,
    private notificationService: NotificationService,
    private accountNamingService: AccountNamingService,
  ) {}
}
