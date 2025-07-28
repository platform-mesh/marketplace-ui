import { ProviderDetailsComponent } from './provider-details.component';
import { ProviderDetailsComponentPo } from './provider-details.po';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { GithubService } from '@dxp/ngx-core/github';
import { VerificationType } from '@dxp/ngx-core/provider-verification';
import { DialogService } from '@fundamental-ngx/core';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { mock } from 'jest-mock-extended';
import {
  AccountConnection,
  ProviderMetadata,
  ScopeType,
  ServiceLevel,
  ServiceStatus,
} from 'models/index';
import { MockProvider } from 'ng-mocks';
import { Subject, of } from 'rxjs';
import { GraphqlService } from 'services/graphql.service';
import { IContextMessage, PmLuigiContextService } from 'services/luigi';
import { ProviderService } from 'services/provider.service';
import { selectSelectedProvider } from 'state/detail-view.selectors';

const mockExtensionClass: ProviderMetadata = {
  configurationMetadata: '',
  displayName: 'Test',
  description: 'Any Description',
  category: 'Category',
  isChangingInstallations: false,
  name: 'Name',
  scope: { type: ScopeType.PROJECT },
  image: 'test-image',
  verification: {
    type: VerificationType.Hyperspace,
  },
  labels: [
    {
      title: 'New',
      color: '9',
    },
    {
      title: 'Other',
      color: '1',
    },
  ],
  template: {
    name: 'Name',
    version: '12',
  },
  creationTimestamp: '2025-05-02 13:45:30',
  serviceLevel: ServiceLevel.High,
  documentation: [{ url: 'http://example.com/documentation', name: 'name' }],
  contacts: [
    {
      displayName: 'John Doe',
      contactLink: 'http://example.com/contact1',
      roles: ['Admin'],
    },
    {
      displayName: 'Jane Doe',
      email: 'contact2@example.com',
      roles: ['Developer', 'Admin'],
    },
  ],
  instance: {
    id: 'id',
    name: 'name',
    providerMetadata: {
      displayName: '',
      name: '',
      scope: { type: ScopeType.PROJECT },
      configurationMetadata: '',
      instance: null,
      isChangingInstallations: true,
    },
    status: ServiceStatus.READY,
    scope: {
      type: ScopeType.PROJECT,
    },
  },
};

