import { GraphqlService } from './graphql.service';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  AccountsApolloClientService,
  ExtensionApolloClientService,
} from '@dxp/ngx-core/apollo';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
  Account,
  InstallProviderInput,
  NodeContext,
  ProviderMetadata,
  ProviderMetadataFilter,
  ScopeType,
  UpdateProviderInput,
} from 'models/index';
import { of } from 'rxjs';
import { luigiContextSelector } from 'services/luigi/state';
import { selectScopeInfo } from 'state/luigi.selectors';

const mockExtensionClass: ProviderMetadata = {
  name: 'test-extension',
  displayName: 'Test Extension',
  scope: {
    type: ScopeType.PROJECT,
  },
  configurationMetadata: '',
  instance: null,
  isChangingInstallations: false,
};

const mockInstalledExtension = {
  id: 'ext-id-123',
  name: 'installed-ext-name',
};

const mockAccount: Account = {
  id: 'acc-123',
  name: 'mockAccountName',
  displayName: 'Mock Account Display Name',
  type: {
    id: 'type-id',
    defaultAccount: {
      id: 'default-acc-id',
      displayName: 'Default Account Display Name',
      name: '',
      type: {
        id: '',
        displayName: '',
        type: {
          Name: '',
        },
      },
      ref: '',
    },
    displayName: 'Account Type Display Name',
    description: 'Account Type Description',
    image: 'image-url',
    type: { Name: 'SomeType' },
  },
  subType: 'subType1',
  link: 'link-url',
  ref: '',
};

