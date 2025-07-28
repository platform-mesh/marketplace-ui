import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { combineLatestWith, filter, map } from 'rxjs';
import { parseScopeType } from 'shared/helpers';
import { creditDialogOpened } from 'state/btp-account/btp-account.action';
import { selectScope } from 'state/luigi.selectors';
import { loadProviderMetadata } from 'state/provider-metadata.action';
import { ProviderState } from 'state/providerState';

@Injectable({ providedIn: 'root' })
export class BtpAccountEffects {
  constructor(
    private actions: Actions,
    private store: Store<ProviderState>,
  ) {}

  triggerLoadExtensionClassWhenAccountResourceSelected = createEffect(() =>
    this.actions.pipe(
      ofType(creditDialogOpened),
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
}
