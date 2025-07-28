import { selectScope } from './luigi.selectors';
import { loadProviders, retrievedProviders } from './providers.actions';
import { Injectable } from '@angular/core';
import { withLatestFromWaiting } from '@dxp/ngx-core/state';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { ScopeType, ServiceStatus } from 'models/index';
import { EMPTY, delay } from 'rxjs';
import { catchError, filter, map, mergeMap } from 'rxjs/operators';
import { GraphqlService } from 'services/graphql.service';

@Injectable({ providedIn: 'root' })
export class ProvidersEffects {
  loadProvidersForProjectOrTeam = createEffect(() =>
    this.actions.pipe(ofType(loadProviders)).pipe(
      withLatestFromWaiting(
        this.store.select(selectScope).pipe(filter((c) => !!c)),
      ),
      filter(([, scope]) => (scope as ScopeType) !== ScopeType.TENANT),
      mergeMap(([, scope]) =>
        this.graphqlService
          .getExtensionClassesForScopesQuery(
            [scope, ScopeType.TENANT, ScopeType.GLOBAL],
            [scope],
          )
          .pipe(
            map((providers) =>
              retrievedProviders({
                providers,
              }),
            ),
            catchError(() => EMPTY),
          ),
      ),
    ),
  );

  loadProvidersForTenant = createEffect(() =>
    this.actions.pipe(ofType(loadProviders)).pipe(
      withLatestFromWaiting(
        this.store.select(selectScope).pipe(filter((c) => !!c)),
      ),
      filter(([, scope]) => (scope as ScopeType) === ScopeType.TENANT),
      mergeMap(() =>
        this.graphqlService
          .getExtensionClassesForScopesQuery(
            [ScopeType.TENANT, ScopeType.GLOBAL],
            [],
            {
              excludeHiddenExtensions: true,
              excludeHiddenInGlobalCatalogExtensions: true,
            },
          )
          .pipe(
            map((providers) =>
              retrievedProviders({
                providers,
              }),
            ),
            catchError(() => EMPTY),
          ),
      ),
    ),
  );

  refreshListIfThereIsAChangingState = createEffect(() =>
    this.actions.pipe(ofType(retrievedProviders)).pipe(
      filter((x) =>
        x.providers.some((y) => y.instance?.status !== ServiceStatus.READY),
      ),
      // wait 1 seconds for a status to change
      delay(1000),
      map(() => loadProviders()),
    ),
  );

  constructor(
    private actions: Actions,
    private store: Store,
    private graphqlService: GraphqlService,
  ) {}
}
