import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map } from 'rxjs';
import { creditDialogOpened } from 'state/btp-account/btp-account.action';
import { loadProviderMetadata } from 'state/provider-metadata.action';

@Injectable({ providedIn: 'root' })
export class BtpAccountEffects {
  constructor(private actions: Actions) {}

  triggerLoadExtensionClassWhenAccountResourceSelected = createEffect(() =>
    this.actions.pipe(
      ofType(creditDialogOpened),
      map((action) => {
        return loadProviderMetadata({
          providerName: action.providerName,
          includeHidden: true,
        });
      }),
    ),
  );
}
