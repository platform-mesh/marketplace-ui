import { ImportAccountsComponent } from './import-accounts.component';
import { JenkinsImport } from './jenkins-imports-types';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { MessageBoxService } from '@fundamental-ngx/core';
import { TableRowSelectionChangeEvent } from '@fundamental-ngx/platform';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import axios from 'axios';
import { mock } from 'jest-mock-extended';
import { LuigiGoBackAction } from 'models/luigi-go-back';
import { ScopeType } from 'models/provider-metadata';
import { MockProvider } from 'ng-mocks';
import { Subject } from 'rxjs';
import {
  IContextMessage,
  LuigiClient,
  PmLuigiContextService,
} from 'services/luigi';
import { loadProviderMetadata } from 'state/provider-metadata.action';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ImportAccountsComponent', () => {
  let component: ImportAccountsComponent;
  let fixture: ComponentFixture<ImportAccountsComponent>;
  let mockStore: MockStore;
  let mockMessageBoxService: MessageBoxService;
  let mockLuigiClient: LuigiClient;
  let luigiContextSubject: Subject<IContextMessage>;

  beforeEach(async () => {
    luigiContextSubject = new Subject();

    await TestBed.configureTestingModule({
      providers: [
        MockProvider(PmLuigiContextService, {
          contextObservable: () => luigiContextSubject,
        }),
        provideMockStore(),
        {
          provide: LuigiClient,
          useValue: {
            linkManager: jest.fn().mockReturnValue({ goBack: jest.fn() }),
          },
        },
        {
          provide: MessageBoxService,
          useValue: {
            open: jest.fn(),
          },
        },
      ],
      imports: [ImportAccountsComponent],
    }).compileComponents();

    mockStore = TestBed.inject(MockStore);
    mockMessageBoxService = TestBed.inject(MessageBoxService);
    mockLuigiClient = TestBed.inject(LuigiClient);
    fixture = TestBed.createComponent(ImportAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should build spec object with correct properties', () => {
    const element: JenkinsImport = {
      name: 'jenkins-1',
      imported: false,
      projectId: 'proj-123',
      ownerID: 'user-456',
      costCenter: '7890',
      size: 'large',
    };

    const result = component['buildSpec'](element);

    expect(result).toEqual({
      size: 'large',
      costCenter: '7890',
      owner: 'user-456',
    });
  });

  it('ngOnInit should subscribe to context and dispatch loadExtensionClass', fakeAsync(() => {
    const context = mock<IContextMessage>({
      context: {
        token: 'test-token',
        userid: 'user-456',
        providerName: 'TestExtension',
        projectId: 'projectId',
        entityContext: {
          project: {
            type: 'Type',
            policies: ['providerAdmin'],
          },
        },
      },
    });

    const storeDispatchSpy = jest.spyOn(mockStore, 'dispatch');

    luigiContextSubject.next(context);
    fixture.detectChanges();
    tick();

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      loadProviderMetadata({
        providerName: context.context.providerName,
        scope: ScopeType.GLOBAL,
        installableIn: [ScopeType.PROJECT],
        includeHidden: false,
      }),
    );

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('ownerID=user-456'),
      expect.objectContaining({
        headers: {
          Authorization: `Bearer ${context.context.token}`,
          'Content-Type': 'application/json',
        },
      }),
    );
  }));

  it('onRowSelectionChange should update selectedElements', () => {
    const mockSelection: JenkinsImport[] = [
      {
        name: 'j1',
        imported: false,
        projectId: 'p1',
        ownerID: 'o1',
        costCenter: 'c1',
        size: 's1',
      },
      {
        name: 'j2',
        imported: false,
        projectId: 'p2',
        ownerID: 'o2',
        costCenter: 'c2',
        size: 's2',
      },
    ];
    const event = { selection: mockSelection, selectionType: 'set' };

    component.onRowSelectionChange(
      event as unknown as TableRowSelectionChangeEvent<JenkinsImport>,
    );

    expect(component.selectedElements).toEqual(mockSelection);
  });

  it('wizardCanceled should call goBack with correct attributes', () => {
    component.wizardCanceled();
    expect(mockLuigiClient.linkManager().goBack).toHaveBeenCalledWith({
      action: LuigiGoBackAction.RESOURCE_ACCOUNT_CANCEL,
    });
  });

  it('importAccounts should open message box and dispatch createAccountResource for each selected element', fakeAsync(() => {
    mockStore.overrideSelector('resourceViewState', {
      extensionClass: {
        name: 'mockExtClass',
        accountConnections: [{ name: 'mockAccountConnection' }],
      },
    });
    mockStore.refreshState();

    const selectedItems: JenkinsImport[] = [
      {
        name: 'item1',
        imported: false,
        projectId: 'p1',
        ownerID: 'o1',
        costCenter: 'cc1',
        size: 'small',
      },
      {
        name: 'item2',
        imported: false,
        projectId: 'p2',
        ownerID: 'o2',
        costCenter: 'cc2',
        size: 'medium',
      },
    ];
    component.selectedElements = selectedItems;

    const storeDispatchSpy = jest.spyOn(mockStore, 'dispatch');
    const messageBoxOpenSpy = jest.spyOn(mockMessageBoxService, 'open');

    component.importAccounts();
    tick();

    expect(messageBoxOpenSpy).toHaveBeenCalledWith(
      {
        title: 'Confirm Jenkins Restart',
        content: `By importing the selected JaaS instance: ${selectedItems
          .map((x) => `'${x.name}'`)
          .join(',')} will be restarted`,
        approveButton: 'Ok',
        approveButtonCallback: expect.any(Function),
        cancelButton: 'Cancel',
        cancelButtonCallback: expect.any(Function),
      },
      {
        type: 'warning',
      },
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const messageBoxOptions: any = messageBoxOpenSpy.mock.calls[0][0];

    messageBoxOptions.approveButtonCallback();

    expect(storeDispatchSpy).toHaveBeenCalledTimes(selectedItems.length);
  }));

  it('importAccounts should close message box on cancel and not dispatch actions', fakeAsync(() => {
    // Mock the resourceViewState selector
    mockStore.overrideSelector('resourceViewState', {
      extensionClass: {
        name: 'mockExtClass',
        accountConnections: [{ name: 'mockAccountConnection' }],
      },
    });
    mockStore.refreshState();

    component.selectedElements = [
      {
        name: 'item1',
        imported: false,
        projectId: 'p1',
        ownerID: 'o1',
        costCenter: 'cc1',
        size: 'small',
      },
    ];

    const messageBoxOpenSpy = jest.spyOn(mockMessageBoxService, 'open');
    const storeDispatchSpy = jest.spyOn(mockStore, 'dispatch');

    const mockRef = { close: jest.fn() };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    messageBoxOpenSpy.mockReturnValue(mockRef as any);

    component.importAccounts();
    tick();

    expect(messageBoxOpenSpy).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const messageBoxOptions: any = messageBoxOpenSpy.mock.calls[0][0];

    messageBoxOptions.cancelButtonCallback();

    expect(mockRef.close).toHaveBeenCalledTimes(1);
    expect(storeDispatchSpy).not.toHaveBeenCalled();
  }));
});
