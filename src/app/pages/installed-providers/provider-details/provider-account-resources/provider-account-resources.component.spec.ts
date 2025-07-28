import { ExtensionAccountResourcesComponentPo } from './extension-account-resources.component.po';
import { ProviderAccountResourcesComponent } from './provider-account-resources.component';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import {
  APIServerConfig,
  ResourceConfig,
} from '@dxp/ngx-core/automaticd-api-resources/interfaces';
import {
  TableConfig as TableGeneratorConfig,
  ToolbarConfig,
} from '@dxp/ngx-core/table-generator';
import { ConfirmationModalSettings } from '@luigi-project/client';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { mock } from 'jest-mock-extended';
import { CustomResource } from 'models/custom.resource';
import { ConfirmationDialogDecision } from 'models/dialog';
import {
  AccountConnection,
  ActionsConfig,
  ColumnConfig,
  LinkConfig,
  ProviderMetadata,
  ProviderWizardConfig,
  ScopeType,
  TableConfig,
} from 'models/index';
import { MockProvider } from 'ng-mocks';
import { Subject, of } from 'rxjs';
import {
  IContextMessage,
  LuigiClient,
  PmLuigiContextService,
} from 'services/luigi';
import { AccountNamingService } from 'state/account-naming/account-naming.service';
import {
  deleteAccountResource,
  openAccountResourceEditDialog,
  patchAccountResource,
} from 'state/account-resources/account-resources-edit.action';
import { customResourceOfCurrentAccount } from 'state/account-resources/account-resources.selectors';
import { selectSelectedProvider } from 'state/detail-view.selectors';

interface TestCase {
  description: string;
  resource: CustomResource;
  dataPath: string;
  expected: unknown;
}

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

const mockAccountConnection: AccountConnection = {
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
          messageStrip: [],
        },
        accountNamingConfig: {
          singular: 'Backlog project',
          plural: 'Backlog projects',
        },
      },
    },
  },
};

const mockExtensionClass: ProviderMetadata = {
  name: 'testextension',
  displayName: 'TestExtension',
  scope: { type: ScopeType.COMPONENT },
  configurationMetadata: '',
  instance: null,
  isChangingInstallations: false,
};

const context = mock<IContextMessage>({
  context: {
    projectId: 'projectId',
    entityContext: {
      project: {
        type: 'Type',
        policies: ['projectAdmin'],
      },
    },
  },
});

