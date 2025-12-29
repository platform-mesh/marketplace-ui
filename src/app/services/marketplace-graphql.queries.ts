import { gql } from 'apollo-angular';

export const createAPIBindingMutation = gql`
  mutation($name:String!, $apiExportPath:String!, $apiExportName: String!, $permissionClaims: [APIBindingspecspecpermissionClaimsInput]) {
    apis_kcp_io {
      createAPIBinding(object: {
        metadata: {
          name: $name
        }
        spec: {
          reference: {
            export: {
              name: $apiExportName
              path: $apiExportPath
            }
          }
          permissionClaims: $permissionClaims
        }
      }){metadata{name}}
    }
  }
`

export const deleteAPIBindingMutation = gql`
  mutation($name:String!) {
    apis_kcp_io {
      deleteAPIBinding(name: $name)
    }
  }
`

export const getMarketplaceEntriesQuery = gql`
  {
    marketplace_platform_mesh_io {
      MarketplaceEntries {
        items {
          metadata {
            name
            __typename
          }
          spec {
            installed
            apiExport {
              metadata
              spec {
                permissionClaims {
                  all
                  group
                  identityHash
                  resource
                  __typename
                }
                __typename
              }
              __typename
            }
            providerMetadata {
              spec {
                contacts {
                  displayName
                  email
                  role
                  __typename
                }
                data
                displayName
                description
                documentation {
                  url
                  displayName
                  __typename
                }
                helpCenterData {
                  url
                  displayName
                  __typename
                }
                icon {
                  light {
                    url
                    data
                    __typename
                  }
                  dark {
                    url
                    data
                    __typename
                  }
                  __typename
                }
                links {
                  url
                  displayName
                  __typename
                }
                preferredSupportChannels {
                  url
                  displayName
                  __typename
                }
                tags
                __typename
              }
              __typename
            }
            __typename
          }
          __typename
        }
        __typename
      }
    }
  }
`;