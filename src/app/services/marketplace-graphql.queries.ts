import { gql } from 'apollo-angular';

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
