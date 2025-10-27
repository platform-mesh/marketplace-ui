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
        metadata {
          name
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
              }
            }
          }
          providerMetadata {
            spec {
              contacts {
                displayName
                email
                role
              }
              data
              displayName
              description
              documentation {
                url
                displayName
              }
              helpCenterData {
                url
                displayName
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
                url
                displayName
              }
              preferredSupportChannels {
                url
                displayName
              }
              tags
            }
          }
        }
      }
    }
  }
`;