describe('GraphqlService', () => {
  let service: GraphqlService;
  let mockStore: MockStore;

  let mockApolloQuery: jest.Mock;
  let mockApolloMutate: jest.Mock;
  let mockAccountsApolloQuery: jest.Mock;
  let mockAccountsApolloMutate: jest.Mock;

  const mockLuigiContext: NodeContext = {
    tenantid: 'mockTenantId',
    projectId: 'mockProjectId',
    teamId: 'mockTeamId',
    token: '',
    userid: '',
    frameContext: undefined as unknown as NodeContext['frameContext'],
    serviceProviderConfig: {} as Record<string, string>,
    serviceProvider: undefined,
    entityContext: {},
    parentNavigationContexts: [],
  } as unknown as NodeContext;

  const mockScopeInfo = {
    scopeId: 'mockProjectId',
    scopeType: ScopeType.PROJECT,
  };

  beforeEach(async () => {
    mockApolloQuery = jest.fn();
    mockApolloMutate = jest.fn();
    mockAccountsApolloQuery = jest.fn();
    mockAccountsApolloMutate = jest.fn();

    await TestBed.configureTestingModule({
      providers: [
        provideMockStore({}),
        GraphqlService,
        {
          provide: ExtensionApolloClientService,
          useValue: {
            apollo: jest.fn(() =>
              of({
                query: mockApolloQuery,
                mutate: mockApolloMutate,
              }),
            ),
          },
        },
        {
          provide: AccountsApolloClientService,
          useValue: {
            apollo: jest.fn(() =>
              of({
                query: mockAccountsApolloQuery,
                mutate: mockAccountsApolloMutate,
              }),
            ),
          },
        },
      ],
    }).compileComponents();

    mockStore = TestBed.inject(MockStore);
    service = TestBed.inject(GraphqlService);

    mockStore.overrideSelector(luigiContextSelector, mockLuigiContext);
    mockStore.overrideSelector(selectScopeInfo, mockScopeInfo);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getExtensionClassForScopeQuery', () => {
    it('should query for an extension class for a given scope', fakeAsync(() => {
      mockApolloQuery.mockReturnValue(
        of({ data: { getExtensionClassForScope: mockExtensionClass } }),
      );

      const scope = ScopeType.PROJECT;
      const providerName = 'myExtension';
      const extFilter = { excludeHiddenExtensions: true };

      let result: ProviderMetadata | undefined;
      service
        .getExtensionClassForScopeQuery(scope, providerName, extFilter)
        .subscribe((res) => {
          result = res;
        });

      tick();

      expect(result).toEqual(mockExtensionClass);
      expect(mockApolloQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: {
            tenantId: mockLuigiContext.tenantid,
            type: scope,
            context:
              GraphqlService['createGraphqlContextObject'](mockLuigiContext),
            providerName,
            filter: extFilter,
          },
          fetchPolicy: 'no-cache',
        }),
      );
    }));
  });

  describe('createExtFilter', () => {
    it('should return a filter with excludeHiddenExtensions: true when no installableIn is provided', () => {
      const filter = service.createExtFilter();
      expect(filter).toEqual({ excludeHiddenExtensions: true });
    });

    it('should return a filter with installableIn and excludeHiddenExtensions: true when installableIn is provided', () => {
      const installableIn = ['scope1', 'scope2'];
      const filter = service.createExtFilter(installableIn);
      expect(filter).toEqual({
        installableIn,
        excludeHiddenExtensions: true,
      });
    });
  });

  describe('getExtensionClassesForScopesQuery', () => {
    it('should query for extension classes for given scopes', fakeAsync(() => {
      const mockExtensionClasses: ProviderMetadata[] = [
        mockExtensionClass,
        { ...mockExtensionClass, name: 'another-ext' },
      ];
      mockApolloQuery.mockReturnValue(
        of({ data: { getExtensionClassesForScopes: mockExtensionClasses } }),
      );

      const scopes = [ScopeType.PROJECT, ScopeType.TEAM];
      const installableIn = ['ProjectA'];
      const extFilter = service.createExtFilter(installableIn);

      let result: ProviderMetadata[] | undefined;
      service
        .getExtensionClassesForScopesQuery(scopes, installableIn)
        .subscribe((res) => {
          result = res;
        });

      tick();

      expect(result).toEqual(mockExtensionClasses);
      expect(mockApolloQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            tenantId: mockLuigiContext.tenantid,
            types: scopes,
            context:
              GraphqlService['createGraphqlContextObject'](mockLuigiContext),
            filter: extFilter,
          }),
          fetchPolicy: 'no-cache',
        }),
      );
    }));

    it('should use provided extFilter if available', fakeAsync(() => {
      const mockExtensionClasses: ProviderMetadata[] = [mockExtensionClass];
      mockApolloQuery.mockReturnValue(
        of({ data: { getExtensionClassesForScopes: mockExtensionClasses } }),
      );

      const scopes = [ScopeType.PROJECT];
      const customFilter: ProviderMetadataFilter = {
        installableIn: ['Project'],
      };

      let result: ProviderMetadata[] | undefined;
      service
        .getExtensionClassesForScopesQuery(scopes, undefined, customFilter)
        .subscribe((res) => {
          result = res;
        });

      tick();

      expect(result).toEqual(mockExtensionClasses);
      expect(mockApolloQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: {
            tenantId: mockLuigiContext.tenantid,
            types: scopes,
            context:
              GraphqlService['createGraphqlContextObject'](mockLuigiContext),
            filter: customFilter,
          },
          fetchPolicy: 'no-cache',
        }),
      );
    }));
  });

  describe('installExtension', () => {
    it('should call installExtension mutation with correct variables', fakeAsync(() => {
      mockApolloMutate.mockReturnValue(
        of({ data: { installExtension: mockInstalledExtension } }),
      );

      const installInput: InstallProviderInput = {
        providerInput: {
          id: 'my-new-ext',
          scope: ScopeType.PROJECT,
        },
        displayName: 'my-new-ext-instance',
        installationData: { someKey: 'someValue' },
      };

      let result: unknown;
      service.installExtension(installInput).subscribe((res) => {
        result = res;
      });

      tick();

      expect(mockApolloMutate).toHaveBeenCalledWith({
        mutation: expect.anything(),
        variables: {
          tenantId: mockLuigiContext.tenantid,
          scope: mockScopeInfo.scopeId,
          entity: mockScopeInfo.scopeType.toLowerCase(),
          input: installInput,
        },
      });
      expect(result).toEqual({
        data: { installExtension: mockInstalledExtension },
      });
    }));
  });

  describe('unInstallExtension', () => {
    it('should call uninstallExtension mutation with correct variables', fakeAsync(() => {
      mockApolloMutate.mockReturnValue(
        of({ data: { uninstallExtension: true } }),
      );

      const extName = 'extension-to-uninstall';
      let result: unknown;
      service.unInstallExtension(extName).subscribe((res) => {
        result = res;
      });

      tick();

      expect(mockApolloMutate).toHaveBeenCalledWith({
        mutation: expect.anything(),
        variables: {
          tenantId: mockLuigiContext.tenantid,
          scope: mockScopeInfo.scopeId,
          entity: mockScopeInfo.scopeType.toLowerCase(),
          name: extName,
        },
      });
      expect(result).toEqual({ data: { uninstallExtension: true } });
    }));
  });

  describe('updateExtensionInstance', () => {
    it('should call updateExtension mutation with correct variables', fakeAsync(() => {
      mockApolloMutate.mockReturnValue(of({ data: { updateExtension: true } }));

      const updateInput: UpdateProviderInput = {
        providerInput: {
          id: 'my-new-ext',
          scope: ScopeType.PROJECT,
        },
        instanceId: 'instance-123',
        installationData: { paths: ['configuration'] },
      };

      let result: unknown;
      service.updateExtensionInstance(updateInput).subscribe((res) => {
        result = res;
      });

      tick();

      expect(mockApolloMutate).toHaveBeenCalledWith({
        mutation: expect.anything(),
        variables: {
          tenantId: mockLuigiContext.tenantid,
          scope: mockScopeInfo.scopeId,
          entity: mockScopeInfo.scopeType.toLowerCase(),
          input: updateInput,
        },
      });
      expect(result).toEqual({ data: { updateExtension: true } });
    }));

    it('should throw error if input is undefined', fakeAsync(() => {
      let error: Error | undefined;
      service
        .updateExtensionInstance(undefined as unknown as UpdateProviderInput)
        .subscribe({
          error: (err) => (error = err),
        });

      tick();

      expect(error?.message).toBe('scopeInfo is undefined');
      expect(mockApolloMutate).not.toHaveBeenCalled();
    }));
  });

  describe('getAccounts', () => {
    it('should query for accounts with correct variables', fakeAsync(() => {
      mockAccountsApolloQuery.mockReturnValue(
        of({ data: { accountConnectionsForScope: [mockAccount] } }),
      );

      const accountConnectionTypes = ['TypeA', 'TypeB'];
      let result: Account[] | undefined;
      service.getAccounts(accountConnectionTypes).subscribe((res) => {
        result = res;
      });

      tick();

      expect(result).toEqual([mockAccount]);
      expect(mockAccountsApolloQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            tenantId: mockLuigiContext.tenantid,
            scope: mockScopeInfo.scopeId,
            entity: mockScopeInfo.scopeType.toLowerCase(),
            accountConnectionTypes,
          }),
          fetchPolicy: 'no-cache',
        }),
      );
    }));

    it('should handle getScope returning undefined (e.g., for other scopeType different from team and project)', fakeAsync(() => {
      mockAccountsApolloQuery.mockReturnValue(
        of({ data: { accountConnectionsForScope: [] } }),
      );
      mockStore.overrideSelector(selectScopeInfo, {
        scopeId: 'unknownId',
        scopeType: ScopeType.GLOBAL,
      });

      const accountConnectionTypes = ['TypeA'];
      let result: Account[] | undefined;
      service.getAccounts(accountConnectionTypes).subscribe((res) => {
        result = res;
      });

      tick();

      expect(result).toEqual([]);
      expect(mockAccountsApolloQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: {
            tenantId: mockLuigiContext.tenantid,
            scope: undefined,
            entity: ScopeType.GLOBAL.toLowerCase(),
            accountConnectionTypes,
          },
          fetchPolicy: 'no-cache',
        }),
      );
    }));
  });

  describe('deleteAccountConnection', () => {
    it('should call deleteAccountConnectionForScope mutation with correct variables', fakeAsync(() => {
      mockAccountsApolloMutate.mockReturnValue(
        of({ data: { deleteAccountConnectionForScope: true } }),
      );

      const accountId = 'acc-to-delete';
      let result: boolean | undefined;
      service.deleteAccountConnection(accountId).subscribe((res) => {
        result = res;
      });

      tick();

      expect(result).toBe(true);
      expect(mockAccountsApolloMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          mutation: expect.anything(),
          variables: expect.objectContaining({
            tenantId: mockLuigiContext.tenantid,
            scope: mockScopeInfo.scopeId,
            entity: mockScopeInfo.scopeType.toLowerCase(),
            id: accountId,
          }),
        }),
      );
    }));

    it('should return false if data is null or undefined', fakeAsync(() => {
      mockAccountsApolloMutate.mockReturnValue(of({ data: null }));
      const accountId = 'acc-to-delete';
      let result: boolean | undefined;
      service.deleteAccountConnection(accountId).subscribe((res) => {
        result = res;
      });
      tick();
      expect(result).toBe(false);

      mockAccountsApolloMutate.mockReturnValue(of({ data: undefined }));
      service.deleteAccountConnection(accountId).subscribe((res) => {
        result = res;
      });
      tick();
      expect(result).toBe(false);
    }));
  });

  describe('setDefaultAccount', () => {
    it('should call setDefaultAccount mutation with correct variables', fakeAsync(() => {
      mockAccountsApolloMutate.mockReturnValue(
        of({ data: { setDefaultAccount: true } }),
      );

      const accountName = 'newDefaultAccount';
      let result: boolean | undefined;
      service.setDefaultAccount(accountName).subscribe((res) => {
        result = res;
      });

      tick();

      expect(result).toBe(true);
      expect(mockAccountsApolloMutate).toHaveBeenCalledWith({
        mutation: expect.anything(),
        variables: {
          tenantId: mockLuigiContext.tenantid,
          scope: mockScopeInfo.scopeId,
          entity: mockScopeInfo.scopeType.toLowerCase(),
          accountName,
        },
      });
    }));

    it('should return false if data is null or undefined', fakeAsync(() => {
      mockAccountsApolloMutate.mockReturnValue(of({ data: null }));
      const accountName = 'newDefaultAccount';
      let result: boolean | undefined;
      service.setDefaultAccount(accountName).subscribe((res) => {
        result = res;
      });
      tick();
      expect(result).toBe(false);

      mockAccountsApolloMutate.mockReturnValue(of({ data: undefined }));
      service.setDefaultAccount(accountName).subscribe((res) => {
        result = res;
      });
      tick();
      expect(result).toBe(false);
    }));
  });

  describe('createGraphqlContextObject', () => {
    it('should create context object with tenant, project, and team', () => {
      const contextObject =
        GraphqlService['createGraphqlContextObject'](mockLuigiContext);
      expect(contextObject).toEqual({
        entries: [
          { key: 'tenant', value: mockLuigiContext.tenantid },
          { key: 'project', value: mockLuigiContext.projectId },
          { key: 'team', value: mockLuigiContext.teamId },
        ],
      });
    });

    it('should create context object with only tenant if project and team are missing', () => {
      const contextWithoutProjectAndTeam: NodeContext = {
        ...mockLuigiContext,
        projectId: undefined,
        teamId: undefined,
      };
      const contextObject = GraphqlService['createGraphqlContextObject'](
        contextWithoutProjectAndTeam,
      );
      expect(contextObject).toEqual({
        entries: [{ key: 'tenant', value: mockLuigiContext.tenantid }],
      });
    });

    it('should create context object with tenant and project if team is missing', () => {
      const contextWithoutTeam: NodeContext = {
        ...mockLuigiContext,
        teamId: undefined,
      };
      const contextObject =
        GraphqlService['createGraphqlContextObject'](contextWithoutTeam);
      expect(contextObject).toEqual({
        entries: [
          { key: 'tenant', value: mockLuigiContext.tenantid },
          { key: 'project', value: mockLuigiContext.projectId },
        ],
      });
    });
  });
});
