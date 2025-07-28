import { mock } from 'jest-mock-extended';
import { CustomResource } from 'models/custom.resource';
import { AccountConnectionType } from 'models/index';
import { AccountResources } from 'state/account-resources/account-resources';
import {
  accountResourceSelected,
  accountResourcesLoaded,
} from 'state/account-resources/account-resources-read.action';
import { accountResourcesReducer } from 'state/account-resources/account-resources.reducer';
import { CreditDialogType } from 'state/account-resources/credit-dialog-type';

describe('account account-resources reducer', () => {
  describe('on account resource selected', () => {
    it('should set selected account resource', () => {
      // given
      const state: Readonly<AccountResources> = {
        accountConnectionToResources: [],
      };

      const action = accountResourceSelected({
        providerName: 'providerName',
        extClassScope: 'extClassScope',
        accountType: 'accountType',
        resourceName: 'myResource',
        resourceNamespace: 'myNamespace',
        dialogType: CreditDialogType.CREATE,
      });

      // when
      const newState = accountResourcesReducer(state, action);

      // then
      expect(newState).toEqual({
        accountConnectionToResources: [],
        accountType: 'accountType',
        resourceName: 'myResource',
        resourceNamespace: 'myNamespace',
        dialogType: CreditDialogType.CREATE,
      });
    });
  });

  describe('on account account-resources loaded', () => {
    it('returns if account-resources are not set', () => {
      // given
      const state: Readonly<AccountResources> = {
        accountConnectionToResources: [],
      };

      const action = accountResourcesLoaded({
        resources: [],
        accountConnection: {
          name: 'myAccountConnection',
          description: 'myAccountConnectionDescription',
          displayName: 'myAccountConnectionDisplayName',
          image: { url: 'myAccountConnectionImage' },
          type: mock<AccountConnectionType>(),
        },
      });

      // when
      const newState = accountResourcesReducer(state, action);

      // then
      expect(newState).toEqual({
        accountConnectionToResources: [],
      });
    });

    const firstResource = mock<CustomResource>({
      metadata: { name: 'zfirstResource' },
    });
    const secondResource = mock<CustomResource>({
      metadata: { name: 'aSecondResource' },
    });

    [
      {
        name: 'should set account account-resources',
        given: [firstResource],
        want: [firstResource],
      },
      {
        name: 'should sort account resources',
        given: [firstResource, secondResource],
        want: [secondResource, firstResource],
      },
    ].forEach(({ name, given, want }) => {
      // eslint-disable-next-line jest/valid-title
      it(name, () => {
        // given
        const accountConnectionTypeMock = mock<AccountConnectionType>();
        const accountConnection = {
          name: 'myAccountConnection',
          description: 'myAccountConnectionDescription',
          displayName: 'myAccountConnectionDisplayName',
          image: { url: 'myAccountConnectionImage' },
          type: accountConnectionTypeMock,
        };
        const state: Readonly<AccountResources> = {
          accountConnectionToResources: [
            {
              accountConnection: accountConnection,
              resources: [],
            },
          ],
        };

        const action = accountResourcesLoaded({
          resources: given,
          accountConnection: accountConnection,
        });

        // when
        const newState = accountResourcesReducer(state, action);

        // then
        expect(newState).toEqual({
          accountConnectionToResources: [
            {
              accountConnection: {
                name: 'myAccountConnection',
                description: 'myAccountConnectionDescription',
                displayName: 'myAccountConnectionDisplayName',
                image: { url: 'myAccountConnectionImage' },
                type: accountConnectionTypeMock,
              },
              resources: want,
            },
          ],
        });
      });
    });
  });
});
