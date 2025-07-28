import { BtpAccountTableComponent } from './btp-account-table.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LuigiClient } from '@dxp/ngx-core/luigi';
import { ProviderMetadata, ScopeType } from 'models/index';
import { MockProvider } from 'ng-mocks';
import { of } from 'rxjs';
import { BtpSecretService, Secret } from 'services/btp-secret-service';

const mockBtpSecrets = [
  { path: 'secret1', metadata: {} } as Secret,
  { path: 'secret2', metadata: {} } as Secret,
];

describe('BtpAccountTableComponent', () => {
  let component: BtpAccountTableComponent;
  let fixture: ComponentFixture<BtpAccountTableComponent>;
  let luigiClient: LuigiClient;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BtpAccountTableComponent],
      providers: [
        MockProvider(BtpSecretService, {
          getBTPSecrets: () => of(mockBtpSecrets), // <-- emit mock secrets
        }),
        MockProvider(LuigiClient, {
          linkManager: jest.fn().mockReturnValue({
            fromClosestContext: jest.fn().mockReturnValue({
              withParams: jest.fn().mockReturnValue({
                navigate: jest.fn(),
              }),
            }),
          }),
        }),
      ],
    }).compileComponents();

    luigiClient = TestBed.inject(LuigiClient);
    fixture = TestBed.createComponent(BtpAccountTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('addAccount', () => {
    function setExtensionSignalValue(value: ProviderMetadata) {
      Object.defineProperty(component, 'extension', { value: () => value });
    }

    it('should navigate with correct params when extension and accountConnections exist', () => {
      const extensionClass: ProviderMetadata = {
        name: 'TestExtension',
        displayName: '',
        scope: {
          type: ScopeType.PROJECT,
        },
        configurationMetadata: '',
        instance: null,
        isChangingInstallations: false,
        accountConnections: [
          {
            description: 'account connection description',
            displayName: 'accountConnection1',
            name: '',
            image: {
              url: '',
            },
            type: {
              context: '',
              name: 'accType',
              apiResourceConfig: {
                wizardConfig: {
                  name: '',
                  configData: '',
                  wizardDefinition: '',
                },
                displayConfig: {
                  apiServerConfig: {
                    host: '',
                    namespaceRetrievalStrategy: '',
                  },
                  resourceConfig: {
                    groupVersion: '',
                    kind: '',
                  },
                  tableConfig: {
                    columns: [],
                  },
                },
              },
            },
          },
        ],
      };
      setExtensionSignalValue(extensionClass);
      component.addAccount();
      expect(luigiClient.linkManager).toHaveBeenCalled();
      expect(
        luigiClient.linkManager().fromClosestContext().withParams,
      ).toHaveBeenCalledWith({ type: 'accType' });
      expect(
        luigiClient
          .linkManager()
          .fromClosestContext()
          .withParams({ type: 'accType' }).navigate,
      ).toHaveBeenCalledWith(
        'create-btp-acc/project/TestExtension',
        undefined,
        true,
        { title: 'Create BTP Account', size: 's' },
      );
    });

    it('should do nothing if extension is missing', () => {
      setExtensionSignalValue(undefined as unknown as ProviderMetadata);
      component.addAccount();
      expect(luigiClient.linkManager).not.toHaveBeenCalled();
    });

    it('should do nothing if accountConnections is missing', () => {
      const extensionClass: ProviderMetadata = {
        name: 'TestExtension',
        displayName: '',
        scope: {
          type: ScopeType.TENANT,
        },
        configurationMetadata: '',
        instance: null,
        isChangingInstallations: false,
      };
      setExtensionSignalValue(extensionClass);
      component.addAccount();
      expect(luigiClient.linkManager).not.toHaveBeenCalled();
    });
  });
});
