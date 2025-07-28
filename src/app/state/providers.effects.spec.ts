import { selectScope } from './luigi.selectors';
import { loadProviders, retrievedProviders } from './providers.actions';
import { ProvidersEffects } from './providers.effects';
import { fakeAsync, tick } from '@angular/core/testing';
import { Actions } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { MockStore, createMockStore } from '@ngrx/store/testing';
import { MockProxy, mock } from 'jest-mock-extended';
import {
  ProviderMetadata,
  ScopeType,
  ServiceInstance,
  ServiceStatus,
} from 'models/index';
import { Observable, ReplaySubject, of } from 'rxjs';
import { GraphqlService } from 'services/graphql.service';

describe('ExtensionClassesEffects', () => {
  let mockStore: MockStore;
  let graphqlService: MockProxy<GraphqlService>;
  let actionsSubject: ReplaySubject<Action>;

  function createExtensionClass(status: ServiceStatus): ProviderMetadata[] {
    const providerMetadata: ProviderMetadata = {
      displayName: 'bar',
      name: 'foo',
      scope: {
        type: ScopeType.PROJECT,
      },
      configurationMetadata: '',
      instance: null,
      isChangingInstallations: false,
    };
    const extensionInstance: ServiceInstance = {
      id: 'id',
      name: 'name',
      providerMetadata,
      status,
      scope: {
        type: ScopeType.PROJECT,
      },
    };
    providerMetadata.instance = extensionInstance;
    return [providerMetadata];
  }

  beforeEach(() => {
    mockStore = createMockStore();
    graphqlService = mock<GraphqlService>();
    actionsSubject = new ReplaySubject<Action>(1);
  });

  afterEach(() => {
    mockStore.complete();
    actionsSubject.complete();
  });

  function createEffectsInstance() {
    return new ProvidersEffects(
      new Actions(actionsSubject),
      mockStore,
      graphqlService,
    );
  }

  describe('refreshListIfThereIsAChangingState', () => {
    it('should not emit for no classes', fakeAsync(() => {
      const effects = createEffectsInstance();

      const expectations = jest.fn();

      const subscription =
        effects.refreshListIfThereIsAChangingState.subscribe(expectations);

      actionsSubject.next(retrievedProviders({ providers: [] }));
      tick(5000);

      expect(expectations).not.toHaveBeenCalled();
      subscription.unsubscribe();
    }));

    it('should not emit for a non-pending instance', fakeAsync(() => {
      const effects = createEffectsInstance();

      const expectations = jest.fn();

      const subscription =
        effects.refreshListIfThereIsAChangingState.subscribe(expectations);

      actionsSubject.next(
        retrievedProviders({
          providers: createExtensionClass(ServiceStatus.READY),
        }),
      );
      tick(5000);

      expect(expectations).not.toHaveBeenCalled();
      subscription.unsubscribe();
    }));

    it('should emit for a pending instance', fakeAsync(() => {
      const effects = createEffectsInstance();

      const expectations = jest.fn();

      const subscription =
        effects.refreshListIfThereIsAChangingState.subscribe(expectations);

      actionsSubject.next(
        retrievedProviders({
          providers: createExtensionClass(ServiceStatus.IN_DELETION),
        }),
      );

      tick(999);
      expect(expectations).not.toHaveBeenCalled();

      tick(1);
      expect(expectations).toHaveBeenCalledTimes(1);
      expect(expectations).toHaveBeenCalledWith(loadProviders());

      tick(5000);
      expect(expectations).toHaveBeenCalledTimes(1);

      subscription.unsubscribe();
    }));
  });

  describe('loadExtensionClassesForProjectOrTeam', () => {
    const providersMock: ProviderMetadata[] = [
      {
        name: 'extension1',
        displayName: 'extension 1',
        scope: { type: ScopeType.PROJECT },
        configurationMetadata: '',
        instance: null,
        isChangingInstallations: false,
      },
      {
        name: 'extension2',
        displayName: 'extension 2',
        scope: { type: ScopeType.PROJECT },
        configurationMetadata: '',
        instance: null,
        isChangingInstallations: false,
      },
    ];

    it('should call getExtensionClassesForScopesQuery with correct scopes for PROJECT and emit retrievedExtensionClasses', fakeAsync(() => {
      const scope = ScopeType.PROJECT;

      mockStore.overrideSelector(selectScope, scope);
      mockStore.refreshState();

      graphqlService.getExtensionClassesForScopesQuery.mockReturnValue(
        of(providersMock),
      );

      const effects = createEffectsInstance();

      let emittedAction: unknown;
      const subscription = effects.loadProvidersForProjectOrTeam.subscribe(
        (action) => {
          emittedAction = action;
        },
      );

      actionsSubject.next(loadProviders());
      tick();

      expect(
        graphqlService.getExtensionClassesForScopesQuery,
      ).toHaveBeenCalledWith(
        [scope, ScopeType.TENANT, ScopeType.GLOBAL],
        [scope],
      );
      expect(emittedAction).toEqual(
        retrievedProviders({ providers: providersMock }),
      );

      subscription.unsubscribe();
    }));

    it('should not emit for TENANT scope', fakeAsync(() => {
      const scope = ScopeType.TENANT;

      mockStore.overrideSelector(selectScope, scope);
      mockStore.refreshState();

      graphqlService.getExtensionClassesForScopesQuery.mockReturnValue(of([]));

      const effects = createEffectsInstance();

      const expectations = jest.fn();
      const subscription =
        effects.loadProvidersForProjectOrTeam.subscribe(expectations);

      actionsSubject.next(loadProviders());
      tick(100);

      expect(expectations).not.toHaveBeenCalled();
      subscription.unsubscribe();
    }));

    it('should handle errors from getExtensionClassesForScopesQuery by emitting nothing', fakeAsync(() => {
      const scope = ScopeType.PROJECT;

      mockStore.overrideSelector(selectScope, scope);
      mockStore.refreshState();

      graphqlService.getExtensionClassesForScopesQuery.mockReturnValue(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        new (class extends Observable<any> {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          _subscribe(subscriber: any): void {
            subscriber.error(new Error('GraphQL Error'));
          }
        })(),
      );

      const effects = createEffectsInstance();

      const expectations = jest.fn();
      const subscription =
        effects.loadProvidersForProjectOrTeam.subscribe(expectations);

      actionsSubject.next(loadProviders());
      tick(100);

      expect(expectations).not.toHaveBeenCalled();
      subscription.unsubscribe();
    }));
  });

  describe('loadExtensionClassesForTenant', () => {
    const tenantExtensionClassesMock: ProviderMetadata[] = [
      {
        name: 'tenantExtension1',
        displayName: 'Tenant Extension 1',
        scope: { type: ScopeType.TENANT },
        configurationMetadata: '',
        instance: null,
        isChangingInstallations: false,
      },
    ];

    it('should call getExtensionClassesForScopesQuery with correct scopes for TENANT and emit retrievedExtensionClasses', fakeAsync(() => {
      const scope = ScopeType.TENANT;

      mockStore.overrideSelector(selectScope, scope);
      mockStore.refreshState();

      graphqlService.getExtensionClassesForScopesQuery.mockReturnValue(
        of(tenantExtensionClassesMock),
      );

      const effects = createEffectsInstance();

      let emittedAction: unknown;
      const subscription = effects.loadProvidersForTenant.subscribe(
        (action) => {
          emittedAction = action;
        },
      );

      actionsSubject.next(loadProviders());
      tick();

      expect(
        graphqlService.getExtensionClassesForScopesQuery,
      ).toHaveBeenCalledWith([ScopeType.TENANT, ScopeType.GLOBAL], [], {
        excludeHiddenExtensions: true,
        excludeHiddenInGlobalCatalogExtensions: true,
      });
      expect(emittedAction).toEqual(
        retrievedProviders({
          providers: tenantExtensionClassesMock,
        }),
      );
      subscription.unsubscribe();
    }));

    it('should not emit for PROJECT or TEAM scope', fakeAsync(() => {
      const scope = ScopeType.PROJECT;

      mockStore.overrideSelector(selectScope, scope);
      mockStore.refreshState();

      graphqlService.getExtensionClassesForScopesQuery.mockReturnValue(of([]));

      const effects = createEffectsInstance();

      const expectations = jest.fn();
      const subscription =
        effects.loadProvidersForTenant.subscribe(expectations);

      actionsSubject.next(loadProviders());
      tick(100);

      expect(expectations).not.toHaveBeenCalled();
      subscription.unsubscribe();
    }));

    it('should handle errors for TENANT scope by emitting nothing', fakeAsync(() => {
      const scope = ScopeType.TENANT;

      mockStore.overrideSelector(selectScope, scope);
      mockStore.refreshState();

      graphqlService.getExtensionClassesForScopesQuery.mockReturnValue(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        new (class extends Observable<any> {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          _subscribe(subscriber: any): void {
            subscriber.error(new Error('GraphQL Error'));
          }
        })(),
      );

      const effects = createEffectsInstance();

      const expectations = jest.fn();
      const subscription =
        effects.loadProvidersForTenant.subscribe(expectations);

      actionsSubject.next(loadProviders());
      tick(100);

      expect(expectations).not.toHaveBeenCalled();
      subscription.unsubscribe();
    }));
  });
});
