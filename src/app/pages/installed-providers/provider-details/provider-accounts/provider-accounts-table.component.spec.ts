import { EditAccountComponent } from './edit-account/edit-account.component';
import { ExtensionAccountsTableComponentPo } from './extension-accounts-table.component.po';
import { ProviderAccountsTableComponent } from './provider-accounts-table.component';
import { RemoveAccountConfirmationComponent } from './remove-account-confirmation/remove-account-confirmation.component';
import { ComponentRef } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FrameContext } from '@dxp/ngx-core/common';
import { GithubService } from '@dxp/ngx-core/github';
import { VerificationType } from '@dxp/ngx-core/provider-verification';
import { luigiContextSelector } from '@dxp/ngx-core/state';
import { MessageBoxService } from '@fundamental-ngx/core';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { mock } from 'jest-mock-extended';
import { CustomResource } from 'models/custom.resource';
import {
  APIResourceConfig,
  APIServerConfig,
  Account,
  AccountConnectionType,
  AccountType,
  ProviderMetadata,
  ProviderWizardConfig,
  ResourceConfig,
  ScopeType,
  ServiceLevel,
  ServiceStatus,
} from 'models/provider-metadata';
import { MockProvider } from 'ng-mocks';
import { EMPTY, Subject, of } from 'rxjs';
import { BtpSecretService, Secret } from 'services/btp-secret-service';
import { IContextMessage, PmLuigiContextService } from 'services/luigi';
import { ProviderService } from 'services/provider.service';
import { customResourceOfCurrentAccount } from 'state/account-resources/account-resources.selectors';
import { selectAccountsPerConnectionTypes } from 'state/accounts.selectors';
import { selectScopeInfo } from 'state/luigi.selectors';

const mockDefaultAccount: Account = {
  id: 'id1',
  displayName: 'displayName1',
  name: '',
  type: {} as AccountType,
  ref: '',
};

const mockResources: CustomResource[] = [
  mock<CustomResource>({
    metadata: { name: 'test-instance', namespace: 'test-namespace' },
    spec: { projectKey: 'DXPFRAME' },
  }),
  mock<CustomResource>({
    metadata: { name: 'test-instance-2', namespace: 'test-namespace-2' },
    spec: { projectKey: 'DXPFRAME2' },
  }),
];

const mockAccounts: Account[] = [
  {
    id: 'id1',
    name: 'id1',
    displayName: 'displayName1',
    type: {
      id: 'github',
      defaultAccount: mockDefaultAccount,
      type: {
        Name: 'github',
      },
      displayName: '',
    },
    ref: '',
  },
  {
    id: 'id2',
    name: 'id2',
    displayName: 'displayName2',
    type: {
      id: 'github',
      defaultAccount: mockDefaultAccount,
      type: {
        Name: 'github',
      },
      displayName: '',
    },
    ref: '',
  },
  {
    id: 'id3',
    name: 'id3',
    displayName: 'displayName3',
    type: {
      id: 'github',
      defaultAccount: mockDefaultAccount,
      type: {
        Name: 'github',
      },
      displayName: '',
    },
    ref: '',
  },
];

const mockExtensionClassWithoutApiResources: ProviderMetadata = {
  name: 'dxp-github-ui',
  displayName: 'GitHub',
  image: '',
  configurationMetadata: '',
  serviceLevel: ServiceLevel.Low,
  scope: {
    type: ScopeType.GLOBAL,
  },
  instance: {
    id: 'dxp-github-ui',
    name: 'Github',
    installationData: {
      skipOnboardingCard: 'true',
    },
    providerData: {
      githubAccountAdded: 'true',
    },
    isMandatoryExtension: true,
    providerMetadata: {
      name: 'dxp-github-ui',
      category: 'Source Code Management',
      displayName: 'GitHub',
      image: '',
      scope: {
        type: ScopeType.GLOBAL,
      },
      configurationMetadata: '',
      instance: null,
      isChangingInstallations: false,
    },
    status: ServiceStatus.READY,
    scope: {
      type: ScopeType.PROJECT,
    },
    serviceInstanceStatus: undefined,
  },
  wizardConfig: {
    name: 'github-wizard-configuration',
    configData: '',
    wizardDefinition: '',
  },
  accountConnections: [
    {
      description: '',
      displayName: 'GitHub',
      name: 'github',
      image: { url: '' },
      type: {
        context: 'not-used',
        name: 'github',
        apiResourceConfig: undefined as unknown as APIResourceConfig,
      },
    },
  ],
  verification: {
    type: VerificationType.Hyperspace,
  },
  isChangingInstallations: false,
};

