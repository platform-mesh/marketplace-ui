import { ProviderDetailDialogComponent } from './provider-detail-dialog.component';
import { ProviderDetailDialogPo } from './provider-detail-dialog.po';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { mock } from 'jest-mock-extended';
import { NodeContext, ProviderMetadata, ServiceLevel } from 'models/index';
import { PROVIDER_INSTANCE_INSTALLED } from 'models/luigi-go-back';
import { MockProvider } from 'ng-mocks';
import { Subject, of } from 'rxjs';
import { GraphqlService } from 'services/graphql.service';
import {
  IContextMessage,
  LuigiClient,
  PmLuigiContextService,
} from 'services/luigi';
import { ProviderService } from 'services/provider.service';
import { selectAccountsPerConnectionTypes } from 'state/accounts.selectors';
import { selectScope } from 'state/luigi.selectors';
import {
  selectProviderMetadataCommunityLinks,
  selectProviderMetadataProductOwners,
  selectProviderMetadataSupportLinks,
} from 'state/provider-metadata.selectors';

const providerServiceMock = {
  isInstallableExtension: jest.fn().mockReturnValue(true),
  isUninstallable: jest.fn().mockReturnValue(true),
  isInstalledExtension: jest.fn().mockReturnValue(true),
  installExtension: jest.fn().mockReturnValue(of(null)),
  uninstallExtensionDialog: jest.fn(),
  getIcon: jest.fn(),
  navigateToExtensionDetails: jest.fn(),
  mapServiceLevel: jest.fn(),
  openConfigurationWizard: jest.fn(),
};

