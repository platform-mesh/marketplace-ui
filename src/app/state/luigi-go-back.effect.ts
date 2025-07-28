import { accountAddedSuccess } from './accounts.action';
import { Injectable } from '@angular/core';
import { LuigiClient } from '@dxp/ngx-core/luigi';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { GoBackContext, LuigiGoBackAction } from 'models/luigi-go-back';
import { filter, map } from 'rxjs/operators';
import { luigiContextUpdate } from 'services/luigi/state';

@Injectable({ providedIn: 'root' })
export class LuigiGoBackEffect {
  providerDetails = createEffect(() =>
    this.actions.pipe(
      ofType(luigiContextUpdate),
      filter((context) => {
        return (
          context.luigiContext.goBackContext?.action ===
          LuigiGoBackAction.ACCOUNT_ADDED
        );
      }),
      map(({ luigiContext: { goBackContext } }) => {
        const { action } = goBackContext as GoBackContext;
        switch (action) {
          case LuigiGoBackAction.ACCOUNT_ADDED:
            return accountAddedSuccess();
          default:
            return undefined;
        }
      }),
      filter(Boolean),
    ),
  );

  providerDetailsWithoutDispatched = createEffect(
    () =>
      this.actions.pipe(
        ofType(luigiContextUpdate),
        filter((context) => {
          return (
            context.luigiContext.goBackContext?.action ===
              LuigiGoBackAction.WIZARD_CONFIG_ERROR ||
            context.luigiContext.goBackContext?.action ===
              LuigiGoBackAction.EXTENSION_UNINSTALLED
          );
        }),
        map(({ luigiContext: { goBackContext } }) => {
          const { action, wizardConfigError: wizardError } =
            goBackContext as GoBackContext;
          switch (action) {
            case LuigiGoBackAction.EXTENSION_UNINSTALLED:
              this.luigiClient.clearFrameCache();
              break;
            case LuigiGoBackAction.WIZARD_CONFIG_ERROR:
              void this.luigiClient.uxManager().showAlert({
                type: 'error',
                text: wizardError
                  ? `${wizardError.title}: ${wizardError.message}`
                  : '',
              });
              break;
          }
        }),
      ),
    {
      dispatch: false,
    },
  );

  constructor(
    private actions: Actions,
    private luigiClient: LuigiClient,
  ) {}
}
