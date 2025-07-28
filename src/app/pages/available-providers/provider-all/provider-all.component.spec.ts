import {
  ProviderAllComponent,
  ProviderCatalogDataItem,
} from './provider-all.component';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { VerificationType } from '@dxp/ngx-core/provider-verification';
import { DialogService } from '@fundamental-ngx/core';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { ScopeType, ServiceStatus } from 'models/provider-metadata';
import { MockProvider } from 'ng-mocks';
import { of, take } from 'rxjs';
import { LuigiClient, PmLuigiContextService } from 'services/luigi';
import { ProviderService } from 'services/provider.service';
import { loadProviders } from 'state/providers.actions';
import { selectAllProviders } from 'state/providers.selectors';

describe('ExtensionAllComponent', () => {
  let component: ProviderAllComponent;
  let fixture: ComponentFixture<ProviderAllComponent>;
  let luigiClient: LuigiClient;
  let store: MockStore<unknown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideMockStore({}),
        MockProvider(ProviderService, {}),
        {
          provide: DialogService,
          useValue: {},
        },
        MockProvider(PmLuigiContextService, {
          contextObservable: jest
            .fn()
            .mockReturnValue(of({ context: { projectId: 'foo' } })),
        }),
        MockProvider(LuigiClient, {
          getNodeParams: jest.fn().mockReturnValue({}),
          addNodeParams: jest.fn(),
        }),
      ],
      imports: [ProviderAllComponent],
    }).compileComponents();

    luigiClient = TestBed.inject(LuigiClient);
    store = TestBed.inject(MockStore);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProviderAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize component with correct title and process extensions', fakeAsync(() => {
    let emittedExtensions: ProviderCatalogDataItem[] | undefined;

    component.installableProviders.pipe(take(1)).subscribe((extensions) => {
      emittedExtensions = extensions;
    });

    store.overrideSelector(selectAllProviders, [
      {
        name: 'ext1',
        displayName: 'Extension One',
        description: 'Description for Extension One',
        scope: { type: ScopeType.PROJECT },
        instance: null,
        category: 'Category A',
        provider: 'Provider X',
        configurationMetadata: '',
        isChangingInstallations: false,
      },
      {
        name: 'ext2',
        displayName: 'Extension Two',
        description: 'Description for Extension Two',
        scope: { type: ScopeType.GLOBAL },
        instance: {
          id: '',
          name: '',
          providerMetadata: {
            name: '',
            displayName: '',
            scope: {
              type: ScopeType.PROJECT,
            },
            configurationMetadata: '',
            instance: null,
            isChangingInstallations: false,
          },
          status: ServiceStatus.READY,
          scope: {
            type: ScopeType.PROJECT,
          },
        },
        category: 'Category B',
        provider: 'Provider Y',
        verification: {
          type: VerificationType.Hyperspace,
        },
        configurationMetadata: '',
        isChangingInstallations: false,
      },
    ]);
    store.refreshState();

    tick();

    expect(emittedExtensions?.length).toBe(2);

    expect(emittedExtensions?.[0]).toEqual(
      expect.objectContaining({
        id: 'ext1',
        scope: ScopeType.PROJECT,
        title: 'Extension One',
        description: 'Description for Extension One',
        image: undefined,
        verification: undefined,
        category: 'Category A',
        provider: 'Provider X',
        badge: { text: '', color: 'var(--sapPositiveColor)' },
        labels: undefined,
        testId: 'dxp-extensions-catalog-all-card-ext1-entity',
        additionalInfo: [{ label: 'Category', value: 'Category A' }],
      }),
    );

    expect(emittedExtensions?.[1]).toEqual(
      expect.objectContaining({
        id: 'ext2',
        scope: ScopeType.GLOBAL,
        title: 'Extension Two',
        description: 'Description for Extension Two',
        verification: {
          type: VerificationType.Hyperspace,
        },
        image: undefined,
        category: 'Category B',
        provider: 'Provider Y',
        badge: { text: 'INSTALLED', color: 'var(--sapPositiveColor)' },
        labels: undefined,
        testId: 'dxp-extensions-catalog-all-card-ext2-entity',
        additionalInfo: [{ label: 'Category', value: 'Category B' }],
      }),
    );
  }));

  describe('ngOnInit', () => {
    it('should subscribe to contextObservable', fakeAsync(() => {
      const q = 'Test';

      luigiClient.getNodeParams = jest.fn().mockReturnValue({ q });
      jest.spyOn(store, 'dispatch');

      component.ngOnInit();
      tick();
      expect(component.initialFilter).toEqual(q);
      expect(store.dispatch).toHaveBeenCalledWith(loadProviders());
    }));
  });

  describe('writeQueryParam', () => {
    it('should add query to Luigi node', () => {
      const query = 'Test';
      component.writeQueryParam(query);

      expect(luigiClient.addNodeParams).toHaveBeenCalledWith(
        { q: query },
        true,
      );
    });

    it('should not add query to Luigi node when search is empty', () => {
      const query = '';
      component.writeQueryParam(query);

      expect(luigiClient.addNodeParams).toHaveBeenCalledWith({ q: '' }, true);
    });
  });

  describe('navigate', () => {
    it('should open modal with correct params in feature mode', () => {
      component.isFeatureMode = true;
      const catalogItem = {
        id: 'ext1',
        scope: ScopeType.GLOBAL,
        title: 'Extension 1',
      } as ProviderCatalogDataItem;

      const openAsModal = jest.fn();
      luigiClient.linkManager = jest.fn().mockReturnValue({ openAsModal });

      component.navigate(catalogItem);
      expect(openAsModal).toHaveBeenCalledWith(
        `/extensions/${catalogItem.id}`,
        expect.objectContaining({
          title: 'Extension Details - Extension 1',
        }),
      );
    });

    it('should open modal with correct params in non-feature mode', () => {
      component.isFeatureMode = false;
      const catalogItem = {
        id: 'ext2',
        scop: ScopeType.PROJECT,
        title: 'Extension 2',
      } as ProviderCatalogDataItem;

      const openAsModal = jest.fn();
      luigiClient.linkManager = jest.fn().mockReturnValue({
        fromParent: () => ({
          withParams: () => ({
            openAsModal,
          }),
        }),
      });

      component.navigate(catalogItem);
      expect(openAsModal).toHaveBeenCalledWith(
        `extensions/${catalogItem.id}`,
        expect.objectContaining({
          title: 'Extension Details - Extension 2',
          keepPrevious: true,
        }),
      );
    });
  });
});
