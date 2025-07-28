import { retrievedProviders } from './providers.actions';
import { providersReducer } from './providers.reducer';
import { ScopeType } from 'models/provider-metadata';

describe('providerMetadataReducer', () => {
  it('should sort extension classes by display name', () => {
    // given
    const action = retrievedProviders({
      providers: [
        {
          name: 'extensionClassName-1',
          displayName: 'a',
          instance: null,
          scope: { type: ScopeType.PROJECT },
          configurationMetadata: '',
          isChangingInstallations: false,
        },
        {
          name: 'extensionClassName-2',
          displayName: 'b',
          instance: null,
          scope: { type: ScopeType.PROJECT },
          configurationMetadata: '',
          isChangingInstallations: false,
        },
        {
          name: 'extensionClassName-3',
          displayName: 'c',
          instance: null,
          scope: { type: ScopeType.PROJECT },
          configurationMetadata: '',
          isChangingInstallations: false,
        },
      ],
    });

    // when
    const newState = providersReducer([], action);

    // then
    expect(newState).toEqual([
      {
        name: 'extensionClassName-1',
        displayName: 'a',
        instance: null,
        scope: { type: ScopeType.PROJECT },
        configurationMetadata: '',
        isChangingInstallations: false,
      },
      {
        name: 'extensionClassName-2',
        displayName: 'b',
        instance: null,
        scope: { type: ScopeType.PROJECT },
        configurationMetadata: '',
        isChangingInstallations: false,
      },
      {
        name: 'extensionClassName-3',
        displayName: 'c',
        instance: null,
        scope: { type: ScopeType.PROJECT },
        configurationMetadata: '',
        isChangingInstallations: false,
      },
    ]);
  });
});
