import { LuigiClient, PmLuigiContextService } from './luigi';
import { NEW_LABEL, ProviderService } from './provider.service';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NotificationService } from '@dxp/ngx-core/notification';
import { DialogService } from '@fundamental-ngx/core';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { mock } from 'jest-mock-extended';
import {
  AccountConnection,
  Label,
  ProviderMetadata,
  ScopeType,
  ServiceInstance,
  ServiceStatus,
} from 'models/index';
import { PROVIDER_INSTANCE_INSTALLED } from 'models/luigi-go-back';
import { MockProvider } from 'ng-mocks';
import { firstValueFrom, of } from 'rxjs';
import { GraphqlService } from 'services/graphql.service';
import { unInstallProviderInstance } from 'state/changing-provider-instances.actions';
import { loadProviders } from 'state/providers.actions';

const extensionClass: ProviderMetadata = {
  configurationMetadata: '',
  displayName: '',
  instance: null,
  isChangingInstallations: false,
  name: '',
  scope: { type: ScopeType.TEAM },
  image: 'test-image',
};

describe('ExtensionService', () => {
  let service: ProviderService;
  let luigiClient: LuigiClient;
  let store: MockStore<unknown>;
  let pmLuigiContextService: PmLuigiContextService;
  let notificationService: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProviderService,
        LuigiClient,
        {
          provide: DialogService,
          useValue: {},
        },
        MockProvider(GraphqlService, {}),
        provideMockStore({}),
        PmLuigiContextService,
        NotificationService,
      ],
    });

    pmLuigiContextService = TestBed.inject(PmLuigiContextService);
    notificationService = TestBed.inject(NotificationService);
    service = TestBed.inject(ProviderService);
    luigiClient = TestBed.inject(LuigiClient);
    store = TestBed.inject(MockStore);
  });

  it('should use the ExtensionService', () => {
    expect(service).toBeDefined();
  });

  describe('openDialogForAddAccountType', () => {
    it('should open proper luigi dialog', async () => {
      //given
      const account: AccountConnection = {
        name: 'name',
        type: {
          name: 'account-type-name',
          context: 'ctx',
        },
      } as AccountConnection;

      luigiClient.linkManager = jest.fn().mockReturnValue({
        withParams: jest.fn().mockReturnValue({
          navigate: jest.fn(),
        }),
        getCurrentRoute: jest
          .fn()
          .mockReturnValue('/projects/con-mi-burrito-sabanero/accounts'),
      });

      // when
      await service.openDialogForAddAccountType(account);

      // then
      expect(luigiClient.linkManager().withParams).toHaveBeenCalledWith({
        type: account.name,
      });

      expect(
        luigiClient.linkManager().withParams({}).navigate,
      ).toHaveBeenCalledWith(
        `/projects/con-mi-burrito-sabanero/${account.type?.name}`,
        undefined,
        true,
        {
          title: $localize`Connect an Account` as string,
          size: 's',
        },
      );
    });
  });

  describe('getIcon', () => {
    it('should fallback to the extension image when no icon is provided', () => {
      const image = service.getIcon(extensionClass);
      expect(image).toBe(extensionClass.image);
    });

    it('should properly return the icon based on the current theme', () => {
      luigiClient.uxManager().getCurrentTheme = jest
        .fn()
        .mockReturnValue('sap_horizon_dark');
      const iconFallbackExtensionClass = {
        ...extensionClass,
        icon: {
          dark: {
            url: 'dark-url',
          },
          light: {
            data: 'light-data',
            url: 'light-url',
          },
        },
      };
      const icon = service.getIcon(iconFallbackExtensionClass);
      expect(icon).toBe(iconFallbackExtensionClass.icon.dark.url);
    });

    it('should fallback to url if no data is provided for a current theme', () => {
      luigiClient.uxManager().getCurrentTheme = jest
        .fn()
        .mockReturnValue('sap_fiori_light');
      const iconFallbackExtensionClass = {
        ...extensionClass,
        icon: {
          dark: {
            url: 'dark-url',
          },
          light: {
            data: 'light-data',
          },
        },
      };
      const icon = service.getIcon(iconFallbackExtensionClass);
      expect(icon).toBe(iconFallbackExtensionClass.icon.light.data);
    });
  });

  it('should properly calculate whether an extension can be installed', () => {
    service.scopeInfo = {
      scopeId: '123456',
      scopeType: ScopeType.PROJECT,
    };

    expect(service.isInstallable(extensionClass)).toBe(true);
    expect(service.isUninstallable(extensionClass)).toBe(false);
  });

  it('should properly calculate whether an extension can be uninstalled', () => {
    service.scopeInfo = {
      scopeId: '123456',
      scopeType: ScopeType.PROJECT,
    };
    const extensionClassScopedInstance = {
      ...extensionClass,
      instance: {
        id: 'test',
        name: 'test-name',
        status: ServiceStatus.READY,
        scope: { type: ScopeType.PROJECT },
        extensionClass,
      },
    } as unknown as ProviderMetadata;
    expect(service.isInstallable(extensionClassScopedInstance)).toBe(false);
    expect(service.isUninstallable(extensionClassScopedInstance)).toBe(true);

    const extensionClassDeletionPrevented = {
      ...extensionClassScopedInstance,
      instance: {
        ...extensionClassScopedInstance.instance,
        scope: { type: ScopeType.TEAM }, // to force testing of deletion prevented condition
        providerData: {
          disableProjectDeletion: 'true',
        },
      },
    } as unknown as ProviderMetadata;

    expect(service.isUninstallable(extensionClassDeletionPrevented)).toBe(
      false,
    );
  });

  describe('buildLabels', () => {
    const MOCK_NOW = '2023-06-27T15:23:56Z';

    it('should return empty array if no labels', () => {
      const result = service.buildLabels(extensionClass);

      expect(result).toEqual([]);
    });

    it('should decide if execution class has new label', () => {
      const cases: [ProviderMetadata, Label[]][] = [
        [
          mock<ProviderMetadata>({
            labels: [],
            creationTimestamp: '2023-06-27T15:23:56Z',
          }),
          [NEW_LABEL],
        ],
        [
          mock<ProviderMetadata>({
            labels: [],
            creationTimestamp: '2023-03-27T15:23:56Z',
          }),
          [NEW_LABEL],
        ],
        [
          mock<ProviderMetadata>({
            labels: [],
            creationTimestamp: '2023-03-26T15:23:56Z',
          }),
          [],
        ],
        [
          mock<ProviderMetadata>({
            labels: [],
            creationTimestamp: '2022-06-27T15:23:56Z',
          }),
          [],
        ],
      ];

      cases.forEach(([elem, expected]) => {
        Date.now = jest.fn().mockReturnValue(new Date(MOCK_NOW).valueOf());

        const result = service.buildLabels(elem);

        expect(result).toEqual(expected);
      });
    });

    it('should return expected ColorCategory for the label', () => {
      const cases: [string, string][] = [
        ['waka', '10'],
        ['%', '8'],
        ['ÖMG', '7'],
        ['ömg', '7'],
        ['', '1'],
        ['beta', '9'],
      ];

      cases.forEach(([title, color]) => {
        const labels = [{ title }] as Label[];

        const result = service.buildLabels({
          ...extensionClass,
          labels,
        });

        expect(result).toEqual([{ title, color }]);
      });
    });
  });

  describe('installExtension', () => {
    it('should throw an error if extension is undefined', () => {
      expect(() => service.installProviderInstance(undefined)).toThrow(
        'Extension is undefined',
      );
    });

    it('should call graphqlService.installExtension with correct input', async () => {
      const extension: ProviderMetadata = {
        ...extensionClass,
        name: 'extName',
        displayName: 'extDisplayName',
        scope: { type: ScopeType.PROJECT },
      };
      const installationData = { foo: 'bar' };
      const expectedInput = {
        installationData,
        extensionClass: {
          id: extension.name,
          scope: extension.scope.type,
        },
        displayName: extension.displayName,
      };

      const graphqlService = TestBed.inject(GraphqlService);
      const spy = jest
        .spyOn(graphqlService, 'installProviderInstance')
        .mockReturnValue(of({ result: 'result' }));

      const result$ = service.installProviderInstance(
        extension,
        installationData,
      );

      expect(spy).toHaveBeenCalledWith(expectedInput);
      await expect(firstValueFrom(result$)).resolves.toEqual({
        result: 'result',
      });
    });
  });

  describe('updateExtension', () => {
    it('should call graphqlService.updateExtensionInstance with correct input', async () => {
      const extension: ProviderMetadata = {
        ...extensionClass,
        name: 'extName',
        displayName: 'extDisplayName',
        scope: { type: ScopeType.PROJECT },
      };

      const extensionInstance: ServiceInstance = {
        id: 'instanceId',
        providerMetadata: extension,
        scope: { type: ScopeType.PROJECT },
        name: 'extensionInstanceName',
        status: ServiceStatus.READY,
      };

      const installationData = { foo: 'bar' };
      const expectedInput = {
        installationData,
        instanceId: extensionInstance.id,
        extensionClass: {
          id: extensionInstance.providerMetadata.name,
          scope: extension.scope.type,
        },
      };

      const graphqlService = TestBed.inject(GraphqlService);
      const spy = jest
        .spyOn(graphqlService, 'updateProviderInstance')
        .mockReturnValue(of({ result: 'updated' }));

      const result$ = service.updateProviderInstance(
        extension,
        extensionInstance,
        installationData,
      );

      expect(spy).toHaveBeenCalledWith(expectedInput);
      await expect(firstValueFrom(result$)).resolves.toEqual({
        result: 'updated',
      });
    });
  });

  describe('uninstallExtension', () => {
    it('should dispatch the correct action', () => {
      const id = '1';
      const mockExtension: ProviderMetadata = {
        ...extensionClass,
        instance: {
          id,
          name: 'name',
          status: ServiceStatus.READY,
          providerMetadata: extensionClass,
          scope: { type: ScopeType.GLOBAL },
        },
      };
      jest.spyOn(store, 'dispatch');

      service.uninstallProviderInstance(mockExtension);

      expect(store.dispatch).toHaveBeenCalledWith(
        unInstallProviderInstance({
          providerInstanceName: id,
          provider: mockExtension,
        }),
      );
    });
  });

  describe('uninstallExtensionDialog', () => {
    it('should not uninstall if decision is DISMISSED', async () => {
      jest
        .spyOn(luigiClient.uxManager(), 'showConfirmationModal')
        .mockRejectedValue(new Error('User closed the modal'));

      jest.spyOn(service, 'uninstallProviderInstance');

      await service.uninstallProviderInstanceDialog(extensionClass);

      expect(service.uninstallProviderInstance).not.toHaveBeenCalled();
    });

    it('should uninstall if decision is CONFIRMED', async () => {
      const mockExtension: ProviderMetadata = {
        ...extensionClass,
        instance: {
          id: '3',
          name: 'name',
          status: ServiceStatus.READY,
          providerMetadata: extensionClass,
          scope: { type: ScopeType.GLOBAL },
        },
      };

      jest
        .spyOn(luigiClient.uxManager(), 'showConfirmationModal')
        .mockResolvedValue(undefined);

      jest.spyOn(service, 'uninstallProviderInstance');

      await service.uninstallProviderInstanceDialog(mockExtension);
      expect(service.uninstallProviderInstance).toHaveBeenCalledWith(
        mockExtension,
      );
    });
  });

  describe('openConfigurationWizard', () => {
    it('should open modal with correct arguments', () => {
      const providerName = 'testClass';
      const providerDisplayName = 'Test Class';
      const scope = ScopeType.PROJECT;
      const modalSize = 'l';

      const openAsModal = jest.fn().mockReturnValue(Promise.resolve());
      const withParams = jest.fn().mockReturnValue({ openAsModal });
      const fromClosestContext = jest.fn().mockReturnValue({ withParams });
      const linkManager = jest.fn().mockReturnValue({ fromClosestContext });

      service.scopeInfo = {
        scopeType: ScopeType.TEAM,
        scopeId: 'id',
      };
      service['luigiClient'].linkManager = linkManager;

      service.openConfigurationWizard(
        providerName,
        providerDisplayName,
        scope,
        modalSize,
      );

      const expectedParams = {
        providerName,
        providerDisplayName,
        scope,
        installableIn: ScopeType.TEAM,
      };

      expect(linkManager).toHaveBeenCalled();
      expect(fromClosestContext).toHaveBeenCalled();
      expect(withParams).toHaveBeenCalledWith(expectedParams);
      expect(openAsModal).toHaveBeenCalledWith('/extension-configuration', {
        size: modalSize,
      });
    });
  });

  describe('navigateToExtensionDetails', () => {
    it('should navigate to extension details with correct arguments', () => {
      const extension: ProviderMetadata = {
        ...extensionClass,
        name: 'test-extension',
      };
      const navigate = jest.fn();
      const fromContext = jest.fn().mockReturnValue({ navigate });
      const linkManager = jest.fn().mockReturnValue({ fromContext });

      service.scopeInfo = {
        scopeType: ScopeType.PROJECT,
        scopeId: 'id',
      };

      service['luigiClient'].linkManager = linkManager;

      service.navigateToProviderDetails(extension);

      expect(linkManager).toHaveBeenCalled();
      expect(fromContext).toHaveBeenCalledWith('project');
      expect(navigate).toHaveBeenCalledWith('test-extension');
    });

    it('should navigate with correct arguments when scopeType is undefined', () => {
      const extension: ProviderMetadata = {
        ...extensionClass,
        name: 'test-extension',
      };
      const navigate = jest.fn();
      const fromContext = jest.fn().mockReturnValue({ navigate });
      const linkManager = jest.fn().mockReturnValue({ fromContext });

      service.scopeInfo = {
        scopeType: undefined as unknown as ScopeType,
        scopeId: 'id',
      };

      service['luigiClient'].linkManager = linkManager;

      service.navigateToProviderDetails(extension);

      expect(linkManager).toHaveBeenCalled();
      expect(fromContext).toHaveBeenCalledWith('');
      expect(navigate).toHaveBeenCalledWith('test-extension');
    });
  });

  describe('handleInstallExtension', () => {
    it('should show toast, clear cache, and dispatch loadExtensionClasses when EXTENSION_INSTALLED event is received', fakeAsync(() => {
      pmLuigiContextService.contextObservable = jest
        .fn()
        .mockReturnValue(
          of({ context: { goBackContext: PROVIDER_INSTANCE_INSTALLED } }),
        );

      const openSuccessToastSpy = jest.spyOn(
        notificationService,
        'openSuccessToast',
      );

      const clearFrameCacheSpy = jest.spyOn(luigiClient, 'clearFrameCache');

      const dispatchSpy = jest.spyOn(store, 'dispatch');

      service['handleInstallProvider']();

      tick();
      expect(openSuccessToastSpy).toHaveBeenCalledWith('Extension Installed');
      expect(clearFrameCacheSpy).toHaveBeenCalled();
      expect(dispatchSpy).toHaveBeenCalledWith(loadProviders());
    }));
  });
});
