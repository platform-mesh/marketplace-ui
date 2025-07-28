import { createReducer, on } from '@ngrx/store';
import { AccountResources } from 'state/account-resources/account-resources';
import {
  accountResourceLoaded,
  accountResourceSelected,
  accountResourcesLoaded,
} from 'state/account-resources/account-resources-read.action';

const initialState: Readonly<AccountResources> = {
  accountType: '',
  accountConnectionToResources: [],
};

export const accountResourcesReducer = createReducer(
  initialState,
  on(accountResourceSelected, (state, newState): Readonly<AccountResources> => {
    return {
      accountType: newState.accountType,
      resourceName: newState.resourceName,
      resourceNamespace: newState.resourceNamespace,
      dialogType: newState.dialogType,
      accountConnectionToResources: state.accountConnectionToResources,
    };
  }),

  on(accountResourceLoaded, (state, newState): Readonly<AccountResources> => {
    if (!newState.resource) {
      return state;
    }

    return {
      accountType: state.accountType,
      resourceName: state.resourceName,
      resourceNamespace: state.resourceNamespace,
      dialogType: state.dialogType,
      accountConnectionToResources: state.accountConnectionToResources,
      editResource: newState.resource,
    };
  }),

  on(
    accountResourcesLoaded,
    (state, { resources, accountConnection: changingAccountConnection }) => {
      if (!resources || resources.length === 0) {
        return state;
      }

      const remainingAccountConnections =
        state.accountConnectionToResources.filter(
          (ac) => ac.accountConnection.name !== changingAccountConnection.name,
        );

      const sortedResources = [...resources];
      sortedResources.sort((a, b) => {
        const aName = a.metadata?.name || '';
        const bName = b.metadata?.name || '';
        return aName.localeCompare(bName);
      });

      return {
        ...state,
        accountConnectionToResources: [
          ...remainingAccountConnections,
          {
            accountConnection: changingAccountConnection,
            resources: sortedResources,
          },
        ],
      };
    },
  ),
);
