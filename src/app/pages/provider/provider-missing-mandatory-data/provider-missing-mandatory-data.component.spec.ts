import { ProviderMissingMandatoryDataComponent } from './provider-missing-mandatory-data.component';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { DialogService } from '@fundamental-ngx/core';
import { LinkManager } from '@luigi-project/client';
import { provideMockStore } from '@ngrx/store/testing';
import { mock } from 'jest-mock-extended';
import { ProviderMetadata } from 'models/provider-metadata';
import { MockProvider } from 'ng-mocks';
import { Subject, of } from 'rxjs';
import {
  IContextMessage,
  LuigiClient,
  PmLuigiContextService,
} from 'services/luigi';
import { ProviderService } from 'services/provider.service';
import { selectAllProviders } from 'state/providers.selectors';

describe('ExtensionMissingMandatoryDataComponent', () => {
  let component: ProviderMissingMandatoryDataComponent;
  let fixture: ComponentFixture<ProviderMissingMandatoryDataComponent>;
  let luigiClient: LuigiClient;
  let providerService: ProviderService;
  let luigiContextService: PmLuigiContextService;
  const subject = new Subject<IContextMessage>();
  let navigateSpy: jest.Func;
  const extensionClass = {
    name: 'extensionClassName',
    displayName: 'extensionDisplayName',
    scope: { type: 'PROJECT' },
    instance: { id: 'id', name: 'instance name' },
  } as unknown as ProviderMetadata;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        MockProvider(ProviderService, {
          openConfigurationWizard: jest.fn(),
        }),
        MockProvider(LuigiClient),
        MockProvider(PmLuigiContextService),
        MockProvider(DialogService),
        provideMockStore({
          selectors: [
            {
              selector: selectAllProviders,
              value: [extensionClass],
            },
          ],
        }),
        {
          provide: ActivatedRoute,
          useValue: { params: of({ providerName: 'extensionClassName' }) },
        },
      ],
      imports: [ProviderMissingMandatoryDataComponent],
    }).compileComponents();
    luigiClient = TestBed.inject(LuigiClient);
    providerService = TestBed.inject(ProviderService);
    luigiContextService = TestBed.inject(PmLuigiContextService);
  });

  beforeEach(() => {
    luigiContextService.contextObservable = () => subject;

    navigateSpy = jest.fn();
    luigiClient.linkManager = () =>
      mock<LinkManager>({
        navigate: navigateSpy,
      });

    fixture = TestBed.createComponent(ProviderMissingMandatoryDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Navigation methods', () => {
    beforeEach(fakeAsync(() => {
      component.ngOnInit();
      subject.next(mock<IContextMessage>({ context: { projectId: 'foo' } }));
      tick();
    }));

    it('should navigate to extension configuration wizard', () => {
      component.openExtensionConfiguration();

      expect(providerService.openConfigurationWizard).toHaveBeenCalledWith(
        extensionClass.name,
        extensionClass.displayName,
        extensionClass.scope.type,
      );
    });

    it('should navigate to members', () => {
      component.navigateToMembers();

      expect(luigiClient.linkManager().navigate).toHaveBeenCalledWith(
        '/projects/foo/members',
      );
    });
  });
});
