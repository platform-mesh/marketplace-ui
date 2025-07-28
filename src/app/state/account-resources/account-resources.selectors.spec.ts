import { mock } from 'jest-mock-extended';
import { CustomResource } from 'models/custom.resource';
import {
  APIResourceConfig,
  AccountConnection,
  AccountConnectionType,
  ProviderMetadata,
  ProviderWizardConfig,
} from 'models/index';
import { AccountResources } from 'state/account-resources/account-resources';
import {
  customResourceOfCurrentAccount,
  editResourceDefaultValues,
  editResourceWizardConfig,
  resourceViewState,
} from 'state/account-resources/account-resources.selectors';
import { CreditDialogType } from 'state/account-resources/credit-dialog-type';

describe('Account account-resources selectors', () => {
  describe('resourceViewState', function () {
    it('should return no account connection, if its not found', () => {
      // given
      const extensionClassMock = mock<ProviderMetadata>({
        accountConnections: [{ name: 'accountType' }],
      });

      const accountResourceMock = mock<AccountResources>({
        accountType: 'differentAccountType',
      });
      const accountResourceState = {
        accountResource: accountResourceMock,
        extensionClass: extensionClassMock,
      };

      // when
      const result = resourceViewState.projector(accountResourceState);

      // then
      expect(result).toEqual({
        accountConnection: undefined,
        accountResource: accountResourceMock,
        extensionClass: extensionClassMock,
      });
    });

    it('should return an account connection', () => {
      // given
      const expectedAccountConnection = { name: 'accountType' };
      const extensionClassMock = mock<ProviderMetadata>({
        accountConnections: [expectedAccountConnection],
      });

      const accountResourceMock = mock<AccountResources>({
        accountType: 'accountType',
      });
      const accountResourceState = {
        accountResource: accountResourceMock,
        extensionClass: extensionClassMock,
      };

      // when
      const result = resourceViewState.projector(accountResourceState);

      // then
      expect(result).toEqual({
        accountConnection: expectedAccountConnection,
        accountResource: accountResourceMock,
        extensionClass: extensionClassMock,
      });
    });
  });

  describe('customResourceOfCurrentAccount', function () {
    it('should return empty array if no account connections', () => {
      // given
      const extensionClassMock = mock<ProviderMetadata>({
        accountConnections: undefined,
      });

      // when
      const result = customResourceOfCurrentAccount.projector(
        extensionClassMock,
        {
          accountResource: mock<AccountResources>(),
          accountConnection: mock<AccountConnection>(),
          extensionClass: mock<ProviderMetadata>(),
        },
      );

      // then
      expect(result).toEqual([]);
    });

    it('should return empty array if no account connection to account-resources', () => {
      // given
      const accountResourceMock = mock<AccountResources>({
        accountConnectionToResources: [],
      });
      const extensionClassMock = mock<ProviderMetadata>({
        accountConnections: [{ name: 'accountType' }],
      });

      // when
      const result = customResourceOfCurrentAccount.projector(
        extensionClassMock,
        {
          accountResource: accountResourceMock,
          accountConnection: mock<AccountConnection>(),
          extensionClass: mock<ProviderMetadata>(),
        },
      );

      // then
      expect(result).toEqual([]);
    });

    it('should return the account-resources if an account connection is found', () => {
      // given
      const customResourceMock = mock<CustomResource>();
      const accountResourceMock = mock<AccountResources>({
        accountConnectionToResources: [
          {
            accountConnection: { name: 'accountType' },
            resources: [customResourceMock],
          },
        ],
      });
      const extensionClassMock = mock<ProviderMetadata>({
        accountConnections: [{ name: 'accountType' }],
      });

      // when
      const result = customResourceOfCurrentAccount.projector(
        extensionClassMock,
        {
          accountResource: accountResourceMock,
          accountConnection: mock<AccountConnection>(),
          extensionClass: mock<ProviderMetadata>(),
        },
      );

      // then
      expect(result[0]).toEqual(customResourceMock);
    });
  });

  describe('editResourceDefaultValues', function () {
    [
      {
        testName: 'it should return undefined, if there is no editResource',
        editResource: undefined,
        wants: undefined,
      },
      {
        testName: 'it should return the spec, if there is one',
        editResource: { spec: { foo: 'bar' } },
        wants: { spec: { foo: 'bar' } },
      },
      {
        testName: 'it should return the metadata, if there is one',
        editResource: { metadata: { name: 'test' } },
        wants: { metadata: { name: 'test' } },
      },
      {
        testName:
          'it should return both spec and metadata, if both are present',
        editResource: { spec: { foo: 'bar' }, metadata: { name: 'test' } },
        wants: { spec: { foo: 'bar' }, metadata: { name: 'test' } },
      },
    ].forEach(({ testName, editResource, wants }) => {
      // eslint-disable-next-line jest/valid-title
      it(testName, () => {
        // given
        const accountResourceMock = mock<AccountResources>({
          editResource,
        });

        // when
        const result = editResourceDefaultValues.projector({
          accountResource: accountResourceMock,
          extensionClass: undefined,
        });

        // then
        if (wants === undefined) {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(result).toBeUndefined();
        } else {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(result).toMatchObject(wants);
        }
      });
    });
  });

  describe('editResourceWizardConfig', function () {
    [
      {
        testName: 'it should return undefined, if there is no wizardConfig',
        wizardConfig: {
          configData: '',
          wizardDefinition: '',
        },
        dialogType: CreditDialogType.CREATE,
        defaults: undefined,
        wants: undefined,
      },
      {
        testName: 'it should return the wizard config',
        wizardConfig: {
          configData: '{"foo": "bar"}',
          wizardDefinition: '',
        },
        dialogType: CreditDialogType.CREATE,
        defaults: undefined,
        wants: {
          dxpWizardConfiguration: {
            foo: 'bar',
          },
          wizardDefinition: null,
        },
      },
      {
        testName:
          'it should not return the wizard config if its still waiting for defaults',
        wizardConfig: {
          configData: '{"foo": "bar"}',
          wizardDefinition: '',
        },
        dialogType: CreditDialogType.EDIT,
        defaults: undefined,
        wants: undefined,
      },
      {
        testName: 'it should return the wizard config if there are defaults',
        wizardConfig: {
          configData: '{"foo": "bar"}',
          wizardDefinition: '',
        },
        dialogType: CreditDialogType.EDIT,
        defaults: { some: 'default' },
        wants: {
          dxpWizardConfiguration: {
            foo: 'bar',
          },
          wizardDefinition: null,
        },
      },
      {
        testName: 'it should return the wizard definition',
        wizardConfig: {
          configData: '{"foo": "bar"}',
          wizardDefinition: 'kind: WizardDefinition',
        },
        dialogType: CreditDialogType.EDIT,
        defaults: { some: 'default' },
        wants: {
          dxpWizardConfiguration: {
            foo: 'bar',
          },
          wizardDefinition: {
            kind: 'WizardDefinition',
          },
        },
      },
    ].forEach(({ testName, wizardConfig, dialogType, defaults, wants }) => {
      // eslint-disable-next-line jest/valid-title
      it(testName, () => {
        // given
        const accountConnectionMock = mock<AccountConnection>({
          type: mock<AccountConnectionType>({
            apiResourceConfig: mock<APIResourceConfig>({
              wizardConfig: mock<ProviderWizardConfig>({
                configData: wizardConfig.configData,
                wizardDefinition: wizardConfig.wizardDefinition,
              }),
            }),
          }),
        });
        const accountResourcesMock = mock<AccountResources>({
          dialogType,
        });

        // when
        const result = editResourceWizardConfig.projector(
          {
            accountResource: accountResourcesMock,
            accountConnection: accountConnectionMock,
            extensionClass: mock<ProviderMetadata>(),
          },
          defaults,
        );

        // then
        expect(result).toEqual(wants);
      });
    });
  });
});
