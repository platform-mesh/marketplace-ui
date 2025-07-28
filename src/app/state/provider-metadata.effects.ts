import {
  loadProviderMetadata,
  retrievedProviderMetadata,
} from './provider-metadata.action';
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ProviderMetadata } from 'models/provider-metadata';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { GraphqlService } from 'services/graphql.service';
import { ProviderService } from 'services/provider.service';
import { requestFailed } from 'state/common.action';

@Injectable({ providedIn: 'root' })
export class ProviderMetadataEffects {
  loadProviderMetadata = createEffect(() =>
    this.actions.pipe(ofType(loadProviderMetadata)).pipe(
      switchMap(({ providerName, scope, installableIn, includeHidden }) => {
        if (!scope || !providerName) {
          return of(
            requestFailed({
              goBack: false,
              error: new HttpErrorResponse({
                error: 'Scope and providerName are required',
                status: 400,
                statusText: 'Bad Request',
                url: undefined,
              }),
              dialogTitle: 'Failed to retrieve extension class',
            }),
          );
        }
        const filter = {
          installableIn,
          excludeHiddenExtensions: !includeHidden,
        };
        return this.graphqlService
          .getExtensionClassForScopeQuery(scope, providerName, filter)
          .pipe(
            map((providerMetadata: ProviderMetadata) => {
              const labels = this.providerService.buildLabels(providerMetadata);

              return { ...providerMetadata, labels };
            }),
            map((providerMetadata) =>
              retrievedProviderMetadata({ providerMetadata }),
            ),
          );
      }),
      catchError((error: HttpErrorResponse) =>
        of(
          requestFailed({
            goBack: false,
            error,
            dialogTitle: 'Failed to retrieve extension class',
          }),
        ),
      ),
    ),
  );

  constructor(
    private actions: Actions,
    private graphqlService: GraphqlService,
    private providerService: ProviderService,
  ) {}
}
