import { HttpErrorResponse } from '@angular/common/http';
import { fakeAsync } from '@angular/core/testing';
import { APIResourceService } from '@dxp/ngx-core/automaticd-api-resources';
import { TestUtils } from '@dxp/ngx-core/test';
import { Actions } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { MockStore, createMockStore } from '@ngrx/store/testing';
import { MockProxy, mock } from 'jest-mock-extended';
import {
  APIResourceConfig,
  APIResourceDisplayConfig,
  AccountConnection,
  AccountConnectionType,
  ProviderMetadata,
} from 'models/index';
import { LuigiGoBackAction } from 'models/luigi-go-back';
import { of, throwError } from 'rxjs';
import { AccountNamingService } from 'state/account-naming/account-naming.service';
import {
  createAccountResource,
  deleteAccountResource,
  editAccountResource,
  patchAccountResource,
} from 'state/account-resources/account-resources-edit.action';
import { AccountResourcesEditEffects } from 'state/account-resources/account-resources-edit.effects';
import {
  goBackAction,
  requestFailed,
  showConfirmation,
} from 'state/common.action';

describe('account account-resources edit effects', () => {
  let apiResourceService: MockProxy<APIResourceService>;
  let accountConnection: MockProxy<AccountConnection>;
  let displayConfig: MockProxy<APIResourceDisplayConfig>;
  let mockStore: MockStore;
  let accountNamingService: AccountNamingService;
  const accountConnectionName = 'myAccountConnection';

  beforeEach(() => {
    apiResourceService = mock<APIResourceService>();
    accountNamingService = new AccountNamingService();
    accountConnection = mock<AccountConnection>();
    accountConnection.name = accountConnectionName;
    const accountConnectionType = mock<AccountConnectionType>();
    const apiResourceConfig = mock<APIResourceConfig>();
    displayConfig = mock<APIResourceDisplayConfig>();
    apiResourceConfig.displayConfig = displayConfig;
    accountConnectionType.apiResourceConfig = apiResourceConfig;
    accountConnection.type = accountConnectionType;

    mockStore = createMockStore();
  });

  afterEach(() => {
    mockStore.complete();
  });

  function createEffects(action: Action) {
    return new AccountResourcesEditEffects(
      new Actions(of(action)),
      apiResourceService,
      accountNamingService,
    );
  }

  describe('on createResource', () => {
    it('should trigger loadAccountResourcesOfAccount if it was successful', fakeAsync(() => {
      // given
      const extClass = mock<ProviderMetadata>();
      const action = createAccountResource({
        metadata: {},
        spec: {},
        extClass: extClass,
        accountConnection,
      });

      apiResourceService.createResource.mockReturnValue(of(undefined));

      // when
      const effects = createEffects(action);
      const emittedAction = TestUtils.getLastValue(effects.createResource);

      // then
      const expectedAction = goBackAction({
        action: LuigiGoBackAction.ACCOUNT_ADDED,
      });
      expect(apiResourceService.createResource).toHaveBeenCalledWith(
        displayConfig,
        action.metadata,
        action.spec,
        accountConnectionName,
      );
      expect(emittedAction).toEqual(expectedAction);
    }));

    it('should throw error if displayConfig or accountConnectionName is missing', fakeAsync(() => {
      const extClass = mock<ProviderMetadata>();
      const action = createAccountResource({
        metadata: {},
        spec: {},
        extClass: extClass,
        accountConnection: undefined,
      });

      // when/then
      expect(() => {
        const effects = createEffects(action);
        TestUtils.getLastValue(effects.createResource);
      }).toThrow(
        'Missing required account connection properties for resource creation.',
      );
    }));

    it('should handle an error if the resource could not be created', fakeAsync(() => {
      // given
      const action = createAccountResource({
        metadata: {},
        spec: {},
        extClass: mock<ProviderMetadata>(),
        accountConnection,
      });
      const error = mock<HttpErrorResponse>();
      const expectedAction = requestFailed({
        error,
        dialogTitle: 'Failed to create account',
        goBack: false,
      });
      apiResourceService.createResource.mockReturnValue(
        throwError(() => error),
      );

      // when
      const effects = createEffects(action);
      const emittedAction = TestUtils.getLastValue(effects.createResource);

      // then
      expect(apiResourceService.createResource).toHaveBeenCalledWith(
        displayConfig,
        action.metadata,
        action.spec,
        accountConnectionName,
      );
      expect(emittedAction).toEqual(expectedAction);
    }));
  });

  describe('on deleteResource', () => {
    it('should trigger a confirmation if it was successful', fakeAsync(() => {
      // given
      const name = 'resource-name';
      const action = deleteAccountResource({
        accountConnection,
        name,
      });
      apiResourceService.deleteResource.mockReturnValue(of(undefined));
      const expectedAction = showConfirmation({
        message: 'Account deleted',
      });

      // when
      const effects = createEffects(action);
      const emittedAction = TestUtils.getLastValue(effects.deleteResource);

      // then
      expect(apiResourceService.deleteResource).toHaveBeenCalledWith(
        displayConfig,
        action.name,
      );
      expect(emittedAction).toEqual(expectedAction);
    }));

    it('should throw an error if displayConfig is missing', fakeAsync(() => {
      const name = 'resource-name';
      const action = deleteAccountResource({
        accountConnection: undefined,
        name,
      });

      expect(() => {
        const effects = createEffects(action);
        TestUtils.getLastValue(effects.deleteResource);
      }).toThrow('Missing required displayConfig for resource deletion.');
    }));

    it('should handle an error if the resource could not be deleted', fakeAsync(() => {
      // given
      const name = 'resource-name';
      const action = deleteAccountResource({
        accountConnection,
        name,
      });
      const error = mock<HttpErrorResponse>();
      apiResourceService.deleteResource.mockReturnValue(
        throwError(() => error),
      );
      const expectedAction = requestFailed({
        error,
        dialogTitle: 'Failed to delete account',
        goBack: false,
      });

      // when
      const effects = createEffects(action);
      const emittedAction = TestUtils.getLastValue(effects.deleteResource);

      // then
      expect(apiResourceService.deleteResource).toHaveBeenCalledWith(
        displayConfig,
        action.name,
      );
      expect(emittedAction).toEqual(expectedAction);
    }));
  });

  describe('on editResource', () => {
    it('should trigger goBackAction if it was successful', fakeAsync(() => {
      // given
      const extClass = mock<ProviderMetadata>();
      const resourceName = 'resource-to-edit';
      const action = editAccountResource({
        spec: {},
        extClass: extClass,
        accountConnection,
        resourceName,
      });
      apiResourceService.updateResource.mockReturnValue(of(undefined));
      const expectedAction = goBackAction({
        action: LuigiGoBackAction.RESOURCE_ACCOUNT_EDITED,
      });

      // when
      const effects = createEffects(action);
      const emittedAction = TestUtils.getLastValue(effects.editResource);

      // then
      expect(apiResourceService.updateResource).toHaveBeenCalledWith(
        displayConfig,
        resourceName,
        action.spec,
      );
      expect(emittedAction).toEqual(expectedAction);
    }));

    it('should throw error if displayConfig or resourceName is missing', fakeAsync(() => {
      // given
      const extClass = mock<ProviderMetadata>();
      const action = editAccountResource({
        spec: {},
        extClass: extClass,
        accountConnection: undefined,
        resourceName: undefined,
      });

      expect(() => {
        // when/then
        const effects = createEffects(action);
        TestUtils.getLastValue(effects.editResource);
      }).toThrow('Missing required properties for resource editing.');
    }));

    it('should handle an error if the resource could not be updated', fakeAsync(() => {
      // given
      const extClass = mock<ProviderMetadata>();
      const resourceName = 'resource-to-edit';
      const action = editAccountResource({
        spec: {},
        extClass: extClass,
        accountConnection,
        resourceName,
      });

      const error = mock<HttpErrorResponse>();
      apiResourceService.updateResource.mockReturnValue(
        throwError(() => error),
      );

      const expectedAction = requestFailed({
        error,
        dialogTitle: 'Failed to update account',
        goBack: false,
      });

      // when
      const effects = createEffects(action);
      const emittedAction = TestUtils.getLastValue(effects.editResource);

      // then
      expect(apiResourceService.updateResource).toHaveBeenCalledWith(
        displayConfig,
        resourceName,
        action.spec,
      );
      expect(emittedAction).toEqual(expectedAction);
    }));
  });

  describe('on patchResource', () => {
    it('should trigger showConfirmation if it was successful', fakeAsync(() => {
      // given
      const resourceName = 'resource-to-patch';
      const payload = '{"key":"value"}';
      const successMessage = 'Patched successfully!';
      const action = patchAccountResource({
        accountConnection,
        resourceName,
        payload,
        successMessage,
      });
      apiResourceService.patchResource.mockReturnValue(of(undefined));
      const expectedAction = showConfirmation({
        message: successMessage,
      });

      // when
      const effects = createEffects(action);
      const emittedAction = TestUtils.getLastValue(effects.patchResource);

      // then
      expect(apiResourceService.patchResource).toHaveBeenCalledWith(
        displayConfig,
        resourceName,
        payload,
      );
      expect(emittedAction).toEqual(expectedAction);
    }));

    it('should throw error if displayConfig is missing', fakeAsync(() => {
      // given
      const resourceName = 'resource-to-patch';
      const payload = '{"key":"value"}';
      const action = patchAccountResource({
        accountConnection: undefined as unknown as AccountConnection,
        resourceName,
        payload,
      });
      // when/then
      expect(() => {
        const effects = createEffects(action);
        TestUtils.getLastValue(effects.patchResource);
      }).toThrow('Missing required properties for resource patch.');
    }));

    it('should handle an error if the resource could not be patched', fakeAsync(() => {
      // given
      const resourceName = 'resource-to-patch';
      const payload = '{"key":"value"}';
      const action = patchAccountResource({
        accountConnection,
        resourceName,
        payload,
      });
      const error = mock<HttpErrorResponse>();
      apiResourceService.patchResource.mockReturnValue(throwError(() => error));
      const expectedAction = requestFailed({
        error,
        dialogTitle: 'Failed to execute action',
        goBack: false,
      });

      // when
      const effects = createEffects(action);
      const emittedAction = TestUtils.getLastValue(effects.patchResource);

      // then
      expect(apiResourceService.patchResource).toHaveBeenCalledWith(
        displayConfig,
        resourceName,
        payload,
      );
      expect(emittedAction).toEqual(expectedAction);
    }));
  });
});