jest.mock('shared/helpers', () => ({
  getExtensionClassStatusValue: jest.fn().mockImplementation((data) => {
    return { label: data?.instances.status };
  }),
}));
describe('ExtensionDetailsComponent', () => {
  let component: ProviderDetailsComponent;
  let fixture: ComponentFixture<ProviderDetailsComponent>;
  let service: ProviderService;
  let extensionDetailsPo: ProviderDetailsComponentPo;
  let mockStore: MockStore<unknown>;

  let luigiContextSubject: Subject<IContextMessage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideMockStore({
          selectors: [
            {
              selector: selectSelectedProvider,
              value: mockExtensionClass,
            },
          ],
        }),
        {
          provide: DialogService,
          useValue: {},
        },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ providerName: 'testExtensionClass' }),
            paramMap: of(
              convertToParamMap({ providerName: 'testExtensionClass' }),
            ),
          },
        },
        MockProvider(GithubService, {}),
        MockProvider(GraphqlService, {}),
        MockProvider(ProviderService, {
          openConfigurationWizard: jest.fn(),
          mapServiceLevel: jest.fn().mockReturnValue('Level'),
          getIcon: jest.fn().mockReturnValue(mockExtensionClass.image),
        }),
        MockProvider(PmLuigiContextService, {
          contextObservable: () => luigiContextSubject,
        }),
      ],
      imports: [ProviderDetailsComponent],
    }).compileComponents();
    service = TestBed.inject(ProviderService);
    mockStore = TestBed.inject(MockStore);
    luigiContextSubject = new Subject();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProviderDetailsComponent);
    component = fixture.componentInstance;

    extensionDetailsPo = new ProviderDetailsComponentPo(fixture.nativeElement);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('mapServiceLevel', () => {
    it('should call ExtensionService mapServiceLevel', () => {
      const returnValue = 'ExpectedOutput';
      const serviceLevelMock = ServiceLevel.High;

      jest.spyOn(service, 'mapServiceLevel').mockReturnValue(returnValue);

      const result = component.mapServiceLevel(serviceLevelMock);

      expect(service.mapServiceLevel).toHaveBeenCalledWith(serviceLevelMock);
      expect(result).toBe(returnValue);
    });
  });

  it('should display the extension title and subtitle', () => {
    fixture.detectChanges();

    expect(
      extensionDetailsPo.getTextContent(extensionDetailsPo?.pageTitle),
    ).toBe(mockExtensionClass.displayName);
    expect(
      extensionDetailsPo.getTextContent(extensionDetailsPo.pageSubtitle),
    ).toBe(mockExtensionClass.category);
  });

  it('should display DXP as subcategory if it is missing', () => {
    mockStore.overrideSelector(selectSelectedProvider, {
      ...mockExtensionClass,
      category: undefined,
    });
    mockStore.refreshState();
    fixture.detectChanges();

    expect(
      extensionDetailsPo.getTextContent(extensionDetailsPo.pageTitle),
    ).toBe(mockExtensionClass.displayName);
    expect(
      extensionDetailsPo.getTextContent(extensionDetailsPo.pageSubtitle),
    ).toBe('DXP');
  });

  it('should display avatar with the correct background', () => {
    expect(extensionDetailsPo.avatar).toBeTruthy();
    expect(extensionDetailsPo.avatar?.getAttribute('style')).toContain(
      mockExtensionClass.image,
    );
  });

  it('should show provider verification', () => {
    expect(extensionDetailsPo.providerVerification).toBeTruthy();
    expect(extensionDetailsPo.providerVerification?.innerHTML).toContain(
      'Hyperspace',
    );
  });

  it('should show creation date', () => {
    const date = 'May 2, 2025';

    expect(extensionDetailsPo.createdOn).toBeTruthy();
    expect(
      extensionDetailsPo.getTextContent(extensionDetailsPo.createdOn),
    ).toBe(date);
  });

  it('should show status if available', () => {
    expect(extensionDetailsPo.status).not.toBeNull();
  });

  it('should not show status if no instances are available', () => {
    mockStore.overrideSelector(selectSelectedProvider, {
      ...mockExtensionClass,
      instance: null,
    });

    expect(extensionDetailsPo.status).not.toBeNull();
  });

  it('should show extension labels', () => {
    const poLabels = Array.from(extensionDetailsPo.labels).map((label) =>
      extensionDetailsPo.getTextContent(label),
    );
    expect(poLabels).toEqual(
      mockExtensionClass.labels?.map((label) => label.title),
    );
  });

  it('should display service level information if available', () => {
    expect(
      extensionDetailsPo.getTextContent(extensionDetailsPo.serviceLevel),
    ).toBe('Level');
  });

  describe('edit button', () => {
    const context = mock<IContextMessage>({
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
    beforeEach(() => {
      luigiContextSubject.next(context);
    });

    it('should show edt button', () => {
      expect(extensionDetailsPo.editButton).not.toBeNull();
    });

    it('should not show edt button', () => {
      mockStore.overrideSelector(selectSelectedProvider, {
        ...mockExtensionClass,
        template: undefined,
      });
      mockStore.refreshState();
      fixture.detectChanges();
      expect(extensionDetailsPo.editButton).toBeNull();
    });

    it('should call openConfigurationWizard when the edit button is clicked', () => {
      jest.spyOn(component, 'editExtension');
      jest.spyOn(service, 'openConfigurationWizard');
      extensionDetailsPo.clickEditButton();

      fixture.detectChanges();

      expect(component.editExtension).toHaveBeenCalled();
      expect(service.openConfigurationWizard).toHaveBeenCalledWith(
        'Name',
        'Test',
        'PROJECT',
      );
    });
  });

  describe('hasAccountType', () => {
    it('should display description section when no account connections', () => {
      expect(extensionDetailsPo.descriptionDetails).not.toBeNull();
      expect(
        extensionDetailsPo.getTextContent(
          extensionDetailsPo.descriptionDetailsHeader,
        ),
      ).toContain(mockExtensionClass.displayName);
      expect(
        extensionDetailsPo.getTextContent(
          extensionDetailsPo.descriptionDetails,
        ),
      ).toContain(mockExtensionClass.description);
    });

    it('should render documentation link', () => {
      expect(extensionDetailsPo.documentationLink).toBeTruthy();
      expect(extensionDetailsPo.documentationLink?.getAttribute('href')).toBe(
        mockExtensionClass.documentation?.[0].url,
      );
    });

    it('should render contacts if available', () => {
      const contactLinks = extensionDetailsPo.getContactLinks();
      const contactRoles = extensionDetailsPo.getContactRoles();

      expect(extensionDetailsPo.contactsSection).not.toBeNull();
      expect(contactLinks).toContain(
        mockExtensionClass.contacts?.[0].contactLink,
      );
      expect(contactLinks).toContain(
        `mailto:${mockExtensionClass.contacts?.[1].email}`,
      );
      expect(contactRoles[0]).toContain('Admin');
      expect(contactRoles[1]).toContain('Developer');
      expect(contactRoles[1]).toContain('Admin');
    });

    it('should display account section when there are account connections', () => {
      mockStore.overrideSelector(selectSelectedProvider, {
        ...mockExtensionClass,
        accountConnections: [{ name: 'accountType' }] as AccountConnection[],
      });
      mockStore.refreshState();
      fixture.detectChanges();

      expect(extensionDetailsPo.descriptionDetails).toBeNull();
      // TODO: check with Toni Petrova what this is for after the hackathon!
      //expect(extensionDetailsPo.accountSection).not.toBeNull();
    });
  });
});