describe('ExtensionDetailDialogComponent', () => {
  let component: ProviderDetailDialogComponent;
  let fixture: ComponentFixture<ProviderDetailDialogComponent>;
  let luigiContextSubject: Subject<IContextMessage>;
  let extensionDetailDialogPo: ProviderDetailDialogPo;
  let mockData: ProviderMetadata;
  let luigiLinkManagerGoBackSpy: jest.Mock;

  beforeEach(async () => {
    luigiContextSubject = new Subject();
    luigiLinkManagerGoBackSpy = jest.fn();

    await TestBed.configureTestingModule({
      providers: [
        MockProvider(GraphqlService, {}),
        MockProvider(PmLuigiContextService, {
          contextObservable: () => luigiContextSubject,
        }),
        provideMockStore({
          initialState: {
            changingClassesNames: [],
          },
          selectors: [
            {
              selector: selectAccountsPerConnectionTypes,
              value: [],
            },
            {
              selector: selectProviderMetadataProductOwners,
              value: [],
            },
            {
              selector: selectScope,
              value: { scopeType: 'PROJECT' },
            },
            {
              selector: selectProviderMetadataCommunityLinks,
              value: [
                {
                  displayName: 'Community Link',
                  URL: 'https://community.example.com',
                },
                {
                  displayName: 'No Url',
                },
              ],
            },
            {
              selector: selectProviderMetadataSupportLinks,
              value: [
                {
                  displayName: 'Support Channel',
                  URL: 'https://support.example.com',
                },
                {
                  displayName: 'No Url',
                },
              ],
            },
            {
              selector: selectProviderMetadataProductOwners,
              value: [
                {
                  displayName: 'Alice Smith',
                  email: 'alice@example.com',
                  role: ['Developer', 'Team Lead'],
                },
                {
                  displayName: 'Bob Smith',
                  email: 'bob@example.com',
                  role: ['Project Owner'],
                  contactLink: 'https://example.com/contact/bob',
                },
                {
                  displayName: 'Van Brown',
                  role: ['Project Manager'],
                },
              ],
            },
          ],
        }),
        { provide: ProviderService, useValue: providerServiceMock },
        {
          provide: LuigiClient,
          useValue: {
            linkManager: jest.fn(() => ({
              goBack: luigiLinkManagerGoBackSpy,
            })),
          },
        },
      ],
      imports: [ProviderDetailDialogComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProviderDetailDialogComponent);
    extensionDetailDialogPo = new ProviderDetailDialogPo(fixture.nativeElement);
    mockData = extensionDetailDialogPo.getMockData();

    component = fixture.componentInstance;
    component.marketplaceEntryObservable = of(mockData);

    fixture.detectChanges();
  });

  it('should map the service level', () => {
    jest.spyOn(providerServiceMock, 'mapServiceLevel').mockReturnValue('24x7');
    // Act
    const result = component.mapServiceLevel(ServiceLevel.VeryHigh);

    // Assert
    expect(providerServiceMock.mapServiceLevel).toHaveBeenCalled();
    expect(result).toBe('24x7');
  });

  describe('ExtensionDetailDialogComponent', () => {
    it('should show installed label', () => {
      jest
        .spyOn(providerServiceMock, 'isInstalledExtension')
        .mockReturnValue(false);

      fixture.detectChanges();

      expect(extensionDetailDialogPo.installedTag).not.toBeNull();
    });

    it('should not show installed label', fakeAsync(() => {
      jest
        .spyOn(providerServiceMock, 'isInstalledExtension')
        .mockReturnValue(true);
      tick();
      fixture.detectChanges();

      expect(extensionDetailDialogPo.installedTag).toBeNull();
    }));

    it('should display mainLink and open blank page', () => {
      jest.spyOn(window, 'open').mockImplementation(() => window);
      extensionDetailDialogPo.clickMainLinkButton();

      expect(extensionDetailDialogPo.mainLinkButton).not.toBeNull();
      expect(window.open).toHaveBeenCalledWith(
        'https://openExtensions',
        '_blank',
      );
    });

    it('should display info labels', () => {
      const labels = Array.from(extensionDetailDialogPo.infoLabels).map(
        (label) => extensionDetailDialogPo.getTextContent(label),
      );
      expect(labels).toEqual([mockData.labels?.[0].title]);
    });

    it('should display service level', () => {
      jest
        .spyOn(providerServiceMock, 'mapServiceLevel')
        .mockReturnValue('24x7');

      fixture.detectChanges();

      expect(providerServiceMock.mapServiceLevel).toHaveBeenCalledWith(
        'veryHigh24x7',
      );
    });

    describe('install buttons', () => {
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

      it('should trigger install extension', fakeAsync(() => {
        component['context'] = context.context as NodeContext;

        fixture.detectChanges();

        jest
          .spyOn(providerServiceMock, 'installExtension')
          .mockReturnValue(of(true));

        extensionDetailDialogPo.clickInstallButton();

        tick();

        expect(extensionDetailDialogPo.installButton).not.toBeNull();
        expect(providerServiceMock.installExtension).toHaveBeenCalled();
        expect(luigiLinkManagerGoBackSpy).toHaveBeenCalledWith(
          PROVIDER_INSTANCE_INSTALLED,
        );
      }));

      it('should trigger install extension with a wizard', fakeAsync(() => {
        const mockDataWizard: ProviderMetadata = {
          ...mockData,
          wizardConfig: {
            name: 'step 1',
            configData: 'Data',
            wizardDefinition: 'Definition',
          },
        };
        component['context'] = context.context as NodeContext;
        fixture.detectChanges();

        component.marketplaceEntry = mockDataWizard;

        jest.spyOn(providerServiceMock, 'openConfigurationWizard');
        extensionDetailDialogPo.clickInstallButton();
        fixture.detectChanges();
        tick();

        expect(extensionDetailDialogPo.installButton).not.toBeNull();
        expect(providerServiceMock.openConfigurationWizard).toHaveBeenCalled();
      }));

      it('should trigger uninstall extension dialog', () => {
        extensionDetailDialogPo.clickUninstallButton();

        expect(extensionDetailDialogPo.uninstallButton).not.toBeNull();
        expect(
          providerServiceMock.uninstallExtensionDialog,
        ).toHaveBeenCalledWith(
          expect.objectContaining({ name: mockData.name }),
        );
      });
    });

    it('should display community links', () => {
      const communityLinks = Array.from(
        extensionDetailDialogPo.communityLinks.link,
      ).map((link, index) => {
        return {
          href: extensionDetailDialogPo.communityLinks.href[
            index
          ]?.getAttribute('href'),
          text: extensionDetailDialogPo.getTextContent(link),
        };
      });

      expect(extensionDetailDialogPo.communityLinks.label).toBeDefined();
      expect(communityLinks).toEqual([
        { href: 'https://community.example.com', text: 'Community Link' },
        {
          href: undefined,
          text: 'No Url',
        },
      ]);
    });

    it('should display supportChannels', () => {
      const supportChannels = Array.from(
        extensionDetailDialogPo.supportChannel.link,
      ).map((link, index) => {
        return {
          href: extensionDetailDialogPo.supportChannel.href[
            index
          ]?.getAttribute('href'),
          text: extensionDetailDialogPo.getTextContent(link),
        };
      });

      expect(extensionDetailDialogPo.supportChannel.label).toBeDefined();
      expect(supportChannels).toEqual([
        { href: 'https://support.example.com', text: 'Support Channel' },
        {
          href: undefined,
          text: 'No Url',
        },
      ]);
    });

    it('should display product owners', () => {
      const productOwners = Array.from(
        extensionDetailDialogPo.productOwners.link,
      ).map((link, index) => {
        return {
          href: extensionDetailDialogPo.productOwners.href[index]?.getAttribute(
            'href',
          ),
          text: extensionDetailDialogPo.getTextContent(link),
        };
      });

      expect(extensionDetailDialogPo.productOwners.label).toBeDefined();
      expect(productOwners).toEqual([
        {
          href: 'mailto:alice@example.com',
          text: 'Alice Smith ,',
        },
        {
          href: 'https://example.com/contact/bob',
          text: 'Bob Smith ,',
        },
        {
          href: undefined,
          text: 'Van Brown',
        },
      ]);
    });

    it('should hide install button for undefined extension', () => {
      component.marketplaceEntry = undefined;
      fixture.detectChanges();

      expect(component['showInstallButton']()).toBe(false);
    });

    it('should show install button for correct extension', () => {
      component.marketplaceEntry = mockData;
      fixture.detectChanges();
      expect(component['showInstallButton']()).toBe(true);
    });

    it('should handle asynchronous isUnaccounted property and navigate to extension details page', () => {
      component.isUnaccounted = of(true);
      fixture.detectChanges();
      extensionDetailDialogPo.clickVisitLink();
      fixture.detectChanges();

      const messageStrip = extensionDetailDialogPo.messageStrip;
      expect(messageStrip).toBeTruthy();
      expect(messageStrip?.textContent).toContain(
        'This extension is installed, but you need an account to use it.',
      );
      expect(
        providerServiceMock.navigateToExtensionDetails,
      ).toHaveBeenCalledWith(
        expect.objectContaining(extensionDetailDialogPo.getMockData()),
      );
    });

    describe('installExtension', () => {
      it('should call installExtension on the service and navigate back on success', fakeAsync(() => {
        const installSpy = jest
          .spyOn(providerServiceMock, 'installExtension')
          .mockReturnValue(of(true));

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

        luigiContextSubject.next(context);
        component['installExtension']();
        tick();

        expect(installSpy).toHaveBeenCalledWith(component.marketplaceEntry);
        expect(luigiLinkManagerGoBackSpy).toHaveBeenCalledWith(
          PROVIDER_INSTANCE_INSTALLED,
        );
      }));

      it('should open configuration wizard if wizardConfig is present', fakeAsync(() => {
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

        const mockDataWizard: ProviderMetadata = {
          ...mockData,
          wizardConfig: {
            name: 'step 1',
            configData: 'Data',
            wizardDefinition: 'Definition',
          },
        };

        luigiContextSubject.next(context);
        fixture.detectChanges();
        tick();

        component.marketplaceEntry = mockDataWizard;
        fixture.detectChanges();

        const openWizardSpy = jest.spyOn(
          providerServiceMock,
          'openConfigurationWizard',
        );

        component['installExtension']();
        expect(openWizardSpy).toHaveBeenCalledWith(
          'extensionClassName',
          'extensionDisplayName',
          'PROJECT',
          undefined,
        );
      }));
    });
  });
});
