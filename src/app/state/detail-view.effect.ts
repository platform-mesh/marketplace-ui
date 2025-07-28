import { detailViewOpened } from './detail-view.actions';
import { selectDetailViewState } from './detail-view.selectors';
import { Injectable } from '@angular/core';
import { withLatestFromWaiting } from '@dxp/ngx-core/state';
import { getContext, getNodeParams } from '@luigi-project/client';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { LayoutParams } from 'models/layout-params';
import { filter, map } from 'rxjs/operators';
import { luigiContextUpdate } from 'services/luigi/state';
import { ProviderState } from 'state/providerState';

@Injectable({ providedIn: 'root' })
export class DetailViewEffect {
  detailChange = createEffect(() =>
    this.actions.pipe(
      ofType(luigiContextUpdate),
      map(() => {
        const context = getContext();
        if (context.providerName) {
          const { providerName } = context as LayoutParams;
          return {
            provider: providerName,
          };
        }

        const nodeParams = getNodeParams() as LayoutParams;
        const { providerName } = nodeParams;
        return {
          provider: providerName,
        };
      }),
      withLatestFromWaiting(this.store.select(selectDetailViewState)),
      filter(([newState, oldState]) => newState.provider != oldState.provider),
      map(([newState]) => detailViewOpened(newState)),
    ),
  );

  constructor(
    private actions: Actions,
    private store: Store<ProviderState>,
  ) {}
}
