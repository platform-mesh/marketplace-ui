import { exts } from '../pages/installed-providers/catalog/installed-providers';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { gql } from 'apollo-angular';
import { NodeContext } from 'models/index';
import {
  Account,
  InstallProviderInput,
  ProviderMetadata,
  ProviderMetadataFilter,
  UpdateProviderInput,
} from 'models/provider-metadata';
import { Observable, combineLatest, of } from 'rxjs';
import { filter, first, map, mergeMap } from 'rxjs/operators';
import { luigiContextSelector } from 'services/luigi/state';
import { selectScopeInfo } from 'state/luigi.selectors';

const extensionClassForScopeQuery = gql`
  query getExtensionClassForScope(
    $tenantId: String!
    $type: ScopeType!
    $context: ScopeContext!
    $providerName: String!
    $filter: ExtensionClassFilter
  ) {
    getExtensionClassForScope(
      tenantId: $tenantId
      type: $type
      context: $context
      providerName: $providerName
      filter: $filter
    ) {
      name
      creationTimestamp
      category
      contacts {
        displayName
        email
        role
        contactLink
      }
      labels {
        title
      }
      displayName
      description
      image
      configurationMetadata
      extensionConfig
      provider
      scope {
        type
      }
      instances {
        id
        name
        installationData
        providerData
        isMandatoryExtension
        extensionClass {
          name
          category
          displayName
          image
          icon {
            light {
              url
              data
            }
            dark {
              url
              data
            }
          }
          scope {
            type
          }
          provider
        }
        status
        scope {
          type
        }
        extensionStatus
      }
      installable
      wizardConfig {
        name
        configData
        wizardDefinition
      }
      documentation {
        url
      }
      accountConnections {
        description
        displayName
        name
        image {
          url
        }
        type {
          context
          name
          apiResourceConfig {
            wizardConfig {
              name
              configData
              wizardDefinition
            }
            displayConfig {
              apiServerConfig {
                host
                namespaceRetrievalStrategy
              }
              resourceConfig {
                groupVersion
                kind
              }
              tableConfig {
                columns {
                  name
                  label
                  dataPath
                  hidden
                  textMapping
                  popIn
                  link {
                    target
                    urlPath
                    url
                  }
                  text {
                    style
                  }
                  status {
                    mapping {
                      critical
                      positive
                      negative
                      informative
                      default
                    }
                    tooltipDataPath
                    tooltipDefaultMessage
                  }
                  tags {
                    sort
                  }
                }
                actions {
                  additionalActions {
                    id
                    glyph
                    displayName
                    condition
                    executionPayload {
                      payload
                    }
                    actionSuccessMessage
                    confirmationPopup {
                      title
                      text
                      type
                      acceptButton
                      cancelButton
                    }
                    requiredPolicies
                  }
                  globalActions {
                    id
                    glyph
                    displayName
                    condition
                    actionConfig {
                      type
                      path
                    }
                    requiredPolicies
                  }
                }
                messageStrip {
                  type
                  text
                  noIcon
                  dismissible
                }
              }
              accountAssignmentConfig {
                nameDataPath
                addAccountTitle
                noAccountsFoundTitle
              }
              accountNamingConfig {
                singular
                plural
              }
            }
          }
        }
      }
      icon {
        light {
          url
          data
        }
        dark {
          url
          data
        }
      }
      links {
        displayName
        URL
      }
      mainLink {
        URL
        displayName
      }
      network
      preferredSupportChannels {
        URL
        displayName
      }
      serviceLevel
      template {
        name
        version
      }
      verification {
        type
      }
    }
  }
`;