describe('ExtensionAccountResourcesComponent', () => {
  let component: ProviderAccountResourcesComponent;
  let store: MockStore<unknown>;
  let fixture: ComponentFixture<ProviderAccountResourcesComponent>;
  let extensionAccountResourcesPo: ExtensionAccountResourcesComponentPo;
  let luigiContextSubject: Subject<IContextMessage>;

  beforeEach(async () => {
    luigiContextSubject = new Subject();

    await TestBed.configureTestingModule({
      providers: [
        provideMockStore(),
        {
          provide: LuigiClient,
          useValue: {
            uxManager: () => ({
              showConfirmationModal: jest.fn().mockResolvedValue(true),
            }),
          },
        },
        AccountNamingService,
        MockProvider(PmLuigiContextService, {
          contextObservable: () => luigiContextSubject,
        }),
      ],
      imports: [ProviderAccountResourcesComponent],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(customResourceOfCurrentAccount, mockResources);
    store.overrideSelector(selectSelectedProvider, mockExtensionClass);

    fixture = TestBed.createComponent(ProviderAccountResourcesComponent);
    component = fixture.componentInstance;
    extensionAccountResourcesPo = new ExtensionAccountResourcesComponentPo(
      fixture.nativeElement,
    );

    component.accountConnection = mockAccountConnection;
    fixture.detectChanges();
  });

  describe('generateObjectKey', () => {
    const testCases: [string, string][] = [
      ['.spec', 'spec'],
      ['.spec.project', 'specProject'],
      ['spec.project', 'specProject'],
      ['.Spec.project', 'specProject'],
      ['.status.url.path', 'statusUrlPath'],
      ['', ''],
    ];

    test.each(testCases)(
      'should generate object key "%s" as "%s"',
      (path, expectedObjectKey) => {
        const objectKey = component.generateObjectKey(path);
        expect(objectKey).toBe(expectedObjectKey);
      },
    );
  });

  describe('mapApiResourceTableData', () => {
    it('should return an empty array when account-resources is empty', () => {
      const result = component.mapApiResourceTableData([], { columns: [] });
      expect(result).toEqual([]);
    });

    it('should correctly map table data with one resource', () => {
      const resources: CustomResource[] = [
        mock<CustomResource>({
          metadata: {
            name: 'test-instance',
          },
          spec: {
            instance: 'jira.tools.sap',
            projectKey: 'DXPFRAME',
            installationData: {
              pipeline: 'pipeline',
            },
          },
          status: {
            any: 'good',
          },
        }),
      ];
      const tableConfig: TableConfig = {
        columns: [
          {
            name: 'project-key',
            label: 'Project Key',
            dataPath: '.spec.projectKey',
          },
          {
            name: 'instance',
            label: 'Instance',
            dataPath: '.spec.instance',
          },
          {
            name: 'status',
            label: 'Status',
            dataPath: '.status.any',
          },
          {
            name: 'pipeline',
            label: 'Pipeline',
            dataPath: '.spec.installationData.pipeline',
          },
        ],
      };

      const expectedResult = [
        {
          metadataName: 'test-instance',
          specInstance: 'jira.tools.sap',
          specProjectKey: 'DXPFRAME',
          statusAny: 'good',
          specInstallationDataPipeline: 'pipeline',
        },
      ];

      const result = component.mapApiResourceTableData(resources, tableConfig);
      expect(result).toEqual(expectedResult);
    });

    it('should correctly map table fields when the resource has the same key in different path', () => {
      const resources = [
        mock<CustomResource>({
          metadata: {
            name: 'test-instance',
          },
          spec: {
            instance: 'jira.tools.sap',
          },
          status: {
            instance: 'good',
          },
        }),
      ];
      const tableConfig: TableConfig = {
        columns: [
          {
            name: 'instance',
            label: 'Instance',
            dataPath: '.spec.instance',
          },
          {
            name: 'instance-status',
            label: 'Instance Status',
            dataPath: '.status.instance',
          },
        ],
      };

      const expectedResult = [
        {
          metadataName: 'test-instance',
          specInstance: 'jira.tools.sap',
          statusInstance: 'good',
        },
      ];

      const result = component.mapApiResourceTableData(resources, tableConfig);
      expect(result).toEqual(expectedResult);
    });

    it('should correctly map data when having link', () => {
      const resources = [
        mock<CustomResource>({
          metadata: {
            name: 'test-instance',
          },
          spec: {
            projectKey: 'DXPFRAME',
            instance: 'jira',
            instanceUrl: 'https://instance.com',
            owner: 'superman',
          },
          status: {
            projectUrl: 'https://project.com',
          },
        }),
      ];
      const tableConfig: TableConfig = {
        columns: [
          {
            name: 'project-key',
            label: 'Project Key',
            dataPath: '.spec.projectKey',
            link: {
              target: '_blank',
              urlPath: '.status.projectUrl',
            },
          },
          {
            name: 'instance-key',
            label: 'Instance',
            dataPath: '.spec.instance',
            link: {
              target: '_blank',
              urlPath: '.spec.instanceUrl',
            },
          },
          {
            name: 'owner',
            label: 'Owner',
            dataPath: '.spec.owner',
            link: {
              target: '_blank',
              url: 'http://sap.owner.com',
            },
          },
        ],
      };

      const expectedResult = [
        {
          metadataName: 'test-instance',
          specProjectKey: 'DXPFRAME',
          specProjectKeyUrl: 'https://project.com',
          specProjectKeyUrlTarget: '_blank',
          specInstance: 'jira',
          specInstanceUrl: 'https://instance.com',
          specInstanceUrlTarget: '_blank',
          specOwner: 'superman',
          specOwnerUrl: 'http://sap.owner.com',
          specOwnerUrlTarget: '_blank',
        },
      ];

      const result = component.mapApiResourceTableData(resources, tableConfig);
      expect(result).toEqual(expectedResult);
    });

    it('should include metadataName in the result', () => {
      const resources: CustomResource[] = [
        mock<CustomResource>({
          metadata: { name: 'test-instance', namespace: 'test-namespace' },
          spec: { projectKey: 'DXPFRAME' },
        }),
      ];
      const tableConfig: TableConfig = {
        columns: [
          { name: 'name', label: 'Name', dataPath: '.metadata.name' },
          {
            name: 'namespace',
            label: 'Namespace',
            dataPath: '.metadata.namespace',
          },
          {
            name: 'project-key',
            label: 'Project Key',
            dataPath: '.spec.projectKey',
          },
        ],
      };

      const result = component.mapApiResourceTableData(resources, tableConfig);

      expect(result[0].metadataName).toBe('test-instance');
    });
  });

  describe('ngOnInit', () => {
    it('should initialize table and load resources', () => {
      store.select = jest.fn().mockReturnValue(of(true));
      store.dispatch = jest.fn();
      component['initializeTable'] = jest.fn();
      component.ngOnInit();

      expect(store.dispatch).toHaveBeenCalled();
      expect(component['initializeTable']).toHaveBeenCalled();
    });
  });

  describe('addActions', () => {
    it('should add custom actions to tableConfig', () => {
      const tableConfig = { actions: [], columns: [] } as TableGeneratorConfig;
      const actionsConfig = {
        additionalActions: [
          {
            id: 'custom',
            glyph: 'custom',
            displayName: 'Custom Action',
            confirmationPopup: {
              type: 'warning',
              title: 'Confirm',
              text: 'Are you sure?',
              acceptButton: 'Yes',
              cancelButton: 'No',
            },
            condition: '',
          },
        ],
      } as ActionsConfig;

      component['addActions'](tableConfig, actionsConfig);

      expect(tableConfig.actions!.length).toBe(1);
      expect(tableConfig.actions![0].id).toBe('custom');
    });

    it('should open action confirmation dialog and dispatch patchAccountResource when confirmed', fakeAsync(() => {
      const tableConfig = { actions: [], columns: [] } as TableGeneratorConfig;
      const actionsConfig = {
        additionalActions: [
          {
            id: 'custom',
            glyph: 'custom',
            displayName: 'Custom Action',
            executionPayload: {
              payload: 'customPayload',
            },
            confirmationPopup: {
              type: 'warning',
              title: 'Confirm',
              text: 'Are you sure?',
              acceptButton: 'Yes',
              cancelButton: 'No',
            },
            condition: '',
            actionSuccessMessage: 'Custom action executed successfully',
          },
        ],
      } as ActionsConfig;

      component['addActions'](tableConfig, actionsConfig);

      const openDialogSpy = jest.spyOn(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component as any,
        'openConfirmationDialog',
      );

      jest
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(component as any, 'showConfirmationModal')
        .mockReturnValue(Promise.resolve(ConfirmationDialogDecision.CONFIRMED));

      const dispatchSpy = jest.spyOn(store, 'dispatch');

      const action = tableConfig.actions![0];
      const item = { metadataName: 'foo' };

      action.callback(item);
      tick();

      expect(openDialogSpy).toHaveBeenCalledWith(
        {
          type: 'warning',
          header: 'Confirm',
          body: 'Are you sure?',
          buttonConfirm: 'Yes',
          buttonDismiss: 'No',
        },
        expect.any(Function),
      );

      expect(dispatchSpy).toHaveBeenCalledWith(
        patchAccountResource({
          accountConnection: mockAccountConnection,
          resourceName: item.metadataName,
          payload: 'customPayload',
          successMessage: 'Custom action executed successfully',
        }),
      );
    }));

    it('should dispatch action without opening action confirmation dialog when it is not defined', fakeAsync(() => {
      const tableConfig = { actions: [], columns: [] } as TableGeneratorConfig;
      const actionsConfig = {
        additionalActions: [
          {
            id: 'custom',
            glyph: 'custom',
            displayName: 'Custom Action',
            executionPayload: {
              payload: 'customPayload',
            },
            condition: '',
            actionSuccessMessage: 'Custom action executed successfully',
          },
        ],
      } as ActionsConfig;

      component['addActions'](tableConfig, actionsConfig);

      const openDialogSpy = jest.spyOn(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component as any,
        'openConfirmationDialog',
      );

      const dispatchSpy = jest.spyOn(store, 'dispatch');

      const action = tableConfig.actions![0];
      const item = { metadataName: 'foo' };

      action.callback(item);
      tick();

      expect(openDialogSpy).not.toHaveBeenCalled();

      expect(dispatchSpy).toHaveBeenCalledWith(
        patchAccountResource({
          accountConnection: mockAccountConnection,
          resourceName: item.metadataName,
          payload: 'customPayload',
          successMessage: 'Custom action executed successfully',
        }),
      );
    }));
  });

  describe('addDefaultActions', () => {
    it('should add default actions to tableConfig', () => {
      const tableConfig = { actions: [], columns: [] } as TableGeneratorConfig;
      const actionsConfig = {} as ActionsConfig;

      component['addDefaultActions'](tableConfig, actionsConfig);
      expect(tableConfig.actions!.length).toBe(2);
      const expectedActions = [
        {
          id: 'edit',
          glyph: 'edit',
          label: 'Edit',
          requiredPolicies: ['projectAdmin'],
          callback: expect.any(Function),
        },
        {
          id: 'delete',
          glyph: 'delete',
          label: 'Delete',
          requiredPolicies: ['projectAdmin'],
          callback: expect.any(Function),
        },
      ];
      expect(tableConfig.actions).toEqual(expectedActions);
    });

    it('should override default actions of tableConfig', () => {
      const tableConfig = { actions: [], columns: [] } as TableGeneratorConfig;
      const actionsConfig = {
        additionalActions: [
          {
            id: 'edit',
            glyph: 'edit-new',
            displayName: 'Edit New',
            condition: '',
          },
          {
            id: 'delete',
            glyph: 'delete-new',
            displayName: 'Delete New',
            label: 'Delete New',
            condition: 'deleteCondition',
          },
        ],
      } as ActionsConfig;

      component['addDefaultActions'](tableConfig, actionsConfig);

      const expectedActions = [
        {
          id: 'edit',
          glyph: 'edit-new',
          label: 'Edit',
          requiredPolicies: ['projectAdmin'],
          callback: expect.any(Function),
          displayName: 'Edit New',
          condition: '',
        },
        {
          id: 'delete',
          glyph: 'delete-new',
          label: 'Delete New',
          displayName: 'Delete New',
          condition: 'deleteCondition',
          requiredPolicies: ['projectAdmin'],
          callback: expect.any(Function),
        },
      ];

      expect(tableConfig.actions!.length).toBe(2);
      expect(tableConfig.actions).toEqual(expectedActions);
    });
  });

  describe('initializeTable', () => {
    it('should initialize table with given resources', () => {
      const resources: CustomResource[] = [
        {
          metadata: {
            name: 'test-instance',
          },
          spec: {
            instance: 'jira.tools.sap',
            projectKey: 'DXPFRAME',
          },
          status: {
            any: 'good',
          },
        },
      ];
      component.accountConnection = {
        type: {
          apiResourceConfig: {
            displayConfig: {
              tableConfig: {
                columns: [
                  {
                    name: 'project-key',
                    label: 'Project Key',
                    dataPath: '.spec.projectKey',
                  },
                  {
                    name: 'instance',
                    label: 'Instance',
                    dataPath: '.spec.instance',
                  },
                ],
              },
            },
          },
        },
        displayName: 'Test Account',
      } as AccountConnection;

      component['initializeTable'](resources);

      expect(component.tableConfig.columns.length).toBe(2);
      expect(component?.data?.length).toBe(1);
    });
  });

  describe('mapApiResource', () => {
    const baseResource: CustomResource = {
      metadata: {
        name: 'test-instance',
      },
      spec: {
        instance: 'jira.tools.sap',
        projectKey: 'DXPFRAME',
      },
      status: {
        any: 'good',
        tooltip: 'Status tooltip message',
      },
    };

    const testCases = [
      {
        description: 'should map API resource correctly',
        resource: baseResource,
        tableConfig: {
          columns: [
            {
              name: 'project-key',
              label: 'Project Key',
              dataPath: '.spec.projectKey',
            },
            {
              name: 'instance',
              label: 'Instance',
              dataPath: '.spec.instance',
            },
          ],
        },
        expected: {
          metadataName: 'test-instance',
          specProjectKey: 'DXPFRAME',
          specInstance: 'jira.tools.sap',
        },
      },
      {
        description:
          'should map API resource with column status tooltipDataPath correctly',
        resource: baseResource,
        tableConfig: {
          columns: [
            {
              name: 'status',
              label: 'Status',
              dataPath: '.status.any',
              status: {
                mapping: {
                  critical: ['criticalStatus'],
                  default: ['defaultStatus'],
                  positive: ['positiveStatus'],
                  negative: ['negativeStatus'],
                  informative: ['informativeStatus'],
                },
                tooltipDataPath: '.status.tooltip',
                tooltipDefaultMessage: 'Default status message',
              },
            },
            {
              name: 'project-key',
              label: 'Project Key',
              dataPath: '.spec.projectKey',
            },
            {
              name: 'instance',
              label: 'Instance',
              dataPath: '.spec.instance',
            },
          ],
        },
        expected: {
          metadataName: 'test-instance',
          specInstance: 'jira.tools.sap',
          specProjectKey: 'DXPFRAME',
          statusAny: 'good',
          statusTooltip: 'Status tooltip message',
        },
      },
      {
        description:
          'should map API resource with column status with invalid tooltipDataPath and valid tooltipDefaultMessage correctly',
        resource: baseResource,
        tableConfig: {
          columns: [
            {
              name: 'status',
              label: 'Status',
              dataPath: '.status.any',
              status: {
                mapping: {
                  critical: ['criticalStatus'],
                  default: ['defaultStatus'],
                  positive: ['positiveStatus'],
                  negative: ['negativeStatus'],
                  informative: ['informativeStatus'],
                },
                tooltipDataPath: '.status.invalidTooltip',
                tooltipDefaultMessage: 'Default status message',
              },
            },
            {
              name: 'instance',
              label: 'Instance',
              dataPath: '.spec.instance',
            },
          ],
        },
        expected: {
          metadataName: 'test-instance',
          specInstance: 'jira.tools.sap',
          statusAny: 'good',
          statusInvalidTooltip: 'Default status message',
        },
      },
      {
        description: 'should map empty API resource correctly',
        resource: baseResource,
        tableConfig: undefined,
        expected: {},
      },
    ];

    test.each(testCases)(
      '$description',
      ({ resource, tableConfig, expected }) => {
        const result = component['mapApiResource'](resource, tableConfig);
        expect(result).toEqual(expected);
      },
    );
  });

  describe('enrichWithLink', () => {
    it('should enrich table item with link', () => {
      const resource: CustomResource = {
        metadata: {
          name: 'test-instance',
        },
        spec: {
          projectKey: 'DXPFRAME',
        },
        status: {
          projectUrl: 'https://project.com',
        },
      };
      const columnLink: LinkConfig = {
        target: '_blank',
        urlPath: '.status.projectUrl',
      };
      const tableItem = {
        specProjectKey: 'DXPFRAME',
      };

      const result = component['enrichWithLink'](
        resource,
        columnLink,
        'specProjectKey',
        tableItem,
      );

      expect(result).toEqual({
        specProjectKey: 'DXPFRAME',
        specProjectKeyUrl: 'https://project.com',
        specProjectKeyUrlTarget: '_blank',
      });
    });

    it('should return tableItem unchanged if columnLink is undefined', () => {
      const tableItem = { foo: 'bar' };
      expect(
        component['enrichWithLink'](
          {
            metadata: {},
            spec: {},
            status: {},
          },
          undefined,
          'foo',
          tableItem,
        ),
      ).toBe(tableItem);
    });

    it('should use url if present', () => {
      const tableItem = { foo: 'bar' };
      const result = component['enrichWithLink'](
        {
          metadata: {},
          spec: {},
          status: {},
        },
        { url: 'http://x', target: '_blank' },
        'foo',
        tableItem,
      );
      expect(result.fooUrl).toBe('http://x');
      expect(result.fooUrlTarget).toBe('_blank');
    });
  });

  describe('getValueByKeyString', () => {
    const testCases: TestCase[] = [
      {
        description: 'should return value by key string',
        resource: mock<CustomResource>({
          metadata: { name: 'test-instance' },
          spec: { projectKey: 'DXPFRAME' },
        }),
        dataPath: '.spec.projectKey',
        expected: 'DXPFRAME',
      },
      {
        description: 'should return boolean value by key string',
        resource: mock<CustomResource>({
          metadata: { name: 'test-instance' },
          status: {
            displayConfig: {
              actions: { showDelete: false },
            },
          },
        }),
        dataPath: '.status.displayConfig.actions.showDelete',
        expected: false,
      },
      {
        description: 'should return undefined for invalid key string',
        resource: {
          metadata: { name: 'test-instance' },
          spec: {},
          status: {},
        },
        dataPath: '.spec.invalidKey',
        expected: undefined,
      },
      {
        description: 'should return undefined for explicitly null values',
        resource: mock<CustomResource>({
          metadata: { name: 'test-instance' },
          spec: { projectKey: 'DXPFRAME' },
          status: { displayConfig: null },
        }),
        dataPath: '.status.displayConfig.actions.showDelete',
        expected: undefined,
      },
      {
        description: 'should return value by key string for metadata fields',
        resource: mock<CustomResource>({
          metadata: {
            name: 'test-instance',
            namespace: 'test-namespace',
          },
          spec: { projectKey: 'DXPFRAME' },
        }),
        dataPath: '.metadata.namespace',
        expected: 'test-namespace',
      },
      {
        description: 'should return empty string for empty dataPath',
        resource: mock<CustomResource>({
          metadata: {
            name: 'test-instance',
            namespace: 'test-namespace',
          },
          spec: { projectKey: 'DXPFRAME' },
        }),
        dataPath: '',
        expected: '',
      },
      {
        description: 'should return undefined for empty resource',
        resource: {} as CustomResource,
        dataPath: '.spec.projectKey',
        expected: undefined,
      },
      {
        description: 'should return undefined for undefined resource',
        resource: undefined as unknown as CustomResource,
        dataPath: '.spec.projectKey',
        expected: undefined,
      },
    ];

    test.each(testCases)('$description', ({ resource, dataPath, expected }) => {
      const result = component['getValueByKeyString'](resource, dataPath);
      expect(result).toBe(expected);
    });
  });

  describe('mapApiResourceTableConfig', () => {
    it('should map API resource table config correctly', () => {
      component.accountConnection = {
        displayName: 'Test Account',
      } as AccountConnection;
      const tableConfig: TableConfig = {
        columns: [
          {
            name: 'project-key',
            label: 'Project Key',
            dataPath: '.spec.projectKey',
          },
        ],
      };

      const result = component.mapApiResourceTableConfig(tableConfig);

      expect(result.columns.length).toBe(1);
      expect(result.toolbar?.title).toBe('Backlog projects');
    });

    it('should correctly map table data with metadata fields', () => {
      const resources = [
        mock<CustomResource>({
          metadata: {
            name: 'test-instance',
            namespace: 'test-namespace',
          },
          spec: {
            projectKey: 'DXPFRAME',
          },
        }),
      ];
      const tableConfig: TableConfig = {
        columns: [
          {
            name: 'name',
            label: 'Name',
            dataPath: '.metadata.name',
          },
          {
            name: 'namespace',
            label: 'Namespace',
            dataPath: '.metadata.namespace',
          },
          {
            name: 'project-key',
            label: 'Project Key',
            dataPath: '.spec.projectKey',
          },
        ],
      };

      const expectedResult = [
        {
          metadataName: 'test-instance',
          metadataNamespace: 'test-namespace',
          specProjectKey: 'DXPFRAME',
        },
      ];

      const result = component.mapApiResourceTableData(resources, tableConfig);
      expect(result).toEqual(expectedResult);
    });

    it('should correctly map toolbar with custom global actions', () => {
      const tableConfig: TableConfig = {
        columns: [
          {
            name: 'name',
            label: 'Name',
            dataPath: '.metadata.name',
          },
          {
            name: 'namespace',
            label: 'Namespace',
            dataPath: '.metadata.namespace',
          },
          {
            name: 'project-key',
            label: 'Project Key',
            dataPath: '.spec.projectKey',
          },
        ],
        actions: {
          additionalActions: [],
          globalActions: [
            {
              id: 'global-custom',
              glyph: 'global-custom',
              displayName: 'Global Custom Action',
              condition: '',
              actionConfig: {
                type: 'luigi',
                path: 'testmodal',
              },
            },
          ],
        },
      };

      const expectedToolbar: ToolbarConfig = {
        title: 'Backlog projects',
        actions: [
          {
            id: 'add',
            label: 'Add',
            requiredPolicies: ['projectAdmin'],
            transparentButton: false,
            callback: expect.any(Function),
          },
          {
            id: 'global-custom',
            label: 'Global Custom Action',
            requiredPolicies: [],
            transparentButton: true,
            condition: '',
            callback: expect.any(Function),
            glyph: 'global-custom',
          },
        ],
      };

      const result = component.mapApiResourceTableConfig(tableConfig);
      expect(result.toolbar).toMatchObject(expectedToolbar);
      expect(result.toolbar?.title).toBe(expectedToolbar.title);
    });

    it('should correctly override default add global action', () => {
      const tableConfig: TableConfig = {
        columns: [
          {
            name: 'name',
            label: 'Name',
            dataPath: '.metadata.name',
          },
          {
            name: 'namespace',
            label: 'Namespace',
            dataPath: '.metadata.namespace',
          },
          {
            name: 'project-key',
            label: 'Project Key',
            dataPath: '.spec.projectKey',
          },
        ],
        actions: {
          additionalActions: [],
          globalActions: [
            {
              id: 'add',
              glyph: 'testglyph',
              displayName: 'Add title changed',
              condition: '',
              requiredPolicies: ['projectAdmin'],
            },
          ],
        },
      };

      const expectedToolbar: ToolbarConfig = {
        title: 'Backlog projects',
        actions: [
          {
            id: 'add',
            glyph: 'testglyph',
            label: 'Add title changed',
            requiredPolicies: ['projectAdmin'],
            transparentButton: false,
            callback: expect.any(Function),
          },
        ],
      };

      const result = component.mapApiResourceTableConfig(tableConfig);
      expect(result.toolbar).toMatchObject(expectedToolbar);
      expect(result.toolbar?.title).toBe(expectedToolbar.title);
    });
  });

  describe('mapColumnsConfig', () => {
    it('should map columns config correctly', () => {
      const columns: ColumnConfig[] = [
        {
          name: 'project-key',
          label: 'Project Key',
          dataPath: '.spec.projectKey',
        },
      ];

      const result = component['mapColumnsConfig'](columns);

      expect(result.length).toBe(1);
      expect(result[0].name).toBe('project-key');
    });
  });

  describe('mapTypeConfig', () => {
    it('should map type config correctly for link', () => {
      const column: ColumnConfig = {
        name: 'project-key',
        label: 'Project Key',
        dataPath: '.spec.projectKey',
        link: {
          target: '_blank',
          urlPath: '.status.projectUrl',
        },
      };

      const result = component['mapTypeConfig'](column);

      expect(result).toBe('link');
    });

    it('should map type config correctly for tags', () => {
      const column: ColumnConfig = {
        name: 'tags',
        label: 'Tags',
        dataPath: '.spec.tags',
        tags: { sort: 'asc' },
      };

      const result = component['mapTypeConfig'](column);

      expect(result).toBe('tags');
    });

    it('should map type config correctly for status', () => {
      const column: ColumnConfig = {
        name: 'status',
        label: 'Status',
        dataPath: '.status.any',
        status: {
          mapping: {
            critical: ['criticalStatus'],
            default: ['defaultStatus'],
            positive: ['positiveStatus'],
            negative: ['negativeStatus'],
            informative: ['informativeStatus'],
          },
        },
      };

      const result = component['mapTypeConfig'](column);

      expect(result).toBe('status');
    });

    it('should map type config correctly for text', () => {
      const column: ColumnConfig = {
        name: 'project-key',
        label: 'Project Key',
        dataPath: '.spec.projectKey',
      };

      const result = component['mapTypeConfig'](column);

      expect(result).toBe('text');
    });
  });

  describe('mapLinkConfig', () => {
    it('should map link config correctly', () => {
      const column: ColumnConfig = {
        name: 'project-key',
        label: 'Project Key',
        dataPath: '.spec.projectKey',
        link: {
          target: '_blank',
          urlPath: '.status.projectUrl',
        },
      };

      const result = component['mapLinkConfig'](column);

      expect(result).toEqual({
        target: 'specProjectKeyUrlTarget',
        url: 'specProjectKeyUrl',
      });
    });

    it('should return undefined for column without link', () => {
      const column: ColumnConfig = {
        name: 'project-key',
        label: 'Project Key',
        dataPath: '.spec.projectKey',
      };

      const result = component['mapLinkConfig'](column);

      expect(result).toBeUndefined();
    });

    it('should return config if link present', () => {
      const result = component['mapLinkConfig']({
        link: {
          target: '_blank',
          urlPath: '.foo',
          url: 'fooUrl',
        },
        dataPath: '.foo',
      } as ColumnConfig);

      expect(result!.url).toContain('fooUrl');
    });
  });

  describe('openConfirmationDialog', () => {
    it('should open confirmation dialog with correct parameters', fakeAsync(() => {
      const modalSettings: ConfirmationModalSettings = {
        type: 'warning',
        header: 'Confirm',
        body: 'Are you sure?',
        buttonConfirm: 'Yes',
        buttonDismiss: 'No',
      };

      const mockActionSuccessCallback = jest.fn();
      component['openConfirmationDialog'](
        modalSettings,
        mockActionSuccessCallback,
      );
      tick();

      expect(mockActionSuccessCallback).toHaveBeenCalled();
    }));
  });

  describe('overrideDeleteAction', () => {
    it('should open delete confirmation dialog and dispatch delete action when confirmed', fakeAsync(() => {
      component.accountConnection = { name: 'acc' } as AccountConnection;

      const openDialogSpy = jest.spyOn(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component as any,
        'openConfirmationDialog',
      );

      jest
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(component as any, 'showConfirmationModal')
        .mockReturnValue(Promise.resolve(ConfirmationDialogDecision.CONFIRMED));
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      const action = component['overrideDeleteAction'](undefined);
      const item = { metadataName: 'foo' };
      action.callback(item);
      tick();

      expect(openDialogSpy).toHaveBeenCalledWith(
        {
          type: 'warning',
          header: 'Delete',
          body: 'Delete instance <b>foo</b>?',
          buttonConfirm: 'Delete',
          buttonDismiss: 'Cancel',
        },
        expect.any(Function),
      );

      expect(dispatchSpy).toHaveBeenCalled();
    }));

    it('should open delete confirmation dialog and not dispatch delete action when declined', fakeAsync(() => {
      component.accountConnection = { name: 'acc' } as AccountConnection;

      const openDialogSpy = jest.spyOn(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component as any,
        'openConfirmationDialog',
      );

      jest
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .spyOn(component as any, 'showConfirmationModal')
        .mockReturnValue(Promise.resolve(ConfirmationDialogDecision.DISMISSED));
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      const action = component['overrideDeleteAction'](undefined);
      const item = { metadataName: 'foo' };
      action.callback(item);
      tick();

      expect(openDialogSpy).toHaveBeenCalledWith(
        {
          type: 'warning',
          header: 'Delete',
          body: 'Delete instance <b>foo</b>?',
          buttonConfirm: 'Delete',
          buttonDismiss: 'Cancel',
        },
        expect.any(Function),
      );

      expect(dispatchSpy).not.toHaveBeenCalled();
    }));
  });

  describe('overrideEditAction', () => {
    it('should open delete confirmation dialog and dispatch delete action when confirmed', fakeAsync(() => {
      component.accountConnection = { name: 'acc' } as AccountConnection;

      const dispatchSpy = jest.spyOn(store, 'dispatch');

      const action = component['overrideEditAction'](undefined);
      const item = { metadataName: 'foo' };
      action.callback(item);

      expect(dispatchSpy).toHaveBeenCalledWith(
        openAccountResourceEditDialog({
          resourceName: 'foo',
          accountConnection: component.accountConnection,
        }),
      );
    }));
  });

  describe('accountNamingArticle', () => {
    it('should return "a" or "an" as the correct article based on the first letter of the singular name', () => {
      const accountNamingService = TestBed.inject(AccountNamingService);

      jest
        .spyOn(accountNamingService, 'accountNamingConfigLowerCase')
        .mockReturnValue({
          singular: 'Project',
          plural: 'Projects',
        });
      expect(component['accountNamingArticle']).toBe('a');

      jest
        .spyOn(accountNamingService, 'accountNamingConfigLowerCase')
        .mockReturnValue({
          singular: 'Instance',
          plural: 'Instances',
        });
      expect(component['accountNamingArticle']).toBe('an');
    });
  });

  describe('Integration tests', () => {
    describe('Table Generator tests with available resources', () => {
      it('should display correct table title', () => {
        const title = extensionAccountResourcesPo.tableTitle;

        expect(title).toBeTruthy();
        expect(extensionAccountResourcesPo.getTextContent(title!)).toBe(
          `${mockAccountConnection.type.apiResourceConfig.displayConfig.accountNamingConfig?.plural} (${mockResources.length})`,
        );
      });

      it('should show global add action button', () => {
        const globalAddButton = extensionAccountResourcesPo.globalAddButton;

        expect(globalAddButton).toBeTruthy();
      });

      it('should show correct table headers', () => {
        const headers = extensionAccountResourcesPo.tableHeaders;

        // The length is the number of columns in the tableConfig + one column for the actions
        expect(headers.length).toBe(
          mockAccountConnection.type.apiResourceConfig.displayConfig.tableConfig
            .columns.length + 1,
        );

        for (let i = 0; i < headers.length - 1; i++) {
          const headerName = extensionAccountResourcesPo.getTextContent(
            headers[i],
          );
          expect(headerName).toBe(
            mockAccountConnection.type.apiResourceConfig.displayConfig
              .tableConfig.columns[i].label,
          );
        }

        expect(
          extensionAccountResourcesPo.getTextContent(
            headers[headers.length - 1],
          ),
        ).toBe('Actions');
      });

      it('should show correct account resources', () => {
        const rows = extensionAccountResourcesPo.tableRows;

        expect(rows.length).toBe(mockResources.length);
        extensionAccountResourcesPo
          .getTableData('project-key')
          .forEach((el, index) => {
            const name = extensionAccountResourcesPo.getTextContent(
              el.querySelector<HTMLElement>('a')!,
            );

            expect(name).toBe(mockResources[index].spec.projectKey);
          });
      });

      // eslint-disable-next-line jest/no-disabled-tests
      test.skip('edit button click should open the edit modal', () => {
        luigiContextSubject.next(context);

        const editAction = extensionAccountResourcesPo.editAction;
        expect(editAction).toBeTruthy();

        const dispatchSpy = jest.spyOn(store, 'dispatch');
        editAction?.click();

        expect(dispatchSpy).toHaveBeenCalledWith(
          openAccountResourceEditDialog({
            resourceName: 'test-instance',
            accountConnection: component.accountConnection,
          }),
        );
      });

      // eslint-disable-next-line jest/no-disabled-tests
      test.skip('delete button click should open the delete confirmation modal', () => {
        luigiContextSubject.next(context);

        const deleteAction = extensionAccountResourcesPo.deleteAction;
        expect(deleteAction).toBeTruthy();

        const dispatchSpy = jest.spyOn(store, 'dispatch');
        deleteAction?.click();

        expect(dispatchSpy).toHaveBeenCalledWith(
          deleteAccountResource({
            name: 'test-instance',
            accountConnection: component.accountConnection,
          }),
        );
      });
    });

    describe('Resources are not available', () => {
      beforeEach(() => {
        store.overrideSelector(customResourceOfCurrentAccount, []);
        store.refreshState();
        fixture.detectChanges();
      });

      it('should show figure when resources are not available', () => {
        const tableTitle = extensionAccountResourcesPo.tableTitle;
        expect(tableTitle).toBeFalsy();

        const figure = extensionAccountResourcesPo.figure;
        expect(figure).toBeTruthy();

        const title = extensionAccountResourcesPo.title;
        expect(extensionAccountResourcesPo.getTextContent(title!)).toBe(
          'You need to add a backlog project for the TestExtension extension',
        );

        const description = extensionAccountResourcesPo.description;
        expect(extensionAccountResourcesPo.getTextContent(description!)).toBe(
          'Backlog projects help you reap the benefits of the extension.',
        );
      });

      it('should hide toolbar and show add button underneath the figure', () => {
        luigiContextSubject.next(context);

        const globalAddButton = extensionAccountResourcesPo.globalAddButton;
        expect(globalAddButton).toBeFalsy();

        const figureAddButton = extensionAccountResourcesPo.figureAddButton;
        expect(figureAddButton).toBeTruthy();
      });
    });
  });
});
