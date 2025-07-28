import { detailViewOpened } from './detail-view.actions';
import { DetailViewEffect } from './detail-view.effect';
import { selectDetailViewState } from './detail-view.selectors';
import { fakeAsync } from '@angular/core/testing';
import { TestUtils } from '@dxp/ngx-core/test';
import { FlexibleColumnLayout } from '@fundamental-ngx/core/flexible-column-layout/constants';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getContext, getNodeParams } from '@luigi-project/client';
import { Actions } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { MockStore, createMockStore } from '@ngrx/store/testing';
import { mock } from 'jest-mock-extended';
import { NodeContext } from 'models/index';
import { of } from 'rxjs';
import { luigiContextUpdate } from 'services/luigi/state';
import { ProviderState } from 'state/providerState';

const luigiContext = mock<NodeContext>();

describe('DetailViewEffect', () => {
  let mockStore: MockStore<ProviderState>;

  beforeEach(() => {
    mockStore = createMockStore();
  });

  afterEach(() => {
    mockStore.complete();
  });

  function createEffects(action: Action) {
    return new DetailViewEffect(new Actions(of(action)), mockStore);
  }

  describe('detailChange', () => {
    const layout: FlexibleColumnLayout = 'TwoColumnsMidExpanded';
    const providerNameOld = 'providerNameOld';
    const providerName = 'providerName';

    function newStateTest() {
      it('should emit new state', fakeAsync(() => {
        mockStore.overrideSelector(selectDetailViewState, {
          extension: providerNameOld,
        });
        mockStore.refreshState();
        const effects = createEffects(luigiContextUpdate({ luigiContext }));

        const emittedAction = TestUtils.getLastValue(effects.detailChange);

        expect(emittedAction).toEqual(
          detailViewOpened({
            extension: providerName,
          }),
        );
      }));
    }

    describe('with luigi context present', function () {
      beforeEach(() => {
        // @ts-expect-error for mocking
        getContext = jest.fn().mockReturnValue({ layout, providerName });
        // @ts-expect-error for mocking
        getNodeParams = jest.fn().mockReturnValue({});
      });

      newStateTest();
    });

    describe('without luigi context present', function () {
      beforeEach(() => {
        // @ts-expect-error for mocking
        getContext = jest.fn().mockReturnValue({});
        // @ts-expect-error for mocking
        getNodeParams = jest.fn().mockReturnValue({ layout, providerName });
      });

      newStateTest();
    });

    it('should not emit old state', fakeAsync(() => {
      mockStore.overrideSelector(selectDetailViewState, {
        extension: providerName,
      });
      mockStore.refreshState();
      const effects = createEffects(luigiContextUpdate({ luigiContext }));

      const emittedAction = TestUtils.getLastValue(effects.detailChange);

      expect(emittedAction).toBeUndefined();
    }));
  });
});