/*
const extensionClassesForScopesQuery = gql`
  query getExtensionClassesForScopes(
    $tenantId: String!
    $types: [ScopeType]!
    $context: ScopeContext!
    $filter: ExtensionClassFilter
  ) {
    getExtensionClassesForScopes(
      tenantId: $tenantId
      types: $types
      context: $context
      filter: $filter
    ) {
      name
      displayName
      description
      image
      configurationMetadata
      creationTimestamp
      category
      provider
      contacts {
        displayName
        email
        role
        contactLink
      }
      labels {
        title
      }
      links {
        displayName
        URL
      }
      mainLink {
        URL
        displayName
      }
      network
      preferredSupportChannels {
        URL
        displayName
      }
      serviceLevel
      extensionConfig
      scope {
        type
      }
      instances {
        id
        name
        creationTimestamp
        installationData
        providerData
        isMandatoryExtension
        extensionClass {
          name
          category
          displayName
          image
          icon {
            light {
              url
              data
            }
            dark {
              url
              data
            }
          }
          scope {
            type
          }
          provider
        }
        status
        scope {
          type
        }
        extensionStatus
      }
      installable
      wizardConfig {
        name
        configData
        wizardDefinition
      }
      documentation {
        url
      }
      accountConnections {
        description
        displayName
        name
        image {
          url
        }
        type {
          context
          name
          apiResourceConfig {
            wizardConfig {
              name
              configData
              wizardDefinition
            }
            displayConfig {
              apiServerConfig {
                host
                namespaceRetrievalStrategy
              }
              resourceConfig {
                groupVersion
                kind
              }
              tableConfig {
                columns {
                  name
                  label
                  dataPath
                  hidden
                  textMapping
                  popIn
                  link {
                    target
                    urlPath
                    url
                  }
                  text {
                    style
                  }
                  status {
                    mapping {
                      critical
                      positive
                      negative
                      informative
                      default
                    }
                    tooltipDataPath
                    tooltipDefaultMessage
                  }
                  tags {
                    sort
                  }
                }
                actions {
                  additionalActions {
                    id
                    glyph
                    displayName
                    condition
                    executionPayload {
                      payload
                    }
                    actionSuccessMessage
                    confirmationPopup {
                      title
                      text
                      type
                      acceptButton
                      cancelButton
                    }
                    requiredPolicies
                  }
                  globalActions {
                    id
                    glyph
                    displayName
                    condition
                    actionConfig {
                      type
                      path
                    }
                    requiredPolicies
                  }
                }
                messageStrip {
                  type
                  text
                  noIcon
                  dismissible
                }
              }
              accountAssignmentConfig {
                nameDataPath
                addAccountTitle
                noAccountsFoundTitle
              }
              accountNamingConfig {
                singular
                plural
              }
            }
          }
        }
      }
      icon {
        light {
          url
          data
        }
        dark {
          url
          data
        }
      }
      template {
        name
        version
      }
      verification {
        type
      }
    }
  }
`;

*/

const UNINSTALL_EXTENSION = gql`
  mutation uninstallExtension(
    $tenantId: String!
    $scope: String!
    $entity: String!
    $name: String!
  ) {
    uninstallExtension(
      tenantId: $tenantId
      scope: $scope
      entity: $entity
      name: $name
    )
  }
`;

const INSTALL_EXTENSION = gql`
  mutation installExtension(
    $tenantId: String!
    $scope: String!
    $entity: String!
    $input: InstallExtensionInput!
  ) {
    installExtension(
      tenantId: $tenantId
      scope: $scope
      entity: $entity
      input: $input
    ) {
      id
      name
    }
  }
`;

const UPDATE_EXTENSION_INSTANCE = gql`
  mutation updateExtensionInstanceInProject(
    $tenantId: String!
    $scope: String!
    $entity: String!
    $input: UpdateExtensionInput!
  ) {
    updateExtension(
      tenantId: $tenantId
      scope: $scope
      entity: $entity
      input: $input
    )
  }
`;

const ACCOUNT_CONNECTIONS = gql`
  query (
    $tenantId: String!
    $scope: String!
    $entity: String!
    $accountConnectionTypes: [String!]
  ) {
    accountConnectionsForScope(
      tenantId: $tenantId
      scope: $scope
      entity: $entity
      accountConnectionTypes: $accountConnectionTypes
    ) {
      id
      name
      displayName
      type {
        id
        defaultAccount {
          id
          displayName
        }
        displayName
        description
        image
        type {
          Name
        }
      }
      subType
      link
    }
  }
`;

const DELETE_ACCOUNT_CONNECTION = gql`
  mutation deleteAccountConnectionForScope(
    $tenantId: String!
    $scope: String!
    $entity: String!
    $id: String!
  ) {
    deleteAccountConnectionForScope(
      tenantId: $tenantId
      scope: $scope
      entity: $entity
      id: $id
    )
  }
`;

const SET_DEFAULT_ACCOUNT = gql`
  mutation setDefaultAccount(
    $tenantId: String!
    $scope: String!
    $entity: String!
    $accountName: String!
  ) {
    setDefaultAccount(
      tenantId: $tenantId
      scope: $scope
      entity: $entity
      accountName: $accountName
    )
  }
`;