const mockExtensionClassWithApiResources: ProviderMetadata = {
  name: 'dxp-github-ui',
  displayName: 'GitHub',
  description: '',
  image: '',
  configurationMetadata: '',
  serviceLevel: ServiceLevel.Low,
  scope: {
    type: ScopeType.GLOBAL,
  },
  instance: {
    id: 'dxp-github-ui',
    name: 'Github',
    installationData: {
      skipOnboardingCard: 'true',
    },
    providerData: {
      githubAccountAdded: 'true',
    },
    isMandatoryExtension: true,
    providerMetadata: {
      name: 'dxp-github-ui',
      category: 'Source Code Management',
      displayName: 'GitHub',
      image: '',
      icon: undefined,
      scope: {
        type: ScopeType.GLOBAL,
      },
      configurationMetadata: '',
      instance: null,
      isChangingInstallations: false,
    },
    status: ServiceStatus.READY,
    scope: {
      type: ScopeType.PROJECT,
    },
    serviceInstanceStatus: undefined,
  },
  wizardConfig: {
    name: 'github-wizard-configuration',
    configData: '',
    wizardDefinition: '',
  },
  accountConnections: [
    {
      description: '',
      displayName: 'Account Connection Display Name',
      name: 'name',
      image: { url: '' },
      type: {
        context: '',
        name: 'name',
        apiResourceConfig: {
          wizardConfig: {} as ProviderWizardConfig,
          displayConfig: {
            apiServerConfig: {} as APIServerConfig,
            resourceConfig: {} as ResourceConfig,
            tableConfig: {
              columns: [
                {
                  name: 'project-key',
                  label: 'Project Key',
                  dataPath: '.spec.projectKey',
                  link: {
                    target: '_blank',
                    urlPath: '.status.projectUrl',
                    url: 'url',
                  },
                },
                {
                  name: 'instance',
                  label: 'Instance',
                  dataPath: '.spec.instance',
                },
              ],
              messageStrip: [
                {
                  type: 'error',
                  text: 'Dummy message strip',
                  noIcon: false,
                  dismissible: false,
                },
              ],
            },
            accountNamingConfig: {
              singular: '',
              plural: '',
            },
          },
        },
      },
    },
  ],
  verification: {
    type: VerificationType.Hyperspace,
  },
  isChangingInstallations: false,
};

const providerAdminContext = mock<IContextMessage>({
  context: {
    projectId: 'projectId',
    entityContext: {
      project: {
        type: 'Type',
        policies: ['providerAdmin'],
      },
    },
  },
});

const nonExtensionAdminContext = mock<IContextMessage>({
  context: {
    projectId: 'projectId',
    entityContext: {
      project: {
        type: 'Type',
        policies: [''],
      },
    },
  },
});

