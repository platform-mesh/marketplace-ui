import { resourceViewState } from './account-resources.selectors';
import { CreditDialogType } from './credit-dialog-type';
import { HttpErrorResponse } from '@angular/common/http';
import { fakeAsync, tick } from '@angular/core/testing';
import { APIResourceService } from '@dxp/ngx-core/automaticd-api-resources';
import { LuigiClient } from '@dxp/ngx-core/luigi';
import { TestUtils } from '@dxp/ngx-core/test';
import { Actions } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { MockStore, createMockStore } from '@ngrx/store/testing';
import { MockProxy, mock } from 'jest-mock-extended';
import { CustomResource } from 'models/custom.resource';
import { ActionConfigTypes } from 'models/dialog';
import {
  APIResourceConfig,
  APIResourceDisplayConfig,
  AccountConnection,
  AccountConnectionType,
  GlobalAccountActionConfig,
  NodeContext,
  ProviderMetadata,
  ScopeType,
} from 'models/index';
import { of, throwError } from 'rxjs';
import { luigiContextSelector } from 'services/luigi/state';
import { parseScopeType } from 'shared/helpers';
import { AccountNamingService } from 'state/account-naming/account-naming.service';
import {
  openAccountResourceCreationDialog,
  openAccountResourceCustomActionDialog,
  openAccountResourceEditDialog,
} from 'state/account-resources/account-resources-edit.action';
import {
  accountResourceLoaded,
  accountResourceSelected,
  accountResourcesLoaded,
  loadAccountResource,
  loadAccountResourcesOfAccount,
} from 'state/account-resources/account-resources-read.action';
import { AccountResourcesReadEffects } from 'state/account-resources/account-resources-read.effects';
import { requestFailed } from 'state/common.action';
import { selectSelectedProvider } from 'state/detail-view.selectors';
import { selectScope } from 'state/luigi.selectors';
import { loadProviderMetadata } from 'state/provider-metadata.action';
import { selectProviderMetadata } from 'state/provider-metadata.selectors';
import { ProviderState } from 'state/providerState';

interface ErrorAction {
  goBack: boolean;
  dialogTitle: string;
  error: HttpErrorResponse;
  type: string;
}