@Injectable({ providedIn: 'root' })
export class GraphqlService {
  private extensionApolloClientService!: any;
  private accountsApolloClientService!: any;

  constructor(private store: Store) {}

  private static createGraphqlContextObject(context: NodeContext): {
    entries: { value: string; key: string }[];
  } {
    const entries = [
      {
        key: 'tenant',
        value: context.tenantid,
      },
    ];

    if (context.projectId) {
      entries.push({
        key: 'project',
        value: context.projectId,
      });
    }

    if (context.teamId) {
      entries.push({
        key: 'team',
        value: context.teamId,
      });
    }

    return {
      entries,
    };
  }

  getExtensionClassForScopeQuery(
    scope: string,
    providerName: string,
    extFilter: ProviderMetadataFilter,
  ): Observable<ProviderMetadata> {
    // todo gkr
    return of(exts[0]);

    // return combineLatest([
    //   this.extensionApolloClientService.apollo(),
    //   this.store.select(luigiContextSelector).pipe(filter((x) => !!x)),
    // ]).pipe(
    //   first(),
    //   mergeMap(([apollo, context]) => {
    //     return apollo
    //       .query<{ getExtensionClassForScope: ProviderMetadata }>({
    //         query: extensionClassForScopeQuery,
    //         variables: {
    //           tenantId: context.tenantid,
    //           type: scope,
    //           context: GraphqlService.createGraphqlContextObject(context),
    //           providerName,
    //           filter: extFilter,
    //         },
    //         fetchPolicy: 'no-cache',
    //       })
    //       .pipe(
    //         map(
    //           (apolloResponse) => apolloResponse.data.getExtensionClassForScope,
    //         ),
    //       );
    //   }),
    // );
  }

  createExtFilter(installableIn?: string[]): ProviderMetadataFilter {
    return installableIn
      ? { installableIn, excludeHiddenExtensions: true }
      : { excludeHiddenExtensions: true };
  }

  getExtensionClassesForScopesQuery(
    scopes: string[],
    installableIn?: string[],
    extFilter?: ProviderMetadataFilter,
  ): Observable<ProviderMetadata[]> {
    if (!extFilter) {
      extFilter = this.createExtFilter(installableIn);
    }

    // todo gkr
    return of(exts);

    // return combineLatest([
    //   this.extensionApolloClientService.apollo(),
    //   this.store.select(luigiContextSelector).pipe(filter((x) => !!x)),
    // ]).pipe(
    //   first(),
    //   mergeMap(([apollo, context]) => {
    //     return apollo
    //       .query<{ getExtensionClassesForScopes: ProviderMetadata[] }>({
    //         query: extensionClassesForScopesQuery,
    //         variables: {
    //           tenantId: context.tenantid,
    //           types: scopes,
    //           context: GraphqlService.createGraphqlContextObject(context),
    //           filter: extFilter,
    //         },
    //         fetchPolicy: 'no-cache',
    //       })
    //       .pipe(
    //         map(
    //           (apolloResponse) =>
    //             apolloResponse.data.getExtensionClassesForScopes,
    //         ),
    //       );
    //   }),
    // );
  }

  installExtension(input: InstallProviderInput): Observable<unknown> {
    console.log('INSTALLED!!!!!');

    return of([]);

    // return combineLatest([
    //   this.extensionApolloClientService.apollo(),
    //   this.store.select(luigiContextSelector).pipe(filter((x) => !!x)),
    //   this.store.select(selectScopeInfo).pipe(filter((x) => !!x)),
    // ]).pipe(
    //   first(),
    //   mergeMap(([apollo, context, scopeInfo]) => {
    //     return apollo.mutate({
    //       mutation: INSTALL_EXTENSION,
    //       variables: {
    //         tenantId: context.tenantid,
    //         scope: scopeInfo?.scopeId,
    //         entity: scopeInfo?.scopeType.toLowerCase(),
    //         input,
    //       },
    //     });
    //   }),
    // );
  }

  unInstallExtension(name: string): Observable<unknown> {
    return of(true);

    // return combineLatest([
    //   this.extensionApolloClientService.apollo(),
    //   this.store.select(luigiContextSelector).pipe(filter((x) => !!x)),
    //   this.store.select(selectScopeInfo).pipe(filter((x) => !!x)),
    // ]).pipe(
    //   first(),
    //   mergeMap(([apollo, context, scopeInfo]) => {
    //     return apollo.mutate({
    //       mutation: UNINSTALL_EXTENSION,
    //       variables: {
    //         tenantId: context.tenantid,
    //         scope: scopeInfo?.scopeId,
    //         entity: scopeInfo?.scopeType.toLowerCase(),
    //         name: name,
    //       },
    //     });
    //   }),
    // );
  }