describe('ExtensionAccountsTableComponent', () => {
  let component: ProviderAccountsTableComponent;
  let fixture: ComponentFixture<ProviderAccountsTableComponent>;
  let mockStore: MockStore<unknown>;
  let mockMessageBoxService: MessageBoxService;
  let componentRef: ComponentRef<ProviderAccountsTableComponent>;
  let extensionAccountsTablePo: ExtensionAccountsTableComponentPo;
  let luigiContextSubject: Subject<IContextMessage>;

  const mockBtpSecrets = [
    { path: 'secret1', metadata: {} } as Secret,
    { path: 'secret2', metadata: {} } as Secret,
  ];

  beforeEach(async () => {
    luigiContextSubject = new Subject();

    await TestBed.configureTestingModule({
      providers: [
        provideMockStore({
          selectors: [
            {
              selector: selectAccountsPerConnectionTypes,
              value: mockAccounts,
            },
            {
              selector: customResourceOfCurrentAccount,
              value: mockResources,
            },
            {
              selector: luigiContextSelector,
              value: {
                teamId: 'team-1',
                entityContext: {
                  team: {
                    policies: ['iamMember'],
                  },
                },
              },
            },
          ],
        }),
        MockProvider(GithubService, {
          getGithubAppRegistrations: () => EMPTY,
        }),
        MockProvider(BtpSecretService, {
          getBTPSecrets: () => of(mockBtpSecrets), // <-- emit mock secrets
        }),
        MessageBoxService,
        MockProvider(ProviderService, {}),
        MockProvider(PmLuigiContextService, {
          contextObservable: () => luigiContextSubject,
        }),
        provideNoopAnimations(),
      ],
      imports: [ProviderAccountsTableComponent],
    }).compileComponents();

    mockStore = TestBed.inject(MockStore);

    mockMessageBoxService = TestBed.inject(MessageBoxService);

    fixture = TestBed.createComponent(ProviderAccountsTableComponent);
    component = fixture.componentInstance;

    componentRef = fixture.componentRef;
    componentRef.setInput('extension', mockExtensionClassWithoutApiResources);

    extensionAccountsTablePo = new ExtensionAccountsTableComponentPo(
      fixture.nativeElement,
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('addAccount', () => {
    it('should dispatch openAccountResourceCreationDialog if hasApiResourcesAccConnectionType is true', async () => {
      jest
        .spyOn(component, 'hasApiResourcesAccConnectionType')
        .mockReturnValue(true);

      jest.spyOn(component, 'findAccountConnection').mockReturnValue({
        description: '',
        displayName: '',
        name: '',
        image: {
          url: '',
        },
        type: {} as AccountConnectionType,
      });

      const dispatchSpy = jest.spyOn(mockStore, 'dispatch');

      await component.addAccount({
        description: '',
        displayName: '',
        name: '',
        image: {
          url: '',
        },
        type: {} as AccountConnectionType,
      });

      expect(dispatchSpy).toHaveBeenCalled();
    });

    it('should throw an error when account is undefined', async () => {
      jest
        .spyOn(component, 'hasApiResourcesAccConnectionType')
        .mockReturnValue(false);

      await expect(async () => {
        await component.addAccount(undefined);
      }).rejects.toThrow('AccountConnection is required');
    });

    it('should call openDialogForAddAccountType when hasApiResourcesAccConnectionType is false', async () => {
      jest
        .spyOn(component, 'hasApiResourcesAccConnectionType')
        .mockReturnValue(true);
      componentRef.setInput('extension', {
        ...mockExtensionClassWithoutApiResources,
        accountConnections: undefined,
      });

      fixture.detectChanges();

      const account = {
        description: '',
        displayName: '',
        name: '',
        image: {
          url: '',
        },
        type: {} as AccountConnectionType,
      };

      const openDialogSpy = jest.spyOn(
        TestBed.inject(ProviderService),
        'openDialogForAddAccountType',
      );

      await component.addAccount(account);

      expect(openDialogSpy).toHaveBeenCalledWith(account);
    });
  });

  describe('removeAccount', () => {
    it('should open RemoveAccountConfirmationComponent', () => {
      const account = { type: { id: '1' } } as Account;
      component.accountsPerType = { '1': [account] };

      const openSpy = jest.spyOn(mockMessageBoxService, 'open');

      component.removeAccount(account);

      expect(openSpy).toHaveBeenCalledWith(
        RemoveAccountConfirmationComponent,
        expect.objectContaining({
          data: {
            currentAccount: account,
            allAccounts: [account],
          },
        }),
      );
    });
  });

  describe('editAccount', () => {
    it('should open EditAccountComponent', () => {
      const account = { type: { id: '1' } } as Account;

      const openSpy = jest.spyOn(mockMessageBoxService, 'open');

      component.editAccount(account);

      expect(openSpy).toHaveBeenCalledWith(
        EditAccountComponent,
        expect.objectContaining({
          data: account,
        }),
      );
    });
  });

  describe('scopeTypeText initialization', () => {
    interface TestCase {
      description: string;
      scopeType: ScopeType;
      scopeId: string;
      expectedText: string;
    }

    const testCases: TestCase[] = [
      {
        description: 'should set empty scopeTypeText for invalid',
        scopeType: 'invalidType' as unknown as ScopeType,
        scopeId: 'scopeId',
        expectedText: '',
      },
      {
        description: 'should set correct scopeTypeText for team',
        scopeType: ScopeType.TEAM,
        scopeId: 'scopeId',
        expectedText: 'Team',
      },
      {
        description: 'should set correct scopeTypeText for project',
        scopeType: ScopeType.PROJECT,
        scopeId: 'scopeId',
        expectedText: 'Product/Experiment',
      },
    ];

    it.each(testCases)(
      '$description',
      fakeAsync(({ scopeType, expectedText }: TestCase) => {
        mockStore.overrideSelector(selectScopeInfo, {
          scopeId: 'scopeId',
          scopeType,
        });
        mockStore.refreshState();
        fixture.detectChanges();

        let result: string | undefined;
        component.scopeTypeText.subscribe((value) => (result = value));
        tick();
        expect(result).toBe(expectedText);
      }),
    );
  });

  describe('showAddAccountMessage', () => {
    it('should return true when conditions are met', () => {
      jest.spyOn(component, 'hasNoAccountsAdded').mockReturnValue(true);
      jest
        .spyOn(component, 'hasApiResourcesAccConnectionType')
        .mockReturnValue(false);

      const result = component.showAddAccountMessage(false, true);

      expect(result).toBe(true);
    });
  });

  describe('Integration tests', () => {
    describe('extension class without api resources - GitHub table', () => {
      beforeEach(() => {
        mockStore.overrideSelector(
          selectAccountsPerConnectionTypes,
          mockAccounts,
        );
        mockStore.refreshState();
        fixture.detectChanges();
      });

      it('should show table and correct title', () => {
        fixture.detectChanges();

        const table = extensionAccountsTablePo.table;
        expect(table).toBeTruthy();

        const tableTitle = extensionAccountsTablePo.tableTitle;
        expect(tableTitle).toBeTruthy();

        expect(extensionAccountsTablePo.getTextContent(tableTitle)).toBe(
          'Organizations (3)',
        );
      });

      it('should show correct table headers', () => {
        fixture.detectChanges();

        const tableColumns = extensionAccountsTablePo.tableColumns;
        expect(tableColumns.length).toBe(3);

        const expectedColumnNames = ['Organization', 'Host', ''];
        extensionAccountsTablePo.tableColumns.forEach((column, index) => {
          expect(extensionAccountsTablePo.getTextContent(column)).toBe(
            expectedColumnNames[index],
          );
        });
      });

      it('should show correct table data', () => {
        fixture.detectChanges();

        const tableRows = extensionAccountsTablePo.tableRows;
        expect(tableRows.length).toBe(mockAccounts.length);

        extensionAccountsTablePo
          .getTableData('organization')
          .forEach((el, index) => {
            const name = extensionAccountsTablePo.getTextContent(
              el.querySelector<HTMLElement>('a'),
            );

            expect(name).toBe(mockAccounts[index].displayName);
          });
      });

      it('should show correct default account', () => {
        fixture.detectChanges();

        const defaultAccount =
          extensionAccountsTablePo.getTableData('organization')[0];

        const defaultAccountInfoLabel =
          defaultAccount.querySelector('[title="default"]');
        expect(defaultAccountInfoLabel).toBeTruthy();
      });

      it('should show global add action button', async () => {
        const globalAddButton = extensionAccountsTablePo.globalAddButton;

        expect(globalAddButton).toBeTruthy();
      });

      it('should show default actions for extension admins', () => {
        luigiContextSubject.next(providerAdminContext);
        fixture.detectChanges();

        const accountDisplayName = mockAccounts[0].displayName;

        const editAction =
          extensionAccountsTablePo.getEditAction(accountDisplayName);
        expect(editAction).toBeTruthy();

        const deleteAction =
          extensionAccountsTablePo.getDeleteAction(accountDisplayName);
        expect(deleteAction).toBeTruthy();
      });

      it('should not show default actions for non-admins', () => {
        luigiContextSubject.next(nonExtensionAdminContext);
        fixture.detectChanges();

        const accountDisplayName = mockAccounts[0].displayName;

        const editAction =
          extensionAccountsTablePo.getEditAction(accountDisplayName);
        expect(editAction).toBeFalsy();

        const deleteAction =
          extensionAccountsTablePo.getDeleteAction(accountDisplayName);
        expect(deleteAction).toBeFalsy();
      });

      it('should not show the table for non project members', () => {
        mockStore.overrideSelector(luigiContextSelector, {
          teamId: 'team-1',
          entityContext: {
            team: {
              policies: [''],
            },
          },
          token: '',
          userid: '',
          tenantid: '',
          frameContext: {} as FrameContext,
          serviceProviderConfig: {},
          parentNavigationContexts: [],
        });
        mockStore.refreshState();
        fixture.detectChanges();

        const table = extensionAccountsTablePo.table;
        expect(table).toBeFalsy();

        const illustrationMessage =
          extensionAccountsTablePo.illustrationMessage;
        expect(illustrationMessage).toBeTruthy();

        expect(
          extensionAccountsTablePo.getTextContent(
            extensionAccountsTablePo.illustrationMessage?.querySelector(
              '.fd-illustrated-message__title',
            ) ?? null,
          ),
        ).toContain('You need to be member of this');
      });
    });

    describe('extension class with api resources', () => {
      beforeEach(() => {
        componentRef = fixture.componentRef;
        componentRef.setInput('extension', mockExtensionClassWithApiResources);

        fixture.detectChanges();
      });

      it('should show message strip', () => {
        const messageStrip = extensionAccountsTablePo.messageStrip;
        expect(messageStrip).toBeTruthy();

        const expectedText =
          mockExtensionClassWithApiResources.accountConnections?.[0]?.type
            ?.apiResourceConfig?.displayConfig?.tableConfig?.messageStrip?.[0]
            ?.text;

        expect(extensionAccountsTablePo.getTextContent(messageStrip)).toBe(
          expectedText,
        );
      });

      it('should show extension account resources table', () => {
        const extensionAccountResourcesTable =
          extensionAccountsTablePo.extensionAccountResourcesTable;

        expect(extensionAccountResourcesTable).toBeTruthy();
      });
    });
  });

  describe('ngOnInit for dxp-btp-accounts-ui', () => {
    it('should process BTP secrets and set accountsPerType and accountTypes', () => {
      const btpPrefix = 'GROUP-SECRETS/btp-accounts-';
      const secrets: Secret[] = [
        {
          path: 'GROUP-SECRETS/btp-accounts-account1',
          metadata: {
            scopes: '',
          },
        },
        {
          path: 'GROUP-SECRETS/btp-accounts-account2',
          metadata: {
            scopes: '',
          },
        },
        {
          path: 'other/account3',
          metadata: {
            scopes: '',
          },
        },
      ];
      const fakeAccount1 = { type: { id: 'id1' } };
      const fakeAccount2 = { type: { id: 'id2' } };

      componentRef.setInput('extension', {
        name: 'dxp-btp-accounts-ui',
      });

      // Mock BTPPREFIX
      const btpSecretService: BtpSecretService =
        TestBed.inject(BtpSecretService);
      btpSecretService.BTPPREFIX = btpPrefix;

      jest
        .spyOn(component['btpSecretService'], 'getBTPSecrets')
        .mockReturnValue(of(secrets));

      btpSecretService.getBTPSecrets = jest.fn().mockReturnValue(of(secrets));

      btpSecretService.createBTPAccount = jest
        .fn()
        .mockImplementation((secretPath: string) => {
          if (secretPath === 'account1') return fakeAccount1;
          if (secretPath === 'account2') return fakeAccount2;
          return null;
        });

      fixture.detectChanges();
      component.ngOnInit();

      expect(component.accountsPerType).toEqual({
        id1: [fakeAccount1],
        id2: [fakeAccount2],
      });

      expect(component.accountTypes).toEqual(
        expect.objectContaining({
          id1: fakeAccount1.type,
          id2: fakeAccount2.type,
        }),
      );
    });
  });
});
