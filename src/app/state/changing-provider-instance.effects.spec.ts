import { ProviderInstanceEffects } from './changing-provider-instance.effects';
import {
  unInstallProviderInstance,
  uninstalledProviderInstanceSuccessfully,
} from './changing-provider-instances.actions';
import { loadProviders } from './providers.actions';
import { fakeAsync } from '@angular/core/testing';
import { LuigiClient } from '@dxp/ngx-core/luigi';
import { NotificationService } from '@dxp/ngx-core/notification';
import { TestUtils } from '@dxp/ngx-core/test';
import { LinkManager } from '@luigi-project/client';
import { Actions } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { MockStore, createMockStore } from '@ngrx/store/testing';
import { MockProxy, mock } from 'jest-mock-extended';
import { ProviderMetadata } from 'models/index';
import { of } from 'rxjs';
import { GraphqlService } from 'services/graphql.service';

describe('ProviderInstancesEffects', () => {
  let mockStore: MockStore;
  let graphqlService: MockProxy<GraphqlService>;
  let luigiClient: MockProxy<LuigiClient>;
  let notificationService: MockProxy<NotificationService>;

  beforeEach(() => {
    luigiClient = mock<LuigiClient>({
      linkManager: jest.fn().mockReturnValue(mock<LinkManager>()),
    });
    graphqlService = mock<GraphqlService>();
    mockStore = createMockStore();
    notificationService = mock<NotificationService>();
  });

  afterEach(() => {
    mockStore.complete();
  });

  function createEffects(action: Action) {
    return new ProviderInstanceEffects(
      new Actions(of(action)),
      graphqlService,
      luigiClient,
      notificationService,
    );
  }

  describe('unInstallExtensionInstance', () => {
    it('should return uninstalledExtensionSuccessfully action', fakeAsync(() => {
      const extensionInstanceName = 'extensionInstanceName';
      const extension = mock<ProviderMetadata>();
      const action = unInstallProviderInstance({
        providerInstanceName: extensionInstanceName,
        provider: extension,
      });

      graphqlService.unInstallExtension.mockReturnValue(of({}));

      const expectedAction = uninstalledProviderInstanceSuccessfully({
        provider: extension,
      });

      // when
      const effects = createEffects(action);
      const emittedAction = TestUtils.getLastValue(
        effects.unInstallProviderInstance,
      );

      expect(graphqlService.unInstallExtension).toHaveBeenCalledWith(
        extensionInstanceName,
      );
      expect(emittedAction).toEqual(expectedAction);
    }));
  });

  describe('uninstallCompleteSuccessfully', () => {
    it('should open message toast for uninstalled extension', fakeAsync(() => {
      const extension = mock<ProviderMetadata>();
      const action = uninstalledProviderInstanceSuccessfully({
        provider: extension,
      });

      const expectedAction = loadProviders();

      // when
      const effects = createEffects(action);
      const emittedAction = TestUtils.getLastValue(
        effects.uninstallCompleteSuccessfully,
      );

      expect(emittedAction).toEqual(expectedAction);
      expect(luigiClient.linkManager).toHaveBeenCalled();
    }));
  });
});
