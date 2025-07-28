import { ProviderState } from '../providerState';
import { ExtensionConfigurationWizardConfigSpec } from '@dxp/ngx-core/fundamental-wizard-generator';
import { WizardDefinition } from '@dxp/ngx-core/wizard';
import { createSelector } from '@ngrx/store';
import { WizardConfig } from 'models/wizard-configuration';
import { CreditDialogType } from 'state/account-resources/credit-dialog-type';
import { selectSelectedProvider } from 'state/detail-view.selectors';
import YAML from 'yaml';

const accountResourceState = (state: ProviderState) => {
  return {
    accountResource: state.accountResources,
    extensionClass: state.provider,
  };
};

export const resourceViewState = createSelector(accountResourceState, (x) => {
  return {
    accountResource: x.accountResource,
    accountConnection: x.extensionClass?.accountConnections?.find(
      (y) => y.name === x.accountResource.accountType,
    ),
    extensionClass: x.extensionClass,
  };
});

export const editResourceDefaultValues = createSelector(
  accountResourceState,
  (resourceState) => {
    const editResource = resourceState.accountResource.editResource;
    if (!editResource) {
      return undefined;
    }
    const defaults: Record<string, unknown> = {};
    defaults['metadata'] = editResource.metadata;
    defaults['spec'] = editResource.spec;
    return defaults;
  },
);

export const editResourceWizardConfig = createSelector(
  resourceViewState,
  editResourceDefaultValues,
  (resourceViewState, defaults) => {
    if (
      !resourceViewState.accountConnection?.type?.apiResourceConfig
        ?.wizardConfig?.configData ||
      !resourceViewState.extensionClass
    ) {
      return undefined;
    }

    // no defaults for the edit case yet
    if (
      resourceViewState.accountResource.dialogType === CreditDialogType.EDIT &&
      !defaults
    ) {
      return undefined;
    }

    return {
      dxpWizardConfiguration: JSON.parse(
        resourceViewState.accountConnection.type.apiResourceConfig.wizardConfig
          .configData,
      ) as ExtensionConfigurationWizardConfigSpec,
      wizardDefinition: YAML.parse(
        resourceViewState.accountConnection.type.apiResourceConfig.wizardConfig
          .wizardDefinition,
      ) as WizardDefinition,
    } as WizardConfig;
  },
);

export const customResourceOfCurrentAccount = createSelector(
  selectSelectedProvider,
  resourceViewState,
  (extClass, resourceViewState) => {
    if (!extClass?.accountConnections) {
      return [];
    }

    const accountResource = resourceViewState.accountResource;
    const accountConnectionToResources =
      accountResource.accountConnectionToResources.find(
        (acToResources) =>
          !!extClass.accountConnections?.find(
            (ac) => ac.name === acToResources.accountConnection.name,
          ),
      );
    if (!accountConnectionToResources) {
      return [];
    }

    return accountConnectionToResources.resources;
  },
);
