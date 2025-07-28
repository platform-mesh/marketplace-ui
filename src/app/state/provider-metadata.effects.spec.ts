import {
  loadProviderMetadata,
  retrievedProviderMetadata,
} from './provider-metadata.action';
import { ProviderMetadataEffects } from './provider-metadata.effects';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Action } from '@ngrx/store';
import { Label, ProviderMetadata, ScopeType } from 'models/provider-metadata';
import { MockProvider } from 'ng-mocks';
import { Observable, of } from 'rxjs';
import { GraphqlService } from 'services/graphql.service';
import { ProviderService } from 'services/provider.service';

describe('ProviderMetadataEffects', () => {
  let effects: ProviderMetadataEffects;
  let actions$: Observable<Action>;

  let graphqlService: GraphqlService;
  let providerService: ProviderService;

  beforeEach(() => {
    actions$ = new Observable<Action>();

    TestBed.configureTestingModule({
      providers: [
        provideMockActions(() => actions$),
        MockProvider(GraphqlService),
        MockProvider(ProviderService),
      ],
    });

    effects = TestBed.inject(ProviderMetadataEffects);
    graphqlService = TestBed.inject(GraphqlService);
    providerService = TestBed.inject(ProviderService);
  });

  describe('loadExtensionClass', () => {
    const cases = [
      {
        scope: ScopeType.PROJECT,
        installableIn: [ScopeType.PROJECT, ScopeType.TEAM],
        providerName: 'Test',
      },
      {
        scope: ScopeType.PROJECT,
        installableIn: [ScopeType.GLOBAL, ScopeType.TEAM],
        includeHidden: true,
        providerName: 'Test',
      },
      {
        scope: ScopeType.GLOBAL,
        installableIn: [ScopeType.GLOBAL],
        includeHidden: false,
        providerName: 'Test',
      },
    ];

    cases.forEach((props) => {
      it(`should call graphqlService with correct props`, fakeAsync(() => {
        actions$ = of(loadProviderMetadata(props));
        const spy = jest.spyOn(
          graphqlService,
          'getExtensionClassForScopeQuery',
        );

        effects.loadProviderMetadata.subscribe();
        tick();

        expect(spy).toHaveBeenCalledWith(props.scope, props.providerName, {
          excludeHiddenExtensions: props.includeHidden
            ? !props.includeHidden
            : true,
          installableIn: props.installableIn,
        });
      }));
    });

    it('should emit retrievedExtensionClass with the correct model', fakeAsync(() => {
      const providerMetadata = {
        name: 'providerName',
        displayName: 'extensionDisplayName',
        scope: { type: 'PROJECT' },
        labels: [{ title: 'Test' }],
        instance: { id: 'id', name: 'instance name' },
      } as ProviderMetadata;
      const labels: Label[] = [
        {
          title: 'Test',
          color: '3',
        },
      ];
      const spy = jest
        .spyOn(providerService, 'buildLabels')
        .mockReturnValue(labels);
      jest
        .spyOn(graphqlService, 'getExtensionClassForScopeQuery')
        .mockReturnValue(of(providerMetadata));

      let emittedAction: Action | undefined = undefined;
      actions$ = of(
        loadProviderMetadata({
          scope: ScopeType.GLOBAL,
          installableIn: [ScopeType.GLOBAL],
          providerName: 'providerName',
        }),
      );

      effects.loadProviderMetadata.subscribe(
        (action) => (emittedAction = action),
      );
      tick();

      expect(spy).toHaveBeenCalledWith(providerMetadata);

      expect(emittedAction).toEqual(
        retrievedProviderMetadata({
          providerMetadata: { ...providerMetadata, labels },
        }),
      );
    }));
  });
});
