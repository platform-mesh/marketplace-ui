import { LuigiGoBackAction } from '../models/luigi-go-back';
import {
  unInstallExtension,
  uninstalledExtensionSuccessfully,
} from './changing-extensions.actions';
import { loadProviders } from './providers.actions';
import { Injectable } from '@angular/core';
import { LuigiClient } from '@dxp/ngx-core/luigi';
import { NotificationService } from '@dxp/ngx-core/notification';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, mergeMap, tap } from 'rxjs/operators';
import { GraphqlService } from 'services/graphql.service';

@Injectable({ providedIn: 'root' })
export class ExtensionInstancesEffects {
  unInstallExtensionInstance = createEffect(() =>
    this.actions.pipe(
      ofType(unInstallExtension),
      mergeMap(({ extensionInstanceName, extension }) => {
        return this.graphqlService
          .unInstallExtension(extensionInstanceName)
          .pipe(
            map(() =>
              uninstalledExtensionSuccessfully({
                extension,
              }),
            ),
          );
      }),
    ),
  );

  uninstallCompleteSuccessfully = createEffect(() =>
    this.actions.pipe(
      ofType(uninstalledExtensionSuccessfully),
      tap(() => {
        this.notificationService.openSuccessToast(`Extension Uninstalled`);

        this.luigiClient
          .linkManager()
          .goBack({ action: LuigiGoBackAction.EXTENSION_UNINSTALLED });
      }),
      map(() => loadProviders()),
    ),
  );

  constructor(
    private actions: Actions,
    private graphqlService: GraphqlService,
    private luigiClient: LuigiClient,
    private notificationService: NotificationService,
  ) {}
}