  updateExtensionInstance(input: UpdateProviderInput): Observable<unknown> {
    return of(true);
    // return combineLatest([
    //   this.extensionApolloClientService.apollo(),
    //   this.store.select(luigiContextSelector).pipe(filter((x) => !!x)),
    //   this.store.select(selectScopeInfo).pipe(filter((x) => !!x)),
    // ]).pipe(
    //   first(),
    //   mergeMap(([apollo, context, scopeInfo]) => {
    //     if (!scopeInfo || !input) {
    //       throw new Error('scopeInfo is undefined');
    //     }
    //     return apollo.mutate({
    //       mutation: UPDATE_EXTENSION_INSTANCE,
    //       variables: {
    //         tenantId: context.tenantid,
    //         scope: scopeInfo.scopeId,
    //         entity: scopeInfo.scopeType.toLowerCase(),
    //         input,
    //       },
    //     });
    //   }),
    // );
  }

  public getAccounts(accountConnectionTypes: string[]): Observable<Account[]> {
    return of([]);

    // return combineLatest([
    //   this.accountsApolloClientService.apollo(),
    //   this.store.select(luigiContextSelector).pipe(filter((x) => !!x)),
    //   this.store.select(selectScopeInfo).pipe(filter((x) => !!x)),
    // ]).pipe(
    //   first(),
    //   mergeMap(([apollo, context, scopeInfo]) => {
    //     return apollo
    //       .query<{ accountConnectionsForScope: Account[] }>({
    //         query: ACCOUNT_CONNECTIONS,
    //         variables: {
    //           tenantId: context.tenantid,
    //           scope: scopeInfo?.scopeId,
    //           entity: scopeInfo?.scopeType.toLowerCase(),
    //           accountConnectionTypes,
    //         },
    //         fetchPolicy: 'no-cache',
    //       })
    //       .pipe(
    //         map(
    //           (apolloResponse) =>
    //             apolloResponse.data.accountConnectionsForScope,
    //         ),
    //       );
    //   }),
    // );
  }

  public deleteAccountConnection(id: string): Observable<boolean> {
    return of(true);

    // return combineLatest([
    //   this.accountsApolloClientService.apollo(),
    //   this.store.select(luigiContextSelector).pipe(filter((x) => !!x)),
    //   this.store.select(selectScopeInfo).pipe(filter((x) => !!x)),
    // ]).pipe(
    //   first(),
    //   mergeMap(([apollo, context, scopeInfo]) => {
    //     return apollo
    //       .mutate<{ deleteAccountConnectionForScope: boolean }>({
    //         mutation: DELETE_ACCOUNT_CONNECTION,
    //         variables: {
    //           tenantId: context.tenantid,
    //           scope: scopeInfo?.scopeId,
    //           entity: scopeInfo?.scopeType.toLowerCase(),
    //           id,
    //         },
    //       })
    //       .pipe(
    //         map(
    //           (apolloResponse) =>
    //             apolloResponse.data?.deleteAccountConnectionForScope ?? false,
    //         ),
    //       );
    //   }),
    // );
  }

  public setDefaultAccount(accountName: string): Observable<boolean> {
    return of(true);
    // return combineLatest([
    //   this.accountsApolloClientService.apollo(),
    //   this.store.select(luigiContextSelector).pipe(filter((x) => !!x)),
    //   this.store.select(selectScopeInfo).pipe(filter((x) => !!x)),
    // ]).pipe(
    //   first(),
    //   mergeMap(([apollo, context, scopeInfo]) => {
    //     return apollo
    //       .mutate<{ setDefaultAccount: boolean }>({
    //         mutation: SET_DEFAULT_ACCOUNT,
    //         variables: {
    //           tenantId: context.tenantid,
    //           scope: scopeInfo?.scopeId,
    //           entity: scopeInfo?.scopeType.toLowerCase(),
    //           accountName,
    //         },
    //       })
    //       .pipe(
    //         map(
    //           (apolloResponse) =>
    //             apolloResponse.data?.setDefaultAccount ?? false,
    //         ),
    //       );
    //   }),
    // );
  }
}