describe('account account-resources edit effects', () => {
  let apiResourceService: MockProxy<APIResourceService>;
  let luigiClient: MockProxy<LuigiClient>;
  let accountConnection: MockProxy<AccountConnection>;
  let displayConfig: MockProxy<APIResourceDisplayConfig>;
  let mockStore: MockStore<ProviderState>;
  let accountNamingService: AccountNamingService;
  const accountConnectionName = 'myAccountConnection';

  beforeEach(() => {
    apiResourceService = mock<APIResourceService>();
    luigiClient = mock<LuigiClient>({
      linkManager: jest.fn().mockReturnValue({
        fromClosestContext: jest.fn().mockReturnValue({
          withParams: jest.fn().mockReturnValue({
            openAsModal: jest.fn(),
            navigate: jest.fn(),
          }),
        }),
      }),
    });

    accountConnection = mock<AccountConnection>();
    accountConnection.name = accountConnectionName;
    const accountConnectionType = mock<AccountConnectionType>();
    const apiResourceConfig = mock<APIResourceConfig>();
    displayConfig = mock<APIResourceDisplayConfig>();
    apiResourceConfig.displayConfig = displayConfig;
    accountConnectionType.apiResourceConfig = apiResourceConfig;
    accountConnection.type = accountConnectionType;
    accountNamingService = new AccountNamingService();

    mockStore = createMockStore();
  });

  afterEach(() => {
    mockStore.complete();
  });

  function createEffects(action: Action) {
    return new AccountResourcesReadEffects(
      new Actions(of(action)),
      luigiClient,
      apiResourceService,
      mockStore,
      accountNamingService,
    );
  }

  describe('on loadAccountResourcesOfAccount', () => {
    it('should trigger account resources loaded', fakeAsync(() => {
      // given
      const action = loadAccountResourcesOfAccount({
        accountConnection,
      });

      const resources = [mock<CustomResource>()];
      apiResourceService.subscribeToResources.mockReturnValue(of(resources));

      const expectedAction = accountResourcesLoaded({
        accountConnection,
        resources,
      });

      const effects = createEffects(action);

      // when
      const emittedAction = TestUtils.getLastValue(
        effects.loadAccountResources,
      );

      // then
      expect(apiResourceService.subscribeToResources).toHaveBeenCalledWith(
        displayConfig,
      );
      expect(emittedAction).toEqual(expectedAction);
    }));

    it('should trigger requestFailed if accountConnection is missing', fakeAsync(() => {
      // given
      const action = loadAccountResourcesOfAccount({
        accountConnection: undefined,
      });

      const resources = [mock<CustomResource>()];
      apiResourceService.subscribeToResources.mockReturnValue(of(resources));

      const expectedAction = requestFailed({
        goBack: false,
        error: new HttpErrorResponse({
          error: 'Account connection or display config is missing.',
          status: 400,
          statusText: 'Bad Request',
        }),
        dialogTitle: 'Error when requesting account resources',
      });

      const effects = createEffects(action);

      // when
      const emittedAction = TestUtils.getLastValue(
        effects.loadAccountResources,
      );

      expect(emittedAction).toEqual(expectedAction);
    }));

    it('should handle an error if the accounts could not be loaded', fakeAsync(() => {
      // given
      const action = loadAccountResourcesOfAccount({
        accountConnection,
      });

      const error = mock<HttpErrorResponse>();

      apiResourceService.subscribeToResources.mockReturnValue(
        throwError(() => error),
      );

      const expectedAction = requestFailed({
        dialogTitle: 'Error when requesting account resources',
        error,
        goBack: false,
      });

      // when
      const effects = createEffects(action);
      const emittedAction = TestUtils.getLastValue(
        effects.loadAccountResources,
      );

      // then
      expect(apiResourceService.subscribeToResources).toHaveBeenCalledWith(
        displayConfig,
      );
      expect(emittedAction).toEqual(expectedAction);
    }));
  });

  describe('on loadAccountResource', () => {
    it('should trigger accountResourceLoaded if successful', fakeAsync(() => {
      // given
      const resourceName = 'my-resource';
      const resourceNamespace = 'my-namespace';
      const action = loadAccountResource({
        accountConnection,
        resourceName,
        resourceNamespace,
      });
      const resource: CustomResource = {
        metadata: {
          name: 'my-resource',
        },
        spec: {
          foo: 'foo-value',
        },
        status: {
          running: true,
        },
      };

      apiResourceService.getResource.mockReturnValue(of(resource));

      const expectedAction = accountResourceLoaded({
        accountConnection,
        resource,
      });

      const effects = createEffects(action);

      // when
      const emittedAction = TestUtils.getLastValue(effects.loadAccountResource);

      // then
      expect(apiResourceService.getResource).toHaveBeenCalledWith(
        accountConnection.type.apiResourceConfig,
        resourceName,
        resourceNamespace,
      );
      expect(emittedAction).toEqual(expectedAction);
    }));

    it('should handle error if apiResourceConfig is missing', fakeAsync(() => {
      // given
      const resourceName = 'my-resource';
      const resourceNamespace = 'my-namespace';
      const action = loadAccountResource({
        accountConnection: undefined as unknown as AccountConnection,
        resourceName,
        resourceNamespace,
      });

      const effects = createEffects(action);

      // when
      const emittedAction = TestUtils.getLastValue(effects.loadAccountResource);

      // then
      const errorAction = emittedAction as ErrorAction;
      expect(errorAction.goBack).toBe(true);
      expect(errorAction.dialogTitle).toBe(
        'Error when requesting account resource',
      );
    }));

    it('should handle error if API call fails', fakeAsync(() => {
      // given
      const resourceName = 'my-resource';
      const resourceNamespace = 'my-namespace';
      const error = mock<HttpErrorResponse>();
      const action = loadAccountResource({
        accountConnection,
        resourceName,
        resourceNamespace,
      });

      apiResourceService.getResource.mockReturnValue(throwError(() => error));
      const effects = createEffects(action);

      // when
      const emittedAction = TestUtils.getLastValue(effects.loadAccountResource);

      // then
      const errorAction = emittedAction as ErrorAction;
      expect(errorAction.goBack).toBe(true);
      expect(errorAction.dialogTitle).toBe(
        'Error when requesting account resource',
      );
      expect(errorAction.error).toBe(error);
    }));
  });

  describe('on openCustomActionDialog', () => {
    it('should open an external link if action type is externalLink', fakeAsync(() => {
      // given
      const externalLinkPath = 'https://example.com/external';
      const globalAccountActionConfig: GlobalAccountActionConfig = {
        displayName: 'External Link',
        actionConfig: {
          type: ActionConfigTypes.externalLink,
          path: externalLinkPath,
        },
        id: '',
        glyph: '',
        condition: '',
      };
      const action = openAccountResourceCustomActionDialog({
        accountConnection: accountConnection,
        globalAccountActionConfig: globalAccountActionConfig,
      });

      mockStore.overrideSelector(selectSelectedProvider, {
        scope: { type: ScopeType.TENANT },
        name: 'testExtension',
        displayName: '',
        configurationMetadata: '',
        instance: null,
        isChangingInstallations: false,
      });
      mockStore.refreshState();

      const effects = createEffects(action);
      jest.spyOn(window, 'open').mockImplementation(() => null);

      // when
      effects.openCustomActionDialog.subscribe();
      tick();

      // then
      expect(window.open).toHaveBeenCalledWith(externalLinkPath, '_blank');
      expect(
        luigiClient.linkManager().fromClosestContext,
      ).not.toHaveBeenCalled();
    }));

    it('should navigate using Luigi Client if action type is not externalLink', fakeAsync(() => {
      // given
      const internalPath = 'internal-path';
      const dialogTitle = 'Internal Action';
      const globalAccountActionConfig: GlobalAccountActionConfig = {
        displayName: dialogTitle,
        actionConfig: {
          type: ActionConfigTypes.luigi,
          path: internalPath,
        },
        id: '',
        glyph: '',
        condition: '',
      };
      const action = openAccountResourceCustomActionDialog({
        accountConnection: accountConnection,
        globalAccountActionConfig: globalAccountActionConfig,
      });

      mockStore.overrideSelector(selectSelectedProvider, {
        scope: { type: ScopeType.TENANT },
        name: 'testExtension',
        displayName: '',
        configurationMetadata: '',
        instance: null,
        isChangingInstallations: false,
      });
      mockStore.refreshState();

      const effects = createEffects(action);

      // when
      effects.openCustomActionDialog.subscribe();
      tick();

      // then
      expect(
        luigiClient.linkManager().fromClosestContext().withParams,
      ).toHaveBeenCalledWith({
        type: accountConnection.type?.name || '',
      });

      expect(
        luigiClient.linkManager().fromClosestContext().withParams({}).navigate,
      ).toHaveBeenCalledWith(internalPath, undefined, true, {
        title: dialogTitle,
        size: 's',
      });
    }));

    it('should handle missing actionConfig gracefully when not externalLink', fakeAsync(() => {
      // given
      const globalAccountActionConfig: GlobalAccountActionConfig = {
        displayName: 'Action without config',
        actionConfig: undefined,
        id: '',
        glyph: '',
        condition: '',
      };
      const action = openAccountResourceCustomActionDialog({
        accountConnection: accountConnection,
        globalAccountActionConfig: globalAccountActionConfig,
      });

      const effects = createEffects(action);

      // when
      effects.openCustomActionDialog.subscribe();
      tick();

      // then
      expect(
        luigiClient.linkManager().fromClosestContext().withParams({}).navigate,
      ).toHaveBeenCalledWith('undefined', undefined, true, {
        title: 'Action without config',
        size: 's',
      });
    }));
  });

  describe('triggerLoadExtensionClassWhenAccountResourceSelected', () => {
    it('should dispatch loadExtensionClass with correct parameters', fakeAsync(() => {
      // given
      const providerName = 'TestClass';
      const extClassScope = 'TENANT';
      const scopeOfCurrentView = ScopeType.GLOBAL;
      const action = accountResourceSelected({
        providerName,
        extClassScope,
        accountType: '',
        resourceName: '',
        resourceNamespace: '',
        dialogType: CreditDialogType.CREATE,
      });
      mockStore.overrideSelector(selectScope, scopeOfCurrentView);
      mockStore.refreshState();

      const effects = createEffects(action);

      // when
      const emittedAction = TestUtils.getLastValue(
        effects.triggerLoadExtensionClassWhenAccountResourceSelected,
      );

      // then
      const parsedScope = parseScopeType(scopeOfCurrentView);
      expect(emittedAction).toEqual(
        loadProviderMetadata({
          providerName,
          scope: parseScopeType(extClassScope),
          installableIn: parsedScope ? [parsedScope] : [],
          includeHidden: true,
        }),
      );
    }));

    it('should not emit if selectScope is undefined', fakeAsync(() => {
      const providerName = 'TestClass';
      const extClassScope = 'TENANT';
      const scopeOfCurrentView = undefined as unknown as ScopeType;
      const action = {
        type: accountResourceSelected.type,
        providerName,
        extClassScope,
      };
      mockStore.overrideSelector(selectScope, scopeOfCurrentView);
      mockStore.refreshState();

      const effects = createEffects(action);

      const emittedAction = TestUtils.getLastValue(
        effects.triggerLoadExtensionClassWhenAccountResourceSelected,
      );
      expect(emittedAction).toBeFalsy();
    }));
  });

  describe('triggerLoadResourceForTheEditCase', () => {
    it('should dispatch loadAccountResource with correct parameters', fakeAsync(() => {
      // given
      const providerName = 'TestClass';
      const extClassScope = 'TENANT';
      const action = accountResourceSelected({
        providerName,
        extClassScope,
        accountType: '',
        resourceName: '',
        resourceNamespace: '',
        dialogType: CreditDialogType.EDIT,
      });
      mockStore.overrideSelector(selectProviderMetadata, {
        scope: { type: ScopeType.TENANT },
        name: providerName,
        displayName: '',
        configurationMetadata: '',
        instance: null,
        isChangingInstallations: false,
      });
      mockStore.overrideSelector(resourceViewState, {
        accountResource: {
          resourceName: 'test-resource',
          resourceNamespace: 'resource-namespace',
          accountConnectionToResources: [
            {
              accountConnection: accountConnection,
              resources: [
                {
                  metadata: { name: 'test-resource' },
                  spec: { size: 'large' },
                  status: {},
                },
              ],
            },
          ],
        },
        accountConnection,
        extensionClass: {
          name: '',
          displayName: '',
          scope: {
            type: ScopeType.TENANT,
          },
          configurationMetadata: '',
          instance: null,
          isChangingInstallations: false,
        },
      });
      mockStore.refreshState();

      const effects = createEffects(action);

      // when
      const emittedAction = TestUtils.getLastValue(
        effects.triggerLoadResourceForTheEditCase,
      );

      // then
      expect(emittedAction).toEqual(
        loadAccountResource({
          accountConnection,
          resourceName: 'test-resource',
          resourceNamespace: 'resource-namespace',
        }),
      );
    }));

    it('should not emit if create dialog type is not edit', fakeAsync(() => {
      const providerName = 'TestClass';
      const extClassScope = 'TENANT';
      const action = accountResourceSelected({
        providerName,
        extClassScope,
        accountType: '',
        resourceName: '',
        resourceNamespace: '',
        dialogType: CreditDialogType.CREATE,
      });
      mockStore.overrideSelector(selectProviderMetadata, {
        scope: { type: ScopeType.TENANT },
        name: providerName,
        displayName: '',
        configurationMetadata: '',
        instance: null,
        isChangingInstallations: false,
      });
      mockStore.overrideSelector(resourceViewState, {
        accountResource: {
          resourceName: 'test-resource',
          resourceNamespace: 'resource-namespace',
          accountConnectionToResources: [
            {
              accountConnection: accountConnection,
              resources: [
                {
                  metadata: { name: 'test-resource' },
                  spec: { size: 'large' },
                  status: {},
                },
              ],
            },
          ],
        },
        accountConnection,
        extensionClass: {
          name: '',
          displayName: '',
          scope: {
            type: ScopeType.TENANT,
          },
          configurationMetadata: '',
          instance: null,
          isChangingInstallations: false,
        },
      });
      mockStore.refreshState();

      const effects = createEffects(action);

      const emittedAction = TestUtils.getLastValue(
        effects.triggerLoadResourceForTheEditCase,
      );
      expect(emittedAction).toBe(undefined);
    }));
  });

  describe('openEditResourceDialog', () => {
    it('should navigate to the edit resource dialog with correct params', fakeAsync(() => {
      // given
      const mockAccountConnection = mock<AccountConnection>({
        type: { name: 'accType' },
      });

      const action = openAccountResourceEditDialog({
        accountConnection: mockAccountConnection,
        resourceName: 'test-resource',
      });

      const extClass = mock<ProviderMetadata>({
        name: 'TestExtension',
        scope: { type: ScopeType.TENANT },
      });
      const dxpContext = mock<NodeContext>({
        entityContext: {
          project: {
            automaticdNamespace: 'test-namespace',
            policies: [],
          },
        },
        token: 'usertoken',
        userid: 'userid',
        tenantid: 'tenantid',
      });

      mockStore.overrideSelector(selectSelectedProvider, extClass);
      mockStore.overrideSelector(luigiContextSelector, dxpContext);
      mockStore.refreshState();

      const effects = createEffects(action);
      // when
      effects.openEditResourceDialog.subscribe();
      tick();

      // then
      expect(
        luigiClient.linkManager().fromClosestContext().withParams,
      ).toHaveBeenCalledWith({ type: 'accType' });
      expect(
        luigiClient
          .linkManager()
          .fromClosestContext()
          .withParams({ type: 'accType' }).navigate,
      ).toHaveBeenCalledWith(
        'edit-res/tenant/TestExtension/accType/test-resource/test-namespace',
        undefined,
        true,
        { title: 'Edit Account', size: 's' },
      );
    }));
  });

  describe('openCreateResourceDialog', () => {
    it('should navigate to the create resource dialog with correct params', fakeAsync(() => {
      // given
      const mockAccountConnection = mock<AccountConnection>({
        type: { name: 'accType' },
      });

      const action = openAccountResourceCreationDialog({
        accountConnection: mockAccountConnection,
        dialogTitle: 'Create Account Resource',
      });

      const extClass = mock<ProviderMetadata>({
        name: 'TestExtension',
        scope: { type: ScopeType.TENANT },
      });

      mockStore.overrideSelector(selectSelectedProvider, extClass);
      mockStore.refreshState();

      const effects = createEffects(action);
      // when
      effects.openCreateResourceDialog.subscribe();
      tick();

      // then
      expect(
        luigiClient.linkManager().fromClosestContext().withParams,
      ).toHaveBeenCalledWith({ type: 'accType' });
      expect(
        luigiClient
          .linkManager()
          .fromClosestContext()
          .withParams({ type: 'accType' }).navigate,
      ).toHaveBeenCalledWith(
        'create-res/tenant/TestExtension/accType',
        undefined,
        true,
        { title: 'Create Account Resource', size: 's' },
      );
    }));
  });
});
